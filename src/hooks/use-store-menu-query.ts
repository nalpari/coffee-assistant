'use client';

import { useQuery } from '@tanstack/react-query';
import { getStoreMenus } from '@/lib/api/menu';
import type { MenuItemDisplay } from '@/types/menu';

/**
 * 매장별 메뉴 조회 훅
 *
 * @param storeId 매장 ID
 * @returns TanStack Query 결과
 */
export function useStoreMenuQuery(storeId: number | null | undefined) {
  return useQuery<MenuItemDisplay[]>({
    queryKey: ['store', storeId, 'menus'],
    queryFn: () => getStoreMenus(storeId ?? 0),
    enabled: !!storeId && !Number.isNaN(storeId),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

