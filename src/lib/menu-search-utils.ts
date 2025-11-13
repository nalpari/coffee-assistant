/**
 * 메뉴 검색 관련 유틸리티 함수
 */

import { createSupabaseServerClient } from './supabase-server';

export interface MenuSearchResult {
  menuId: number;
  menuName: string;
  price: number;
  discountPrice?: number;
  hot: boolean;
  cold: boolean;
  description: string;
  categoryId?: number;
}

/**
 * 메뉴명으로 메뉴 검색 (store_menu 기준)
 * 
 * @param menuName - 메뉴명
 * @param storeId - 매장 ID (선택적, 지정하면 해당 매장에서만 검색)
 * @returns 메뉴 정보 목록
 */
export async function searchMenuByName(
  menuName: string,
  storeId?: number
): Promise<MenuSearchResult[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const normalizedMenuName = menuName.toLowerCase().trim();

    // 1. menu 테이블에서 메뉴명으로 검색
    let menuQuery = supabase
      .from('menu')
      .select('id, name, price, discount_price, hot, cold, description, category_id')
      .ilike('name', `%${normalizedMenuName}%`)
      .eq('status', 'E0101'); // E0101 = 사용(판매중)

    const { data: menus, error: menuError } = await menuQuery;

    if (menuError) {
      console.error('메뉴 검색 실패:', menuError);
      return [];
    }

    if (!menus || menus.length === 0) {
      return [];
    }

    // 2. storeId가 지정된 경우, store_menu에서 해당 매장의 메뉴만 필터링
    if (storeId) {
      const menuIds = menus.map(m => m.id);
      const { data: storeMenus, error: storeMenuError } = await supabase
        .from('store_menu')
        .select('menu_id')
        .eq('store_id', storeId)
        .in('menu_id', menuIds)
        .eq('is_available', true);

      if (storeMenuError) {
        console.error('매장 메뉴 조회 실패:', storeMenuError);
        return [];
      }

      const availableMenuIds = new Set(
        (storeMenus || []).map(sm => sm.menu_id)
      );

      // 매장에서 판매 가능한 메뉴만 필터링
      return menus
        .filter(m => availableMenuIds.has(m.id))
        .map(m => ({
          menuId: m.id,
          menuName: m.name,
          price: m.price,
          discountPrice: m.discount_price || undefined,
          hot: m.hot || false,
          cold: m.cold || false,
          description: m.description || '',
          categoryId: m.category_id || undefined,
        }));
    }

    // 3. storeId가 없는 경우, 모든 매장에서 판매 가능한 메뉴만 반환
    const menuIds = menus.map(m => m.id);
    const { data: storeMenus, error: storeMenuError } = await supabase
      .from('store_menu')
      .select('menu_id')
      .in('menu_id', menuIds)
      .eq('is_available', true)
      .limit(1000); // 최대 1000개 매장 메뉴 조회

    if (storeMenuError) {
      console.error('매장 메뉴 조회 실패:', storeMenuError);
      return [];
    }

    const availableMenuIds = new Set(
      (storeMenus || []).map(sm => sm.menu_id)
    );

    return menus
      .filter(m => availableMenuIds.has(m.id))
      .map(m => ({
        menuId: m.id,
        menuName: m.name,
        price: m.price,
        discountPrice: m.discount_price || undefined,
        hot: m.hot || false,
        cold: m.cold || false,
        description: m.description || '',
        categoryId: m.category_id || undefined,
      }));
  } catch (error) {
    console.error('메뉴 검색 오류:', error);
    return [];
  }
}

