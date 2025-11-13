/**
 * 매장별 메뉴 관련 유틸리티 함수
 */

import { createSupabaseServerClient } from './supabase-server';
import { calculateDistance, formatDistance } from './location-utils';

export interface StoreMenuInfo {
  storeId: number;
  storeName: string;
  menuId: number;
  menuName: string;
  price: number;
  distance?: number; // km 단위
  distanceFormatted?: string; // 포맷팅된 거리 (예: "0.5km")
  address: string | null;
  phone: string | null;
  latitude?: number;
  longitude?: number;
}

/**
 * 메뉴명으로 해당 메뉴를 판매하는 매장 목록 조회
 * 
 * @param menuName - 메뉴명
 * @param userLat - 사용자 위도 (선택적)
 * @param userLon - 사용자 경도 (선택적)
 * @returns 매장 목록 (거리순 정렬, 위치 정보가 있으면)
 */
export async function findStoresByMenuName(
  menuName: string,
  userLat?: number,
  userLon?: number
): Promise<StoreMenuInfo[]> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. menu 테이블에서 메뉴명으로 검색 (LIKE 검색)
    const normalizedMenuName = menuName.toLowerCase().trim();
    const { data: menus, error: menuError } = await supabase
      .from('menu')
      .select('id, name, price')
      .ilike('name', `%${normalizedMenuName}%`)
      .eq('status', 'E0101'); // E0101 = 사용(판매중)

    if (menuError) {
      console.error('메뉴 검색 실패:', menuError);
      return [];
    }

    if (!menus || menus.length === 0) {
      return [];
    }

    const menuIds = menus.map(m => m.id);

    // 2. store_menu 테이블에서 해당 메뉴를 판매하는 매장 조회
    const { data: storeMenus, error: storeMenuError } = await supabase
      .from('store_menu')
      .select(`
        store_id,
        menu_id,
        is_available,
        stores:store_id (
          id,
          name,
          address,
          phone,
          latitude,
          longitude
        )
      `)
      .in('menu_id', menuIds)
      .eq('is_available', true);

    if (storeMenuError) {
      console.error('매장 메뉴 조회 실패:', storeMenuError);
      return [];
    }

    if (!storeMenus || storeMenus.length === 0) {
      return [];
    }

    // 3. 결과 매핑 및 거리 계산
    const results: StoreMenuInfo[] = [];

    for (const storeMenu of storeMenus) {
      const store = storeMenu.stores;
      if (!store || typeof store !== 'object' || !('id' in store)) {
        continue;
      }

      // Supabase 조인 결과 타입 처리
      const storeObj = store as unknown as {
        id: number;
        name: string;
        address: string | null;
        phone: string | null;
        latitude?: number;
        longitude?: number;
      };

      const storeData = {
        id: storeObj.id,
        name: storeObj.name,
        address: storeObj.address,
        phone: storeObj.phone,
        latitude: storeObj.latitude,
        longitude: storeObj.longitude,
      };

      const menu = menus.find(m => m.id === storeMenu.menu_id);
      if (!menu) {
        continue;
      }

      const result: StoreMenuInfo = {
        storeId: storeData.id,
        storeName: storeData.name,
        menuId: menu.id,
        menuName: menu.name,
        price: menu.price,
        address: storeData.address,
        phone: storeData.phone,
        latitude: storeData.latitude,
        longitude: storeData.longitude,
      };

      // 위치 정보가 있으면 거리 계산
      if (userLat && userLon && storeData.latitude && storeData.longitude) {
        const distance = calculateDistance(
          userLat,
          userLon,
          storeData.latitude,
          storeData.longitude
        );
        result.distance = distance;
        result.distanceFormatted = formatDistance(distance);
      }

      results.push(result);
    }

    // 4. 정렬 (거리순 또는 매장 ID순)
    if (userLat && userLon) {
      // 거리순 정렬
      results.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    } else {
      // 매장 ID순 정렬
      results.sort((a, b) => a.storeId - b.storeId);
    }

    return results;
  } catch (error) {
    console.error('매장 검색 오류:', error);
    return [];
  }
}

/**
 * 특정 매장에서 특정 메뉴가 판매 가능한지 확인
 * 
 * @param storeId - 매장 ID
 * @param menuId - 메뉴 ID
 * @returns 판매 가능 여부
 */
export async function isMenuAvailableInStore(
  storeId: number,
  menuId: number
): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('store_menu')
      .select('id, is_available')
      .eq('store_id', storeId)
      .eq('menu_id', menuId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_available === true;
  } catch (error) {
    console.error('메뉴 판매 가능 여부 확인 오류:', error);
    return false;
  }
}

