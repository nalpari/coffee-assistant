/**
 * 주문 관련 유틸리티 함수
 */

import { createSupabaseServerClient } from './supabase-server';

/**
 * 메뉴명으로 사용자의 가장 최근 주문 찾기
 * 
 * @param userId - 사용자 ID
 * @param menuName - 메뉴명 (예: "아메리카노", "카페라떼")
 * @returns 가장 최근 주문 정보 (매장 ID, 메뉴 ID 포함)
 */
export async function findRecentOrderByMenuName(
  userId: string,
  menuName: string
): Promise<{
  storeId: number;
  menuId: number;
  menuName: string;
  orderNumber: string;
  orderDate: Date;
} | null> {
  try {
    const supabase = await createSupabaseServerClient();

    // 사용자의 주문 내역 조회 (최근 50개)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        store_id,
        created_at,
        order_items (
          id,
          menu_id,
          menu_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (ordersError) {
      console.error('주문 조회 실패:', ordersError);
      return null;
    }

    if (!orders || orders.length === 0) {
      return null;
    }

    // 메뉴명 정규화 (대소문자 구분 없이, 공백 제거)
    const normalizedMenuName = menuName.toLowerCase().trim().replace(/\s+/g, '');

    // 주문 내역에서 메뉴명이 일치하는 주문 찾기
    for (const order of orders) {
      if (!order.order_items || !Array.isArray(order.order_items)) {
        continue;
      }

      // order_items에서 메뉴명이 일치하는 항목 찾기
      for (const item of order.order_items) {
        const itemMenuName = (item.menu_name || '').toLowerCase().trim().replace(/\s+/g, '');
        
        // 부분 일치 또는 완전 일치 확인
        if (
          itemMenuName.includes(normalizedMenuName) ||
          normalizedMenuName.includes(itemMenuName) ||
          itemMenuName === normalizedMenuName
        ) {
          // 매장 ID가 있는 경우에만 반환
          if (order.store_id && item.menu_id) {
            return {
              storeId: order.store_id,
              menuId: item.menu_id,
              menuName: item.menu_name || menuName,
              orderNumber: order.order_number,
              orderDate: new Date(order.created_at),
            };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('최근 주문 찾기 오류:', error);
    return null;
  }
}

/**
 * 주문 상태를 사람이 읽기 쉬운 레이블로 변환
 * 
 * @param status - 주문 상태 코드
 * @returns 주문 상태 레이블
 */
export function getOrderStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '주문 대기',
    'paid': '결제 완료',
    'preparing': '준비 중',
    'ready': '준비 완료',
    'completed': '완료',
    'cancelled': '취소됨',
  };

  return statusMap[status] || status;
}
