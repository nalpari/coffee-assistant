'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { CartSheet } from '@/components/cart/CartSheet';
import { LoadingSpinner } from '@/components/menu/LoadingSpinner';
import { useCartStore } from '@/store/cart-store';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useMenuInfiniteQuery } from '@/hooks/use-menu-query';
import type { MenuItemDisplay } from '@/types/menu';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { items, addItem } = useCartStore();

  // 장바구니 총 아이템 개수 계산
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // API에서 메뉴 데이터 조회 (무한 스크롤)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useMenuInfiniteQuery({
    categoryId: selectedCategory,
    searchQuery,
    pageSize: 8,
  });

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const displayedItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // 다음 페이지 로드 함수
  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  // 무한 스크롤 훅 사용
  const { observerRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hasNextPage ?? false,
    isLoading: isFetchingNextPage,
  });

  const handleItemClick = (item: MenuItemDisplay) => {
    // 상품 카드 클릭 시 상세 페이지로 이동
    router.push(`/products/${item.id}`);
  };

  const handleAddToCart = (item: MenuItemDisplay) => {
    // 담기 버튼 클릭 시 장바구니에 추가
    addItem(item);
  };

  const handleCartClick = () => {
    // 헤더의 장바구니 아이콘 클릭 시 모달 열기
    setIsCartOpen(true);
  };

  // 검색어나 카테고리가 변경되면 React Query가 자동으로 refetch
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: number | 'all') => {
    setSelectedCategory(category);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          cartItemCount={cartItemCount}
          onCartClick={handleCartClick}
        />

        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <main className="container mx-auto pb-24">
          {/* 초기 로딩 */}
          {isLoading && <LoadingSpinner />}

          {/* 에러 메시지 */}
          {isError && (
            <div className="flex items-center justify-center py-16">
              <p className="text-red-500">
                데이터를 불러오는 중 오류가 발생했습니다: {error?.message}
              </p>
            </div>
          )}

          {/* 메뉴 그리드 */}
          {!isLoading && !isError && (
            <>
              <MenuGrid
                items={displayedItems}
                onItemClick={handleItemClick}
                onAddToCart={handleAddToCart}
              />

              {/* 다음 페이지 로딩 스피너 */}
              {isFetchingNextPage && <LoadingSpinner />}

              {/* Intersection Observer 감지 요소 */}
              {hasNextPage && !isFetchingNextPage && (
                <div ref={observerRef} className="h-10" aria-hidden="true" />
              )}

              {/* 모든 데이터 로드 완료 메시지 */}
              {!hasNextPage && displayedItems.length > 0 && (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-gray-500">
                    모든 메뉴를 불러왔습니다 ({displayedItems.length}개)
                  </p>
                </div>
              )}

              {/* 검색 결과 없음 */}
              {displayedItems.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </>
          )}
        </main>

        <CartSheet
          open={isCartOpen}
          onOpenChange={setIsCartOpen}
        />
      </div>
    </ProtectedRoute>
  );
}
