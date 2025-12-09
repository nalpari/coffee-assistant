'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { StoreSearchHeader, type SortOption } from '@/components/store/StoreSearchHeader';
import { StoreCard } from '@/components/store/StoreCard';
import { FooterNavigation } from '@/components/layout/FooterNavigation';
import { GeolocationProvider } from '@/contexts/GeolocationContext';
import { useGeolocation } from '@/contexts/GeolocationContext';
import { calculateDistance, formatDistance } from '@/lib/location-utils';
import { useStoresQuery } from '@/hooks/use-stores-query';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_POSITION = { lat: 37.556960, lon: 126.934305 };

function StoresPageContent() {
  const router = useRouter();
  const { position: userPosition, loading: locationLoading, requestLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | undefined>('nearest');
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  // 위치 기반 정렬 토글 상태
  const [isLocationSortEnabled, setIsLocationSortEnabled] = useState(false);

  // 위치 기반 정렬이 활성화된 경우에만 사용자 위치 사용, 아니면 기본 위치 사용
  const effectivePosition = isLocationSortEnabled && userPosition ? userPosition : DEFAULT_POSITION;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useStoresQuery({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy,
    search: searchQuery.trim() ? searchQuery : undefined,
    filters: isOpenOnly ? { isOpen: true } : undefined,
    userLat: effectivePosition.lat,
    userLon: effectivePosition.lon,
  });

  const storesWithDistance = useMemo(() => {
    const stores = data?.data ?? [];
    if (!stores.length) {
      return [];
    }

    return stores.map((store) => {
      if (!store.latitude || !store.longitude) {
        return store;
      }

      if (store.distance) {
        return store;
      }

      const distanceKm = calculateDistance(
        effectivePosition.lat,
        effectivePosition.lon,
        store.latitude,
        store.longitude
      );

      return {
        ...store,
        distance: formatDistance(distanceKm),
      };
    });
  }, [data?.data, effectivePosition.lat, effectivePosition.lon]);

  const handleSearchSubmit = () => {
    refetch();
  };

  // 위치 버튼 토글 핸들러
  // 위치 요청 중이거나 완료되면 자동으로 활성화됨
  const handleLocationToggle = useCallback(() => {
    if (isLocationSortEnabled) {
      // 위치 기반 정렬 비활성화
      setIsLocationSortEnabled(false);
    } else {
      // 위치 기반 정렬 활성화
      if (userPosition) {
        // 이미 위치 정보가 있으면 바로 활성화
        setIsLocationSortEnabled(true);
        setSortBy('nearest'); // 가까운 순 정렬 자동 적용
      } else {
        // 위치 정보가 없으면 요청하고, 미리 활성화 상태로 설정
        // 위치 정보가 들어오면 거리 계산이 적용됨
        setIsLocationSortEnabled(true);
        setSortBy('nearest');
        requestLocation();
      }
    }
  }, [isLocationSortEnabled, userPosition, requestLocation]);

  const handleReset = () => {
    setSearchQuery('');
    setSortBy('nearest');
    setIsOpenOnly(false);
    setIsLocationSortEnabled(false);
    refetch();
  };

  const handlePhoneClick = (storeId: number) => {
    console.log('Phone clicked for store:', storeId);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <Header
        points={1200}
        notificationCount={2}
        cartItemCount={2}
        onCartClick={handleCartClick}
      />

      {/* Search Header */}
      <StoreSearchHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onLocationClick={handleLocationToggle}
        onSortChange={setSortBy}
        onFilterClick={() => {}}
        onReset={handleReset}
        selectedSort={sortBy}
        isOpenOnly={isOpenOnly}
        onToggleOpen={() => setIsOpenOnly((previous) => !previous)}
        isLocationSortEnabled={isLocationSortEnabled}
        isLocationLoading={locationLoading}
      />

      {/* Store List */}
      <div className="flex flex-col items-start w-full pt-[10px] pb-20">
        {isLoading ? (
          <div className="w-full px-6 py-10 text-center text-sm text-[#777]">
            매장 정보를 불러오는 중이에요...
          </div>
        ) : isError ? (
          <div className="w-full px-6 py-10 text-center text-sm text-[#777]">
            매장 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : storesWithDistance.length === 0 ? (
          <div className="w-full px-6 py-10 text-center text-sm text-[#777]">
            조건에 맞는 매장이 없어요.
          </div>
        ) : (
          storesWithDistance.map((store, index) => (
            <div
              key={store.id}
              className={index === 0 ? 'border-t border-[#F2F0F0]' : ''}
            >
              <StoreCard
                store={store}
                onPhoneClick={() => handlePhoneClick(store.id)}
                onClick={() => router.push(`/stores/${store.id}`)}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation */}
      <FooterNavigation />
    </div>
  );
}

export default function StoresPage() {
  return (
    <GeolocationProvider autoFetch={false}>
      <StoresPageContent />
    </GeolocationProvider>
  );
}
