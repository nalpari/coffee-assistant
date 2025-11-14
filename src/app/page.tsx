'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GeolocationProvider } from '@/contexts/GeolocationContext';
import { Header } from '@/components/layout/Header';
import { StoreSearchHeader, type SortOption } from '@/components/store/StoreSearchHeader';
import { StoreList } from '@/components/store/StoreList';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { CartSheet } from '@/components/cart/CartSheet';
import { LoadingSpinner } from '@/components/menu/LoadingSpinner';
import { useCartStore } from '@/store/cart-store';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useMenuInfiniteQuery } from '@/hooks/use-menu-query';
import type { MenuItemDisplay } from '@/types/menu';

type ViewMode = 'stores' | 'menu';
export default function HomePage() {
  const router = useRouter();
  const [viewMode] = useState<ViewMode>('stores');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 매장 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | undefined>(undefined);
  const [filters, setFilters] = useState<{
    hasCoupon?: boolean;
    hasStamp?: boolean;
    isOpen?: boolean;
  }>({});

  const { items } = useCartStore();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
    searchQuery: '',
    pageSize: 8,
  });

  const displayedItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const { observerRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: hasNextPage ?? false,
    isLoading: isFetchingNextPage,
  });

  const handleItemClick = (item: MenuItemDisplay) => {
    router.push(`/products/${item.id}`);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCategoryChange = (category: number | 'all') => {
    setSelectedCategory(category);
  };

  const isOpenOnly = filters.isOpen === true;

  return (
    <ProtectedRoute>
      <GeolocationProvider autoFetch={true}>
        <div className="min-h-screen bg-background">
          <Header
            cartItemCount={cartItemCount}
            onCartClick={handleCartClick}
          />

        {/* Conditional Content */}
        {viewMode === 'stores' ? (
          <>
            <StoreSearchHeader
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onLocationClick={() => {
                setSortBy('nearest');
              }}
              onSortChange={setSortBy}
              onFilterClick={() => {
                console.log('Filter clicked');
              }}
              onReset={() => {
                setSearchQuery('');
                setSortBy(undefined);
                setFilters({});
              }}
              selectedSort={sortBy}
              isOpenOnly={isOpenOnly}
              onToggleOpen={() =>
                setFilters((previous) => {
                  if (previous.isOpen) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { isOpen, ...rest } = previous;
                    return rest;
                  }
                  return { ...previous, isOpen: true };
                })
              }
            />
            <StoreList
              sortBy={sortBy}
              searchQuery={searchQuery}
              hasCoupon={filters.hasCoupon}
              hasStamp={filters.hasStamp}
              isOpen={filters.isOpen}
              onStoreClick={(storeId) => router.push(`/stores/${storeId}`)}
            />
          </>
        ) : (
          <>
            <CategoryTabs
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            <main className="container mx-auto pb-24">
              {isLoading && <LoadingSpinner />}

              {isError && (
                <div className="flex items-center justify-center py-16">
                  <p className="text-red-500">
                    데이터를 불러오는 중 오류가 발생했습니다: {error?.message}
                  </p>
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  <MenuGrid
                    items={displayedItems}
                    onItemClick={handleItemClick}
                  />

                  {isFetchingNextPage && <LoadingSpinner />}

                  {hasNextPage && !isFetchingNextPage && (
                    <div ref={observerRef} className="h-10" aria-hidden="true" />
                  )}

                  {!hasNextPage && displayedItems.length > 0 && (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-gray-500">
                        모든 메뉴를 불러왔습니다 ({displayedItems.length}개)
                      </p>
                    </div>
                  )}

                  {displayedItems.length === 0 && (
                    <div className="flex items-center justify-center py-16">
                      <p className="text-gray-500">메뉴가 없습니다.</p>
                    </div>
                  )}
                </>
              )}
            </main>
          </>
        )}

        <CartSheet
          open={isCartOpen}
          onOpenChange={setIsCartOpen}
        />
        </div>
      </GeolocationProvider>
    </ProtectedRoute>
  );
}
