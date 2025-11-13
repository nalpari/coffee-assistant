/**
 * Shopping Agent Chat API
 * Claude AI 기반 쇼핑 어시스턴트 API 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import { ShoppingAgent } from '@/lib/shopping-agent';
import { conversationManager } from '@/lib/conversation-manager';
import { getServerSession, createSupabaseServerClient } from '@/lib/supabase-server';
import { createOrder } from '@/app/actions/order';
import { processPayment } from '@/app/actions/payment';
import type { ChatRequest, ChatResponse, ChatMessage, Order } from '@/types/shopping-agent';

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
    let orders: Order[] | undefined = undefined;
    let order: Order | undefined = undefined;
    
    // 사용자 메시지에 "결제", "주문", "구매" 등의 단어가 포함되어 있는지 확인
    const hasCheckoutIntent = /결제|주문|구매/.test(message.toLowerCase());

    if (aiResponse.action === 'add_to_cart' && aiResponse.products) {
      const productIds = aiResponse.products.map((p) => p.id);
      const products = await shoppingAgent.getProductsByIds(productIds);

      for (const productAction of aiResponse.products) {
        const product = products.find((p) => p.id === productAction.id);
        if (product && product.stock >= productAction.quantity) {
          // 메뉴 상세 정보 조회 (discount_price, category_id 등)
          const supabase = await createSupabaseServerClient();
          const { data: menuData } = await supabase
            .from('menu')
            .select(`
              id,
              discount_price,
              category_id,
              cold,
              hot,
              marketing,
              order_no
            `)
            .eq('id', parseInt(product.id))
            .single();

          updatedCart = conversationManager.addToCart(userId, {
            id: parseInt(product.id),
            name: product.name,
            description: product.description || '',
            price: product.price,
            discountPrice: menuData?.discount_price || undefined,
            image: product.image_url || null,
            images: [],
            category: product.category || '',
            categoryId: menuData?.category_id || undefined,
            tags: menuData?.marketing || [],
            available: true,
            popular: (menuData?.marketing || []).includes('E0202'), // E0202 = Best
            cold: menuData?.cold || false,
            hot: menuData?.hot || false,
            orderNo: menuData?.order_no || 0,
            quantity: productAction.quantity,
          });
        }
      }
      
      // 결제 의도가 있고 장바구니에 아이템이 추가되었으면 자동으로 결제 진행
      if (hasCheckoutIntent && updatedCart.length > 0) {
        // add_to_cart 후 자동으로 checkout 처리
        // 사용자 정보 가져오기
        const userEmail = session.user.email || '';
        const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '고객';
        const userPhone = session.user.phone || '010-0000-0000'; // 기본값 사용

        // 장바구니 아이템을 주문 형식으로 변환
        const orderItems = updatedCart.map(item => ({
          menuId: item.id,
          menuName: item.name,
          menuPrice: item.discountPrice ?? item.price,
          quantity: item.quantity,
          temperature: (item.cold ? 'cold' : item.hot ? 'hot' : undefined) as 'hot' | 'cold' | undefined,
        }));

        // 총 금액 계산
        const totalAmount = updatedCart.reduce((sum, item) => {
          const price = item.discountPrice ?? item.price;
          return sum + price * item.quantity;
        }, 0);

        // 주문 생성
        const orderResult = await createOrder({
          customerName: userName,
          customerPhone: userPhone,
          customerEmail: userEmail || undefined,
          items: orderItems,
          totalAmount,
          discountAmount: 0,
          orderNotes: 'AI 추천을 통한 주문',
        });

        if (!orderResult.success || !orderResult.orderId) {
          return NextResponse.json({
            message: `주문 생성에 실패했습니다: ${orderResult.error || '알 수 없는 오류'}`,
            action: 'chat',
            cart: updatedCart,
          });
        }

        // 결제 처리 (기본 결제 방법: 카드)
        const paymentResult = await processPayment({
          orderId: orderResult.orderId,
          paymentMethod: 'card',
          amount: totalAmount,
        });

        if (!paymentResult.success) {
          return NextResponse.json({
            message: `결제 처리에 실패했습니다: ${paymentResult.error || '알 수 없는 오류'}`,
            action: 'chat',
            cart: updatedCart,
          });
        }

        // 주문 완료 후 장바구니 비우기
        updatedCart = [];
        conversationManager.clearCart(userId);

        // 주문 정보 조회 (주문 완료 페이지로 이동하기 위해)
        const supabaseClient = await createSupabaseServerClient();
        const { data: orderData } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderResult.orderId)
          .single();

        if (orderData) {
          order = {
            id: orderData.id.toString(),
            order_number: orderData.order_number,
            user_id: (orderData.user_id as string) || userId,
            status: orderData.status,
            items: orderData.items || [],
            final_amount: orderData.final_amount,
            created_at: orderData.created_at,
            updated_at: orderData.updated_at || orderData.created_at,
          };
        }

        // 성공 메시지 업데이트
        aiResponse.message = `주문이 완료되었습니다! 주문번호: ${orderResult.orderNumber}\n결제가 정상적으로 처리되었습니다.`;
        aiResponse.action = 'checkout';
      }
    } else if (aiResponse.action === 'remove_from_cart' && aiResponse.products) {
      for (const productAction of aiResponse.products) {
        updatedCart = conversationManager.removeFromCart(
          userId,
          productAction.id,
          productAction.quantity
        );
      }
    } else if (aiResponse.action === 'checkout') {
      // 결제 진행: 주문 생성 및 결제 처리
      if (updatedCart.length === 0) {
        // 장바구니가 비어있으면 에러 메시지 반환
        return NextResponse.json({
          message: '장바구니가 비어있습니다. 주문할 상품을 먼저 추가해주세요.',
          action: 'chat',
          cart: updatedCart,
        });
      }

      // 사용자 정보 가져오기
      const userEmail = session.user.email || '';
      const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '고객';
      const userPhone = session.user.phone || '010-0000-0000'; // 기본값 사용

      // 장바구니 아이템을 주문 형식으로 변환
      const orderItems = updatedCart.map(item => ({
        menuId: item.id,
        menuName: item.name,
        menuPrice: item.discountPrice ?? item.price,
        quantity: item.quantity,
        temperature: (item.cold ? 'cold' : item.hot ? 'hot' : undefined) as 'hot' | 'cold' | undefined,
      }));

      // 총 금액 계산
      const totalAmount = updatedCart.reduce((sum, item) => {
        const price = item.discountPrice ?? item.price;
        return sum + price * item.quantity;
      }, 0);

      // 주문 생성
      const orderResult = await createOrder({
        customerName: userName,
        customerPhone: userPhone,
        customerEmail: userEmail || undefined,
        items: orderItems,
        totalAmount,
        discountAmount: 0,
        orderNotes: 'AI 추천을 통한 주문',
      });

      if (!orderResult.success || !orderResult.orderId) {
        return NextResponse.json({
          message: `주문 생성에 실패했습니다: ${orderResult.error || '알 수 없는 오류'}`,
          action: 'chat',
          cart: updatedCart,
        });
      }

      // 결제 처리 (기본 결제 방법: 카드)
      const paymentResult = await processPayment({
        orderId: orderResult.orderId,
        paymentMethod: 'card',
        amount: totalAmount,
      });

      if (!paymentResult.success) {
        return NextResponse.json({
          message: `결제 처리에 실패했습니다: ${paymentResult.error || '알 수 없는 오류'}`,
          action: 'chat',
          cart: updatedCart,
        });
      }

      // 주문 완료 후 장바구니 비우기
      updatedCart = [];
      conversationManager.clearCart(userId);

      // 주문 정보 조회 (주문 완료 페이지로 이동하기 위해)
      const supabaseClient = await createSupabaseServerClient();
      const { data: orderData } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderResult.orderId)
        .single();

      if (orderData) {
        order = {
          id: orderData.id.toString(),
          order_number: orderData.order_number,
          user_id: (orderData.user_id as string) || userId,
          status: orderData.status,
          items: orderData.items || [],
          final_amount: orderData.final_amount,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at || orderData.created_at,
        };
      }

      // 성공 메시지 업데이트
      aiResponse.message = `주문이 완료되었습니다! 주문번호: ${orderResult.orderNumber}\n결제가 정상적으로 처리되었습니다.`;
    } else if (aiResponse.action === 'get_orders') {
      // 주문 내역 조회
      const userOrders = await shoppingAgent.getUserOrders(userId, 10);
      orders = userOrders.map((o) => ({
        id: o.id.toString(),
        order_number: o.order_number,
        user_id: userId,
        status: o.status,
        items: o.items || [],
        final_amount: o.final_amount,
        created_at: o.created_at,
        updated_at: o.created_at,
      }));
    } else if (aiResponse.action === 'get_order_status' && aiResponse.orderNumber) {
      // 특정 주문 상태 조회
      const foundOrder = await shoppingAgent.getOrderByNumber(userId, aiResponse.orderNumber);
      if (foundOrder) {
        order = {
          id: foundOrder.id.toString(),
          order_number: foundOrder.order_number,
          user_id: userId,
          status: foundOrder.status,
          items: foundOrder.items || [],
          final_amount: foundOrder.final_amount,
          created_at: foundOrder.created_at,
          updated_at: foundOrder.created_at,
        };
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
