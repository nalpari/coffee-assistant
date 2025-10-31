/**
 * Shopping Agent Chat API
 * Claude AI 기반 쇼핑 어시스턴트 API 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import { ShoppingAgent } from '@/lib/shopping-agent';
import { conversationManager } from '@/lib/conversation-manager';
import type { ChatRequest, ChatResponse, ChatMessage } from '@/types/shopping-agent';

const shoppingAgent = new ShoppingAgent();

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, cart } = body;

    // 검증
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 임시 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
    const userId = 'guest-user';

    // 컨텍스트 가져오기
    const context = conversationManager.getContext(userId);

    // 장바구니 업데이트
    if (cart) {
      conversationManager.updateCart(userId, cart);
    }

    // 자주 구매 제품 로드 (처음 한 번만)
    if (context.frequentProducts.length === 0) {
      const frequentProducts = await shoppingAgent.getUserFrequentProducts(userId);
      conversationManager.updateFrequentProducts(userId, frequentProducts);
    }

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    conversationManager.addMessage(userId, userMessage);

    // AI 응답 생성
    const aiResponse = await shoppingAgent.processMessage(context, message);

    // AI 메시지 추가
    const aiMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date(),
    };
    conversationManager.addMessage(userId, aiMessage);

    // 액션 처리 (장바구니 업데이트)
    let updatedCart = context.cart;

    if (aiResponse.action === 'add_to_cart' && aiResponse.products) {
      const productIds = aiResponse.products.map((p) => p.id);
      const products = await shoppingAgent.getProductsByIds(productIds);

      for (const productAction of aiResponse.products) {
        const product = products.find((p) => p.id === productAction.id);
        if (product && product.stock >= productAction.quantity) {
          updatedCart = conversationManager.addToCart(userId, {
            id: parseInt(product.id),
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: null,
            categoryId: null,
            categoryName: product.category,
            imageUrl: product.image_url,
            stock: product.stock,
            quantity: productAction.quantity,
          });
        }
      }
    } else if (aiResponse.action === 'remove_from_cart' && aiResponse.products) {
      for (const productAction of aiResponse.products) {
        updatedCart = conversationManager.removeFromCart(
          userId,
          productAction.id,
          productAction.quantity
        );
      }
    }

    // 장바구니 유효성 검증
    updatedCart = await shoppingAgent.validateCartItems(updatedCart);
    conversationManager.updateCart(userId, updatedCart);

    const response: ChatResponse = {
      message: aiResponse.message,
      action: aiResponse.action,
      cart: updatedCart,
      products: aiResponse.products,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
