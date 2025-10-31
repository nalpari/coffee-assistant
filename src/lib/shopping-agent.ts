/**
 * ShoppingAgent
 * AI 쇼핑 어시스턴트 핵심 로직
 */

import { claude, CLAUDE_CONFIG, SHOPPING_ASSISTANT_PROMPT, formatConversationHistory } from './claude-client';
import { supabase } from './supabase';
import type {
  ConversationContext,
  AIResponse,
  UserPurchaseFrequency,
  Product,
} from '@/types/shopping-agent';
import type { CartItem } from '@/types/cart';

export class ShoppingAgent {
  /**
   * 메인 처리 함수
   */
  async processMessage(
    context: ConversationContext,
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // 컨텍스트 정보 준비
      const contextInfo = await this.prepareContextInfo(context);

      // 전체 프롬프트 생성
      const fullPrompt = this.createFullPrompt(contextInfo, userMessage);

      // Claude API 호출
      const response = await claude.messages.create({
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.max_tokens,
        temperature: CLAUDE_CONFIG.temperature,
        system: SHOPPING_ASSISTANT_PROMPT,
        messages: [
          ...formatConversationHistory(
            context.conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
          ),
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      // 응답 파싱
      const aiResponse = this.parseClaudeResponse(response.content[0]);

      return aiResponse;
    } catch (error) {
      console.error('Shopping agent error:', error);
      return {
        action: 'chat',
        message: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
      };
    }
  }

  /**
   * 컨텍스트 정보 준비
   */
  private async prepareContextInfo(context: ConversationContext): Promise<string> {
    const { userId, cart, frequentProducts } = context;

    // 제품 목록 조회
    const { data: products } = await supabase
      .from('menu_items')
      .select('*')
      .gt('stock', 0)
      .limit(20);

    let contextInfo = `사용자 ID: ${userId}\n\n`;

    // 현재 장바구니 정보
    if (cart.length > 0) {
      contextInfo += `현재 장바구니:\n`;
      cart.forEach((item) => {
        const price = item.discountPrice ?? item.price;
        contextInfo += `- ${item.name}: ${item.quantity}개 (${price.toLocaleString()}원)\n`;
      });
      const total = cart.reduce((sum, item) => {
        const price = item.discountPrice ?? item.price;
        return sum + price * item.quantity;
      }, 0);
      contextInfo += `총 금액: ${total.toLocaleString()}원\n\n`;
    } else {
      contextInfo += `현재 장바구니: 비어있음\n\n`;
    }

    // 자주 구매하는 제품
    if (frequentProducts.length > 0) {
      contextInfo += `자주 구매하는 제품:\n`;
      frequentProducts.forEach((product) => {
        contextInfo += `- ${product.product_name} (${product.purchase_count}회 구매)\n`;
      });
      contextInfo += `\n`;
    }

    // 현재 판매 중인 제품 목록
    if (products && products.length > 0) {
      contextInfo += `현재 판매 중인 제품:\n`;
      products.forEach((product) => {
        const price = product.discount_price ?? product.price;
        contextInfo += `- ID: ${product.id}, 이름: ${product.name}, 가격: ${price.toLocaleString()}원, 카테고리: ${product.category_name || '기타'}\n`;
      });
      contextInfo += `\n`;
    }

    return contextInfo;
  }

  /**
   * 전체 프롬프트 생성
   */
  private createFullPrompt(contextInfo: string, userMessage: string): string {
    return `${contextInfo}사용자 메시지: ${userMessage}`;
  }

  /**
   * Claude 응답 파싱
   */
  private parseClaudeResponse(content: unknown): AIResponse {
    try {
      let responseText = '';
      if (typeof content === 'string') {
        responseText = content;
      } else if (
        typeof content === 'object' &&
        content !== null &&
        'type' in content &&
        content.type === 'text' &&
        'text' in content
      ) {
        responseText = content.text as string;
      } else {
        throw new Error('Unexpected response format from Claude');
      }

      // JSON 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      // 유효성 검증
      const validActions = [
        'recommend',
        'add_to_cart',
        'remove_from_cart',
        'checkout',
        'chat',
      ];

      if (!validActions.includes(parsedResponse.action)) {
        parsedResponse.action = 'chat';
      }

      return {
        action: parsedResponse.action,
        message: parsedResponse.message || '응답을 처리할 수 없습니다.',
        products: parsedResponse.products,
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return {
        action: 'chat',
        message: '응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
      };
    }
  }

  /**
   * 사용자의 자주 구매하는 제품 조회
   */
  async getUserFrequentProducts(userId: string): Promise<UserPurchaseFrequency[]> {
    try {
      // 주문 이력에서 자주 구매하는 제품 조회
      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(*))')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!orders || orders.length === 0) {
        return [];
      }

      // 제품별 구매 횟수 집계
      const productFrequency = new Map<string, UserPurchaseFrequency>();

      orders.forEach((order) => {
        order.order_items?.forEach((item) => {
          const productId = item.product_id;
          const product = item.menu_items;

          if (product) {
            if (productFrequency.has(productId)) {
              const freq = productFrequency.get(productId)!;
              freq.purchase_count += 1;
              if (new Date(order.created_at) > new Date(freq.last_purchased)) {
                freq.last_purchased = order.created_at;
              }
            } else {
              productFrequency.set(productId, {
                user_id: userId,
                product_id: productId,
                product_name: product.name,
                price: product.price,
                purchase_count: 1,
                last_purchased: order.created_at,
              });
            }
          }
        });
      });

      // 구매 횟수 순으로 정렬하여 상위 10개 반환
      const result = Array.from(productFrequency.values())
        .sort((a, b) => b.purchase_count - a.purchase_count)
        .slice(0, 10);

      return result;
    } catch (error) {
      console.error('Error fetching frequent products:', error);
      return [];
    }
  }

  /**
   * 제품 ID 목록으로 제품 정보 조회
   */
  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    try {
      const { data: products } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', productIds);

      if (!products) {
        return [];
      }

      return products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category_name,
        image_url: p.image_url,
        created_at: p.created_at,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * 장바구니 아이템 유효성 검증 (재고 확인)
   */
  async validateCartItems(cartItems: CartItem[]): Promise<CartItem[]> {
    try {
      const productIds = cartItems.map((item) => item.id);
      const { data: products } = await supabase
        .from('menu_items')
        .select('id, stock')
        .in('id', productIds);

      if (!products) {
        return cartItems;
      }

      // 재고가 충분한 아이템만 반환
      return cartItems.filter((item) => {
        const product = products.find((p) => p.id === item.id);
        return product && product.stock >= item.quantity;
      });
    } catch (error) {
      console.error('Error validating cart items:', error);
      return cartItems;
    }
  }
}
