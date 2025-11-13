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

    // 제품 목록 조회 (menu 테이블 사용, status로 판매 가능 여부 판단)
    const { data: products } = await supabase
      .from('menu')
      .select(`
        id,
        name,
        description,
        price,
        discount_price,
        status,
        category_id,
        category:category_id (
          id,
          name
        )
      `)
      .eq('status', 'E0101') // E0101 = 사용(판매중)
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

    // 최근 주문 내역 (NEW)
    const recentOrders = await this.getUserOrders(userId, 3);
    if (recentOrders.length > 0) {
      contextInfo += `최근 주문 내역 (최근 3건):\n`;
      recentOrders.forEach((order) => {
        const itemCount = Array.isArray(order.items) ? order.items.length : 0;
        const statusLabel = this.getOrderStatusLabel(order.status);
        contextInfo += `- 주문번호: ${order.order_number}\n`;
        contextInfo += `  상태: ${statusLabel} (${order.status})\n`;
        contextInfo += `  아이템: ${itemCount}개\n`;
        contextInfo += `  금액: ${order.final_amount.toLocaleString()}원\n`;
        contextInfo += `  날짜: ${new Date(order.created_at).toLocaleString('ko-KR')}\n\n`;
      });
    } else {
      contextInfo += `최근 주문 내역: 없음\n\n`;
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
        const categoryName = (product.category && typeof product.category === 'object' && 'name' in product.category)
          ? product.category.name
          : '기타';
        contextInfo += `- ID: ${product.id}, 이름: ${product.name}, 가격: ${price.toLocaleString()}원, 카테고리: ${categoryName}\n`;
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

      // 유효성 검증 (주문 액션 추가)
      const validActions = [
        'recommend',
        'add_to_cart',
        'remove_from_cart',
        'checkout',
        'get_orders',
        'get_order_status',
        'select_store',
        'chat',
      ];

      if (!validActions.includes(parsedResponse.action)) {
        parsedResponse.action = 'chat';
      }

      return {
        action: parsedResponse.action,
        message: parsedResponse.message || '응답을 처리할 수 없습니다.',
        products: parsedResponse.products,
        orderNumber: parsedResponse.orderNumber,
        menuName: parsedResponse.menuName,
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
        .select('*, order_items(*, menu:menu_id(*))')
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
        if (Array.isArray(order.order_items)) {
          order.order_items.forEach((item: { menu_id: number; menu?: { name: string; price: number } }) => {
            const menuId = item.menu_id;
            const product = item.menu;

            if (product) {
              const menuIdStr = menuId.toString();
              if (productFrequency.has(menuIdStr)) {
                const freq = productFrequency.get(menuIdStr)!;
                freq.purchase_count += 1;
                if (new Date(order.created_at) > new Date(freq.last_purchased)) {
                  freq.last_purchased = order.created_at;
                }
              } else {
                productFrequency.set(menuIdStr, {
                  user_id: userId,
                  product_id: menuIdStr,
                  product_name: product.name,
                  price: product.price,
                  purchase_count: 1,
                  last_purchased: order.created_at,
                });
              }
            }
          });
        }
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
        .from('menu')
        .select(`
          id,
          name,
          description,
          price,
          discount_price,
          status,
          category_id,
          category:category_id (
            id,
            name
          )
        `)
        .in('id', productIds.map(id => parseInt(id)));

      if (!products) {
        return [];
      }

      // 이미지 별도 조회
      const menuIds = products.map(p => p.id);
      const { data: images } = await supabase
        .from('image')
        .select('*')
        .in('menu_id', menuIds)
        .order('menu_id', { ascending: true })
        .order('ordering', { ascending: true });

      interface ImageData {
        menu_id: number;
        file_uuid: string;
        menu_type: string;
      }

      const imagesByMenuId = new Map<number, ImageData[]>();
      if (images) {
        images.forEach((img: ImageData) => {
          if (!imagesByMenuId.has(img.menu_id)) {
            imagesByMenuId.set(img.menu_id, []);
          }
          imagesByMenuId.get(img.menu_id)!.push(img);
        });
      }

      interface ProductData {
        id: number;
        name: string;
        description: string | null;
        price: number;
        discount_price: number | null;
        status: string;
        category?: { name: string } | null;
        created_date: string;
      }

      return (products as unknown as ProductData[]).map((p: ProductData) => {
        const menuImages = imagesByMenuId.get(p.id) || [];
        const firstImage = menuImages[0];
        let imageUrl: string | null = null;

        if (firstImage && firstImage.file_uuid && firstImage.menu_type) {
          try {
            imageUrl = `https://bo.heemina.co.kr/minio/images/${firstImage.menu_type}/${firstImage.file_uuid}`;
          } catch (error) {
            console.warn(`Invalid image URL for menu ${p.id}:`, error);
          }
        }

        return {
          id: p.id.toString(),
          name: p.name,
          description: p.description || '',
          price: p.price,
          stock: p.status === 'E0101' ? 999 : 0, // status로 판단 (E0101 = 사용/판매중)
          category: p.category?.name || '',
          image_url: imageUrl,
          created_at: p.created_date || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * 장바구니 아이템 유효성 검증 (판매 가능 여부 확인)
   */
  async validateCartItems(cartItems: CartItem[]): Promise<CartItem[]> {
    try {
      const productIds = cartItems.map((item) => item.id);
      const { data: products } = await supabase
        .from('menu')
        .select('id, status')
        .in('id', productIds);

      if (!products) {
        return cartItems;
      }

      // 판매 중인 아이템만 반환 (status = 'E0101' = 사용/판매중)
      return cartItems.filter((item) => {
        const product = products.find((p) => p.id === item.id);
        return product && product.status === 'E0101';
      });
    } catch (error) {
      console.error('Error validating cart items:', error);
      return cartItems;
    }
  }

  /**
   * 사용자의 주문 내역 조회 (NEW)
   */
  async getUserOrders(userId: string, limit: number = 10): Promise<Array<{
    id: number;
    order_number: string;
    status: string;
    final_amount: number;
    created_at: string;
    items?: unknown[];
    order_items?: Array<{ menu_id: number; menu?: { name: string; price: number } }>;
    store?: { id: number; name: string; address: string | null; phone: string | null } | null;
  }>> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          store:stores (
            id,
            name,
            address,
            phone
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get user orders error:', error);
        return [];
      }

      return orders || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  /**
   * 주문번호로 특정 주문 조회 (NEW)
   */
  async getOrderByNumber(userId: string, orderNumber: string): Promise<{
    id: number;
    order_number: string;
    status: string;
    final_amount: number;
    created_at: string;
    items?: unknown[];
  } | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error('Get order by number error:', error);
        return null;
      }

      return order;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      return null;
    }
  }

  /**
   * 주문 상태 라벨 변환 (NEW)
   */
  private getOrderStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      pending: '주문 접수',
      confirmed: '주문 확인',
      preparing: '준비 중',
      ready: '준비 완료',
      completed: '픽업 완료',
      cancelled: '취소됨',
    };
    return statusLabels[status] || status;
  }
}
