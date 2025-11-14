/**
 * Duplicate Order Detector
 * 중복 주문 감지 엔진
 *
 * 사용자가 AI Chat에서 메뉴 주문 시 최근 주문 내역과 비교하여
 * 중복 주문을 감지하고 선택 옵션을 제공합니다.
 */

import { createSupabaseServerClient } from './supabase-server';
import type { CartItem } from '@/types/cart';

/**
 * 중복 감지 결과
 */
export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  recentOrder?: RecentOrderInfo;
  nearbyStores?: StoreOption[];
  menuName?: string;
}

/**
 * 최근 주문 정보
 */
export interface RecentOrderInfo {
  orderId: number;
  orderNumber: string;
  menuItems: CartItem[];
  orderDate: string;
  storeId: number;
  storeName: string;
  totalAmount: number;
}

/**
 * 매장 선택 옵션
 */
export interface StoreOption {
  storeId: number;
  storeName: string;
  address: string | null;
  distance?: string;
  estimatedTime?: string;
}

/**
 * 주문 아이템 인터페이스 (DB 스키마)
 */
interface OrderItem {
  menuId: number;
  menuName: string;
  quantity: number;
  menuPrice: number;
}

/**
 * 최근 주문 조회 (시간 간격 기반)
 *
 * @param userId - 사용자 ID
 * @param menuName - 메뉴명
 * @param minutes - 조회 기간 (기본 5분)
 * @returns 최근 주문 목록
 */
async function findRecentOrdersWithMenu(
  userId: string,
  menuName: string,
  minutes: number = 5
): Promise<Array<{
  id: number;
  order_number: string;
  items: OrderItem[];
  final_amount: number;
  created_at: string;
  store_id: number | null;
  store?: { name: string } | null;
}>> {
  try {
    const supabase = await createSupabaseServerClient();
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - minutes);

    // 주문 내역 조회 (items JSONB 필드에서 메뉴명 검색)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        items,
        final_amount,
        created_at,
        store_id,
        stores!inner (
          name
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DuplicateDetector] Error fetching orders:', error);
      return [];
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // items 필드에서 해당 메뉴명이 포함된 주문 필터링
    const filteredOrders = orders.filter((order) => {
      if (!Array.isArray(order.items)) return false;

      return order.items.some((item: OrderItem) => {
        const similarity = calculateMenuSimilarity(item.menuName, menuName);
        return similarity >= 0.8; // 80% 이상 유사도
      });
    });

    return filteredOrders;
  } catch (error) {
    console.error('[DuplicateDetector] Exception in findRecentOrdersWithMenu:', error);
    return [];
  }
}

/**
 * 메뉴명 유사도 계산
 *
 * @param orderMenuName - 주문 내역의 메뉴명
 * @param targetMenuName - 비교할 메뉴명
 * @returns 유사도 (0.0 ~ 1.0)
 */
function calculateMenuSimilarity(
  orderMenuName: string,
  targetMenuName: string
): number {
  // 정규화: 소문자 변환 및 공백 제거
  const normalize = (str: string) =>
    str.toLowerCase().replace(/\s+/g, '').trim();

  const normalized1 = normalize(orderMenuName);
  const normalized2 = normalize(targetMenuName);

  // 완전 일치
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // 포함 관계 확인
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.9;
  }

  // Levenshtein Distance 기반 유사도
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  if (maxLength === 0) return 0;

  return 1 - distance / maxLength;
}

/**
 * Levenshtein Distance 계산
 * 두 문자열 간의 편집 거리를 계산
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // 초기화
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // DP 계산
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 삭제
        matrix[i][j - 1] + 1,      // 삽입
        matrix[i - 1][j - 1] + cost // 대체
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * 메뉴를 판매하는 매장 조회
 *
 * @param menuName - 메뉴명
 * @returns 매장 목록
 */
async function findStoresByMenuName(menuName: string): Promise<StoreOption[]> {
  try {
    const supabase = await createSupabaseServerClient();

    // 메뉴 검색
    const { data: menuItems, error: menuError } = await supabase
      .from('menu')
      .select('id, name')
      .ilike('name', `%${menuName}%`)
      .eq('status', 'E0101') // 판매중
      .limit(5);

    if (menuError || !menuItems || menuItems.length === 0) {
      console.warn('[DuplicateDetector] No menu items found:', menuName);
      return [];
    }

    const menuIds = menuItems.map(m => m.id);

    // 매장-메뉴 매핑 조회
    const { data: storeMenus, error: storeMenuError } = await supabase
      .from('store_menu')
      .select(`
        store_id,
        store:stores (
          id,
          name,
          address
        )
      `)
      .in('menu_id', menuIds);

    if (storeMenuError || !storeMenus) {
      console.warn('[DuplicateDetector] No stores found for menu:', menuName);
      return [];
    }

    // 중복 제거 및 형식 변환
    const uniqueStores = new Map<number, StoreOption>();

    storeMenus.forEach((sm: { store: unknown }) => {
      if (sm.store && typeof sm.store === 'object') {
        const storeArray = sm.store as unknown as Array<{ id: number; name: string; address: string | null }>;
        if (Array.isArray(storeArray) && storeArray.length > 0) {
          const store = storeArray[0];
          if (!uniqueStores.has(store.id)) {
            uniqueStores.set(store.id, {
              storeId: store.id,
              storeName: store.name,
              address: store.address,
              distance: '위치 정보 없음',
              estimatedTime: '예상 시간 계산 불가',
            });
          }
        }
      }
    });

    return Array.from(uniqueStores.values());
  } catch (error) {
    console.error('[DuplicateDetector] Exception in findStoresByMenuName:', error);
    return [];
  }
}

/**
 * 중복 주문 감지 (메인 함수)
 *
 * @param userId - 사용자 ID
 * @param cartItems - 장바구니 아이템
 * @returns 중복 감지 결과
 */
export async function detectDuplicateOrder(
  userId: string,
  cartItems: CartItem[]
): Promise<DuplicateDetectionResult> {
  try {
    // 장바구니가 비어있으면 중복 없음
    if (!cartItems || cartItems.length === 0) {
      return { isDuplicate: false };
    }

    // 첫 번째 아이템의 메뉴명으로 검색 (다중 메뉴는 향후 확장 가능)
    const firstItem = cartItems[0];
    const menuName = firstItem.name;

    // 최근 주문 조회 (5분 이내만 중복으로 판단)
    const recentOrders = await findRecentOrdersWithMenu(userId, menuName, 5);

    // 중복 주문 발견
    if (recentOrders.length > 0) {
      const mostRecentOrder = recentOrders[0];

      // 매장 정보 추출
      const storeName =
        mostRecentOrder.store && typeof mostRecentOrder.store === 'object' && 'name' in mostRecentOrder.store
          ? mostRecentOrder.store.name
          : '매장 정보 없음';

      // 주문 아이템 변환
      const orderItems: CartItem[] = Array.isArray(mostRecentOrder.items)
        ? mostRecentOrder.items.map((item: OrderItem) => ({
            id: item.menuId,
            name: item.menuName,
            description: '',
            price: item.menuPrice,
            discountPrice: undefined,
            image: null,
            images: [],
            category: '',
            tags: [],
            available: true,
            popular: false,
            cold: false,
            hot: false,
            orderNo: 0,
            quantity: item.quantity,
            storeId: mostRecentOrder.store_id ?? 0, // 매장 ID 추가
          }))
        : [];

      // 가까운 매장 조회
      const nearbyStores = await findStoresByMenuName(menuName);

      return {
        isDuplicate: true,
        menuName,
        recentOrder: {
          orderId: mostRecentOrder.id,
          orderNumber: mostRecentOrder.order_number,
          menuItems: orderItems,
          orderDate: mostRecentOrder.created_at,
          storeId: mostRecentOrder.store_id || 0,
          storeName,
          totalAmount: mostRecentOrder.final_amount,
        },
        nearbyStores,
      };
    }

    // 중복 주문 없음
    return { isDuplicate: false };
  } catch (error) {
    console.error('[DuplicateDetector] Error in detectDuplicateOrder:', error);
    // 에러 발생 시 중복 없음으로 처리 (기존 플로우 유지)
    return { isDuplicate: false };
  }
}
