/**
 * Shopping Agent Chat API
 * Claude AI 기반 쇼핑 어시스턴트 API 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import { ShoppingAgent } from '@/lib/shopping-agent';
import { conversationManager } from '@/lib/conversation-manager';
import { getServerSession } from '@/lib/supabase-server';
import type { ChatRequest, ChatResponse, ChatMessage } from '@/types/shopping-agent';

const shoppingAgent = new ShoppingAgent();

export async function POST(req: NextRequest) {
  try {
    // 1. 세션 확인 및 사용자 인증
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to use AI recommendations' },
        { status: 401 }
      );
    }

    // 2. 인증된 사용자 ID 추출
    const userId = session.user.id;

    const body: ChatRequest = await req.json();
    const { message, cart } = body;

    // 3. 메시지 검증
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

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

    // 액션 처리 (장바구니 업데이트 및 주문 조회)
    let updatedCart = context.cart;
    let orders = undefined;
    let order = undefined;

    if (aiResponse.action === 'add_to_cart' && aiResponse.products) {
      const productIds = aiResponse.products.map((p) => p.id);
      const products = await shoppingAgent.getProductsByIds(productIds);

      for (const productAction of aiResponse.products) {
        const product = products.find((p) => p.id === productAction.id);
        if (product && product.stock >= productAction.quantity) {
          updatedCart = conversationManager.addToCart(userId, {
            id: parseInt(product.id),
            name: product.name,
            description: product.description || '',
            price: product.price,
            discountPrice: undefined,
            image: product.image_url,
            images: [],
            category: product.category || '',
            categoryId: undefined,
            tags: [],
            available: true,
            popular: false,
            cold: false,
            hot: false,
            orderNo: 0,
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
    } else if (aiResponse.action === 'get_orders') {
      // 주문 내역 조회
      orders = await shoppingAgent.getUserOrders(userId, 10);
    } else if (aiResponse.action === 'get_order_status' && aiResponse.orderNumber) {
      // 특정 주문 상태 조회
      order = await shoppingAgent.getOrderByNumber(userId, aiResponse.orderNumber);
    }

    // 장바구니 유효성 검증
    updatedCart = await shoppingAgent.validateCartItems(updatedCart);
    conversationManager.updateCart(userId, updatedCart);

    const response: ChatResponse = {
      message: aiResponse.message,
      action: aiResponse.action,
      cart: updatedCart,
      products: aiResponse.products,
      orders,
      order,
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
