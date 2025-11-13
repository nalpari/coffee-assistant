'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StoreInfoHeader } from '@/components/layout/StoreInfoHeader';
import { StorePhotoSection, StoreInfo, StoreMenuList } from '@/components/store';
import { LoadingSpinner } from '@/components/menu/LoadingSpinner';
import { CartSheet } from '@/components/cart/CartSheet';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GeolocationProvider } from '@/contexts/GeolocationContext';
import { useCartStore } from '@/store/cart-store';
import { useCart } from '@/hooks/useCart';
import { useGeolocation } from '@/contexts/GeolocationContext';
import { useStoreQuery } from '@/hooks/use-stores-query';
import { useStoreMenuQuery } from '@/hooks/use-store-menu-query';

function StoreDetailPageContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const storeIdParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const numericStoreId = Number(storeIdParam);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { position } = useGeolocation();

  const { items } = useCartStore();
  const { setStoreId } = useCart();
  const cartItemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  // 매장 ID가 변경되면 장바구니에 저장
  useEffect(() => {
    if (numericStoreId && !Number.isNaN(numericStoreId)) {
      setStoreId(numericStoreId);
    }
  }, [numericStoreId, setStoreId]);

  const {
    data: store,
    isLoading: isStoreLoading,
    isError: isStoreError,
  } = useStoreQuery(storeIdParam ?? '', position?.lat, position?.lon);

  const {
    data: storeMenus,
    isLoading: isMenuLoading,
  } = useStoreMenuQuery(Number.isNaN(numericStoreId) ? null : numericStoreId);

  const isLoading = isStoreLoading || (isMenuLoading && !storeMenus);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StoreInfoHeader
          onBackClick={() => router.back()}
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
        />

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : isStoreError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#777]">
            <p>매장 정보를 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white"
            >
              이전 화면으로 돌아가기
            </button>
          </div>
        ) : !store ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-[#777]">
            <p>해당 매장을 찾을 수 없어요.</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white"
            >
              이전 화면으로 돌아가기
            </button>
          </div>
        ) : (
          <main className="flex-1 pb-24">
            <section className="bg-white">
              <StorePhotoSection
                image={store.image}
                imageUrl={store.imageUrl}
                status={store.status}
                orderCount={store.orderCount}
                hasCoupon={store.hasCoupon}
                hasStamp={store.hasStamp}
                hasEvent={Boolean(store.notice)}
              />
            </section>

            <section className="bg-white">
              <StoreInfo
                name={store.name}
                description={store.description ?? '매장 설명이 준비중입니다.'}
                orderCount={store.orderCount}
                likeCount={store.likeCount}
                reviewCount={store.commentCount}
                notice={store.notice}
              />
            </section>

            <section className="bg-white">
              {storeMenus && storeMenus.length > 0 ? (
                <StoreMenuList
                  products={storeMenus}
                  onProductClick={(product) => router.push(`/products/${product.id}?storeId=${numericStoreId}`)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-sm text-[#777]">
                  <p>등록된 메뉴가 없어요.</p>
                </div>
              )}
            </section>
          </main>
        )}

      <CartSheet 
        open={isCartOpen} 
        onOpenChange={setIsCartOpen}
        storeId={store?.id}
      />
    </div>
  );
}

export default function StoreDetailPage() {
  return (
    <ProtectedRoute>
      <GeolocationProvider autoFetch={false}>
        <StoreDetailPageContent />
      </GeolocationProvider>
    </ProtectedRoute>
  );
}

