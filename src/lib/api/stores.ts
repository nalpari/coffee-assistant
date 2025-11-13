/**
 * 매장 API 함수
 *
 * Supabase를 통한 매장 데이터 조회 및 관리
 */

import { supabase } from '@/lib/supabase';
import type {
  Store,
  StoreRecord,
  StoreListResponse,
  GetStoresOptions,
} from '@/types/store';
import {
  calculateDistance,
  formatDistance,
  estimateWalkingTime,
  isStoreOpen,
} from '@/lib/location-utils';

/**
 * Supabase 레코드를 클라이언트 Store 타입으로 변환
 */
function mapStoreRecordToStore(record: StoreRecord): Store {
  return {
    id: record.id,
    name: record.name,
    description: record.description || undefined,
    address: record.address || undefined,
    phone: record.phone || undefined,
    latitude: record.latitude || undefined,
    longitude: record.longitude || undefined,
    image: record.image || undefined,
    imageUrl: record.image_url || undefined,
    thumbnailUrl: record.thumbnail_url || undefined,
    openingHours: record.opening_hours || undefined,
    hasCoupon: record.has_coupon,
    hasStamp: record.has_stamp,
    likeCount: record.like_count,
    commentCount: record.comment_count,
    orderCount: record.order_count,
    status: record.status,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
  };
}

/**
 * 매장 목록 조회
 *
 * @param options 조회 옵션 (페이지네이션, 정렬, 필터, 사용자 위치 등)
 * @returns 매장 목록 및 메타데이터
 *
 * @example
 * // 기본 조회
 * const result = await getStores({ page: 1, pageSize: 10 });
 *
 * // 사용자 위치 기반 거리순 정렬
 * const result = await getStores({
 *   sortBy: 'nearest',
 *   userLat: 37.5665,
 *   userLon: 126.9780
 * });
 *
 * // 검색 및 필터
 * const result = await getStores({
 *   search: '강남',
 *   filters: { hasCoupon: true }
 * });
 */
export async function getStores(
  options: GetStoresOptions = {}
): Promise<StoreListResponse> {
  const {
    page = 1,
    pageSize = 10,
    sortBy,
    userLat,
    userLon,
    search,
    filters,
  } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 기본 쿼리 구성
  let query = supabase
    .from('stores')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  // 검색어 필터
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // 필터 적용
  if (filters?.hasCoupon !== undefined) {
    query = query.eq('has_coupon', filters.hasCoupon);
  }
  if (filters?.hasStamp !== undefined) {
    query = query.eq('has_stamp', filters.hasStamp);
  }

  // 정렬 (sortBy가 없으면 정렬 없이 전체 조회)
  if (sortBy === 'popular') {
    query = query.order('order_count', { ascending: false });
  } else if (sortBy === 'recent') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'nearest') {
    // 거리순 정렬은 클라이언트에서 처리, 기본 정렬만 적용
    query = query.order('created_at', { ascending: false });
  }
  // sortBy가 undefined이면 정렬 없이 전체 조회

  // 페이지네이션
  query = query.range(from, to);

  // 쿼리 실행
  const { data, error, count } = await query;

  if (error) {
    console.error('매장 조회 오류:', error);
    throw new Error('매장 목록을 불러오는데 실패했습니다.');
  }

  // 타입 변환
  let stores = (data || []).map(mapStoreRecordToStore);

  // 각 매장의 메뉴 이름 가져오기 (별도 쿼리)
  if (stores.length > 0) {
    const storeIds = stores.map((s) => s.id);
    const { data: storeMenuData } = await supabase
      .from('store_menu')
      .select(`
        store_id,
        menu_id,
        menu:menu_id(
          name
        )
      `)
      .in('store_id', storeIds)
      .eq('is_available', true)
      .order('id', { ascending: true });

    // 매장별로 첫 번째 메뉴 이름 매핑
    const menuMap = new Map<number, string>();
    if (storeMenuData) {
      storeMenuData.forEach((item: { store_id: number; menu?: { name: string }[] | null }) => {
        const menuItem = Array.isArray(item.menu) ? item.menu[0] : item.menu;
        if (!menuMap.has(item.store_id) && menuItem?.name) {
          menuMap.set(item.store_id, menuItem.name);
        }
      });
    }

    // 각 매장에 메뉴 이름 추가
    stores = stores.map((store) => ({
      ...store,
      menuName: menuMap.get(store.id),
    }));
  }

  // 사용자 위치가 제공된 경우 거리 계산
  if (userLat && userLon) {
    stores = stores.map((store) => {
      if (store.latitude && store.longitude) {
        const distanceKm = calculateDistance(
          userLat,
          userLon,
          store.latitude,
          store.longitude
        );
        return {
          ...store,
          distance: formatDistance(distanceKm),
          walkingTime: estimateWalkingTime(distanceKm),
          _distanceKm: distanceKm, // 정렬용 임시 필드
        };
      }
      return store;
    });

    // 거리순 정렬 (sortBy가 'nearest'일 때만)
    if (sortBy === 'nearest') {
      stores.sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a, b) => ((a as any)._distanceKm || Infinity) - ((b as any)._distanceKm || Infinity)
      );
    }

    // 정렬용 필드 제거
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    stores = stores.map(({ _distanceKm, ...store }: any) => store);
  }

  // 영업 중인 매장만 필터링 (옵션)
  if (filters?.isOpen) {
    stores = stores.filter((store) => {
      if (!store.openingHours) return false;
      return isStoreOpen(store.openingHours as Record<string, string | undefined>);
    });
  }

  return {
    data: stores,
    totalCount: count || 0,
    page,
    pageSize,
  };
}

/**
 * 개별 매장 조회
 *
 * @param id 매장 ID
 * @param userLat 사용자 위도 (선택)
 * @param userLon 사용자 경도 (선택)
 * @returns 매장 정보 또는 null
 *
 * @example
 * const store = await getStoreById('uuid-123');
 * if (store) {
 *   console.log(store.name);
 * }
 *
 * // 거리 계산 포함
 * const store = await getStoreById('uuid-123', 37.5665, 126.9780);
 * console.log(store?.distance); // "1.5km"
 */
export async function getStoreById(
  id: string,
  userLat?: number,
  userLon?: number
): Promise<Store | null> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    if (error) {
      console.error('매장 조회 오류:', error);
    }
    return null;
  }

  let store = mapStoreRecordToStore(data as StoreRecord);

  // 사용자 위치가 제공된 경우 거리 계산
  if (userLat && userLon && store.latitude && store.longitude) {
    const distanceKm = calculateDistance(
      userLat,
      userLon,
      store.latitude,
      store.longitude
    );
    store = {
      ...store,
      distance: formatDistance(distanceKm),
      walkingTime: estimateWalkingTime(distanceKm),
    };
  }

  return store;
}

/**
 * 매장 좋아요 수 증가
 *
 * @param id 매장 ID
 * @returns 업데이트된 좋아요 수
 */
export async function incrementStoreLikes(id: string): Promise<number> {
  const { data: currentStore, error: fetchError } = await supabase
    .from('stores')
    .select('like_count')
    .eq('id', id)
    .single();

  if (fetchError || !currentStore) {
    throw new Error('매장을 찾을 수 없습니다.');
  }

  const newLikeCount = currentStore.like_count + 1;

  const { error: updateError } = await supabase
    .from('stores')
    .update({ like_count: newLikeCount })
    .eq('id', id);

  if (updateError) {
    throw new Error('좋아요 업데이트에 실패했습니다.');
  }

  return newLikeCount;
}

/**
 * 매장 주문 수 증가
 *
 * @param id 매장 ID
 * @returns 업데이트된 주문 수
 */
export async function incrementStoreOrders(id: string): Promise<number> {
  const { data: currentStore, error: fetchError } = await supabase
    .from('stores')
    .select('order_count')
    .eq('id', id)
    .single();

  if (fetchError || !currentStore) {
    throw new Error('매장을 찾을 수 없습니다.');
  }

  const newOrderCount = currentStore.order_count + 1;

  const { error: updateError } = await supabase
    .from('stores')
    .update({ order_count: newOrderCount })
    .eq('id', id);

  if (updateError) {
    throw new Error('주문 수 업데이트에 실패했습니다.');
  }

  return newOrderCount;
}

/**
 * 인기 매장 조회 (주문 수 기준 상위 N개)
 *
 * @param limit 조회할 매장 수 (기본값: 5)
 * @returns 인기 매장 배열
 */
export async function getPopularStores(limit: number = 5): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('status', 'active')
    .order('order_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('인기 매장 조회 오류:', error);
    throw new Error('인기 매장을 불러오는데 실패했습니다.');
  }

  return (data || []).map(mapStoreRecordToStore);
}

/**
 * 근처 매장 조회
 *
 * @param userLat 사용자 위도
 * @param userLon 사용자 경도
 * @param radiusKm 검색 반경 (킬로미터, 기본값: 5km)
 * @param limit 조회할 매장 수 (기본값: 10)
 * @returns 근처 매장 배열
 */
export async function getNearbyStores(
  userLat: number,
  userLon: number,
  radiusKm: number = 5,
  limit: number = 10
): Promise<Store[]> {
  // 모든 활성 매장 조회
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('status', 'active')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    console.error('근처 매장 조회 오류:', error);
    throw new Error('근처 매장을 불러오는데 실패했습니다.');
  }

  // 거리 계산 및 필터링
  const storesWithDistance = (data || [])
    .map((record) => {
      const store = mapStoreRecordToStore(record as StoreRecord);
      if (!store.latitude || !store.longitude) return null;

      const distanceKm = calculateDistance(
        userLat,
        userLon,
        store.latitude,
        store.longitude
      );

      if (distanceKm > radiusKm) return null;

      return {
        ...store,
        distance: formatDistance(distanceKm),
        walkingTime: estimateWalkingTime(distanceKm),
        _distanceKm: distanceKm,
      };
    })
    .filter((store): store is (Store & { distance: string; walkingTime: string; _distanceKm: number }) => store !== null)
    .sort((a, b) => a._distanceKm - b._distanceKm)
    .slice(0, limit);

  // 정렬용 필드 제거
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  return storesWithDistance.map(({ _distanceKm, ...store }: any) => store);
}
