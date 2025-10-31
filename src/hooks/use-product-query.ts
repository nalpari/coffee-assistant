import { useQuery } from '@tanstack/react-query';
import { getMenuItemById } from '@/lib/api/menu';
import type { MenuItemDisplay } from '@/types/menu';

interface ProductQueryOptions {
  productId: number;
}

/**
 * 개별 상품 데이터 조회 훅
 * @param productId - 조회할 상품 ID
 */
export function useProductQuery({ productId }: ProductQueryOptions) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<MenuItemDisplay> => {
      const product = await getMenuItemById(productId);

      if (!product) {
        throw new Error('상품을 찾을 수 없습니다.');
      }

      return product;
    },
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분 (cacheTime에서 gcTime으로 변경)
    retry: 1,
  });
}
