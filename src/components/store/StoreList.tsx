'use client';

import { useStoresInfiniteQuery } from '@/hooks/use-stores-query';
import { StoreCard } from './StoreCard';
import { LoadingSpinner } from '@/components/menu/LoadingSpinner';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useGeolocation } from '@/contexts/GeolocationContext';
import { useMemo } from 'react';

type SortOption = 'nearest' | 'popular' | 'recent';

interface StoreListProps {
  sortBy?: SortOption;
  searchQuery?: string;
  hasCoupon?: boolean;
  hasStamp?: boolean;
  isOpen?: boolean;
  onStoreClick?: (storeId: number) => void;
}

/**
 * 매장 리스트 컴포넌트
 *
 * 무한 스크롤을 지원하는 매장 목록 표시
 */
export function StoreList({
  sortBy,
  searchQuery,
  hasCoupon,
  hasStamp,
  isOpen,
  onStoreClick,
}: StoreListProps) {
  // GeolocationContext에서 위치 정보 가져오기
  const { position, error: locationError } = useGeolocation();
  const effectivePosition = position ?? { lat: 37.556960, lon: 126.934305 };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useStoresInfiniteQuery({
    sortBy: sortBy, // sortBy가 undefined이면 전체 조회
    userLat: effectivePosition.lat,
    userLon: effectivePosition.lon,
    search: searchQuery,
    filters: {
      hasCoupon,
      hasStamp,
      isOpen,
    },
  });

  const stores = useMemo(() => {
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

  const handlePhoneClick = (phone?: string) => {
    if (phone) {
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = `tel:${phone}`;
    } else {
      alert('전화번호가 등록되지 않은 매장입니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <p className="text-red-500 mb-4 text-center">
          매장을 불러오는 중 오류가 발생했습니다
        </p>
        <p className="text-sm text-gray-500 text-center">
          {error?.message || '잠시 후 다시 시도해주세요.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white">
      {/* 위치 권한 경고 메시지 */}
      {locationError && sortBy === 'nearest' && position == null && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{locationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* 매장 리스트 */}
      {stores.length > 0 ? (
        <>
          <div className="flex flex-col items-start w-full">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className={index === 0 ? 'border-t border-[#F2F0F0] w-full' : 'w-full'}
              >
                <StoreCard
                  store={store}
                  onPhoneClick={() => handlePhoneClick(store.phone)}
                  onClick={onStoreClick ? () => onStoreClick(store.id) : undefined}
                />
              </div>
            ))}
          </div>

          {/* 무한 스크롤 로딩 */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {/* 무한 스크롤 트리거 */}
          {hasNextPage && !isFetchingNextPage && (
            <div ref={observerRef} className="h-10" aria-hidden="true" />
          )}

          {/* 전체 로딩 완료 메시지 */}
          {!hasNextPage && stores.length > 0 && (
            <div className="flex items-center justify-center py-8 bg-white">
              <p className="text-sm text-gray-500">
                모든 매장을 불러왔습니다 ({stores.length}개)
              </p>
            </div>
          )}
        </>
      ) : (
        /* 빈 상태 */
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-gray-500 text-center mb-2">주변에 매장이 없습니다</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 text-center">
              검색어: &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
