'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { StoreSearchHeader, type SortOption } from '@/components/store/StoreSearchHeader';
import { StoreCard } from '@/components/store/StoreCard';
import { FooterNavigation } from '@/components/layout/FooterNavigation';
import { useGeolocation } from '@/contexts/GeolocationContext';
import { calculateDistance, formatDistance } from '@/lib/location-utils';
import { useStoresQuery } from '@/hooks/use-stores-query';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_POSITION = { lat: 37.556960, lon: 126.934305 };

export default function StoresPage() {
  const router = useRouter();
  const { position: userPosition } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | undefined>('nearest');
  const [isOpenOnly, setIsOpenOnly] = useState(false);

  const effectivePosition = userPosition ?? DEFAULT_POSITION;

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

  const stores = data?.data ?? [];

  const storesWithDistance = useMemo(() => {
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
  }, [stores, effectivePosition.lat, effectivePosition.lon]);

  const handleSearchSubmit = () => {
    refetch();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSortBy('nearest');
    setIsOpenOnly(false);
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
        onLocationClick={() => refetch()}
        onSortChange={setSortBy}
        onFilterClick={() => {}}
        onReset={handleReset}
        selectedSort={sortBy}
        isOpenOnly={isOpenOnly}
        onToggleOpen={() => setIsOpenOnly((previous) => !previous)}
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
