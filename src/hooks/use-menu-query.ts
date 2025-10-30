'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMenus, type GetMenusOptions } from '@/lib/api/menu';

/**
 * 무한 스크롤 메뉴 조회 Hook
 *
 * React Query의 useInfiniteQuery를 사용하여 페이지네이션된 메뉴 데이터를 조회합니다.
 *
 * @param options - 메뉴 조회 옵션 (categoryId, searchQuery 등)
 * @returns 무한 스크롤 쿼리 결과
 */
export function useMenuInfiniteQuery(options: Omit<GetMenusOptions, 'page'> = {}) {
  const { categoryId = 'all', searchQuery = '', pageSize = 8 } = options;

  return useInfiniteQuery({
    queryKey: ['menus', categoryId, searchQuery, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      getMenus({
        page: pageParam,
        pageSize,
        categoryId,
        searchQuery,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // 더 불러올 데이터가 있으면 다음 페이지 번호 반환
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
}
