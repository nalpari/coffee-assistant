/**
 * 매장 데이터 조회를 위한 React Query 훅
 *
 * TanStack Query를 사용하여 매장 데이터 페칭, 캐싱, 무한 스크롤 지원
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStores,
  getStoreById,
  getPopularStores,
  getNearbyStores,
  incrementStoreLikes,
  incrementStoreOrders,
} from '@/lib/api/stores';
import type { Store, GetStoresOptions } from '@/types/store';

/**
 * 매장 목록 조회 옵션
 */
interface UseStoresQueryOptions extends Omit<GetStoresOptions, 'page' | 'pageSize'> {
  enabled?: boolean;
  pageSize?: number;
}

/**
 * 매장 목록 조회 훅 (무한 스크롤 지원)
 *
 * @param options 조회 옵션
 * @returns TanStack Query 무한 스크롤 결과
 *
 * @example
 * function StoreList() {
 *   const { data, fetchNextPage, hasNextPage, isLoading } = useStoresInfiniteQuery({
 *     sortBy: 'nearest',
 *     userLat: 37.5665,
 *     userLon: 126.9780,
 *   });
 *
 *   const stores = data?.pages.flatMap(page => page.data) ?? [];
 *
 *   return (
 *     <div>
 *       {stores.map(store => <StoreCard key={store.id} store={store} />)}
 *       {hasNextPage && <button onClick={() => fetchNextPage()}>더보기</button>}
 *     </div>
 *   );
 * }
 */
export function useStoresInfiniteQuery(options: UseStoresQueryOptions = {}) {
  const {
    sortBy,
    userLat,
    userLon,
    search,
    filters,
    enabled = true,
    pageSize = 10,
  } = options;

  return useInfiniteQuery({
    queryKey: ['stores', 'infinite', sortBy, userLat, userLon, search, filters],
    queryFn: ({ pageParam = 1 }) =>
      getStores({
        page: pageParam,
        pageSize,
        sortBy,
        userLat,
        userLon,
        search,
        filters,
      }),
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.totalCount;
      return hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 매장 목록 조회 훅 (단일 페이지)
 *
 * @param options 조회 옵션
 * @returns TanStack Query 결과
 *
 * @example
 * function StoreListPage() {
 *   const { data, isLoading, error } = useStoresQuery({
 *     page: 1,
 *     pageSize: 10,
 *     sortBy: 'popular',
 *   });
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       {data?.data.map(store => <StoreCard key={store.id} store={store} />)}
 *     </div>
 *   );
 * }
 */
export function useStoresQuery(options: GetStoresOptions & { enabled?: boolean } = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['stores', queryOptions],
    queryFn: () => getStores(queryOptions),
    enabled,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 개별 매장 조회 훅
 *
 * @param storeId 매장 ID
 * @param userLat 사용자 위도 (선택)
 * @param userLon 사용자 경도 (선택)
 * @returns TanStack Query 결과
 *
 * @example
 * function StoreDetailPage({ storeId }: { storeId: string }) {
 *   const { data: store, isLoading } = useStoreQuery(storeId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!store) return <NotFound />;
 *
 *   return <StoreDetail store={store} />;
 * }
 */
export function useStoreQuery(storeId: string, userLat?: number, userLon?: number) {
  return useQuery({
    queryKey: ['store', storeId, userLat, userLon],
    queryFn: () => getStoreById(storeId, userLat, userLon),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 인기 매장 조회 훅
 *
 * @param limit 조회할 매장 수 (기본값: 5)
 * @returns TanStack Query 결과
 *
 * @example
 * function PopularStores() {
 *   const { data: stores, isLoading } = usePopularStoresQuery(5);
 *
 *   return (
 *     <section>
 *       <h2>인기 매장</h2>
 *       {stores?.map(store => <StoreCard key={store.id} store={store} />)}
 *     </section>
 *   );
 * }
 */
export function usePopularStoresQuery(limit: number = 5) {
  return useQuery({
    queryKey: ['stores', 'popular', limit],
    queryFn: () => getPopularStores(limit),
    staleTime: 1000 * 60 * 10, // 10분 (인기 매장은 자주 변하지 않음)
    gcTime: 1000 * 60 * 30, // 30분
  });
}

/**
 * 근처 매장 조회 훅
 *
 * @param userLat 사용자 위도
 * @param userLon 사용자 경도
 * @param radiusKm 검색 반경 (킬로미터, 기본값: 5km)
 * @param limit 조회할 매장 수 (기본값: 10)
 * @returns TanStack Query 결과
 *
 * @example
 * function NearbyStores({ userLat, userLon }: { userLat: number; userLon: number }) {
 *   const { data: stores, isLoading } = useNearbyStoresQuery(userLat, userLon, 5, 10);
 *
 *   return (
 *     <section>
 *       <h2>내 주변 매장</h2>
 *       {stores?.map(store => <StoreCard key={store.id} store={store} />)}
 *     </section>
 *   );
 * }
 */
export function useNearbyStoresQuery(
  userLat: number,
  userLon: number,
  radiusKm: number = 5,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['stores', 'nearby', userLat, userLon, radiusKm, limit],
    queryFn: () => getNearbyStores(userLat, userLon, radiusKm, limit),
    enabled: !!userLat && !!userLon,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
}

/**
 * 매장 좋아요 증가 Mutation 훅
 *
 * @returns TanStack Query Mutation 결과
 *
 * @example
 * function StoreCard({ store }: { store: Store }) {
 *   const likeMutation = useStoreLikeMutation();
 *
 *   const handleLike = () => {
 *     likeMutation.mutate(store.id);
 *   };
 *
 *   return (
 *     <button onClick={handleLike} disabled={likeMutation.isPending}>
 *       좋아요 {store.likeCount}
 *     </button>
 *   );
 * }
 */
export function useStoreLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementStoreLikes,
    onSuccess: (newLikeCount, storeId) => {
      // 매장 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['store', storeId] });

      // 매장 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['stores'] });

      // Optimistic Update: 즉시 UI 업데이트
      queryClient.setQueriesData(
        { queryKey: ['store', storeId] },
        (old: Store | undefined) => {
          if (!old) return old;
          return { ...old, likeCount: newLikeCount };
        }
      );
    },
  });
}

/**
 * 매장 주문 수 증가 Mutation 훅
 *
 * @returns TanStack Query Mutation 결과
 *
 * @example
 * function CheckoutButton({ storeId }: { storeId: string }) {
 *   const orderMutation = useStoreOrderMutation();
 *
 *   const handleOrder = () => {
 *     orderMutation.mutate(storeId, {
 *       onSuccess: () => {
 *         console.log('주문 수 업데이트 완료');
 *       },
 *     });
 *   };
 *
 *   return <button onClick={handleOrder}>주문하기</button>;
 * }
 */
export function useStoreOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementStoreOrders,
    onSuccess: (newOrderCount, storeId) => {
      // 매장 상세 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['store', storeId] });

      // 매장 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['stores'] });

      // 인기 매장 쿼리 무효화 (주문 수 변경으로 인기도 변경 가능)
      queryClient.invalidateQueries({ queryKey: ['stores', 'popular'] });

      // Optimistic Update
      queryClient.setQueriesData(
        { queryKey: ['store', storeId] },
        (old: Store | undefined) => {
          if (!old) return old;
          return { ...old, orderCount: newOrderCount };
        }
      );
    },
  });
}
