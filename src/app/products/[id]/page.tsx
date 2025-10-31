'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QuantityControl } from '@/components/product/QuantityControl';
import { LoadingSpinner } from '@/components/menu/LoadingSpinner';
import { useProductQuery } from '@/hooks/use-product-query';
import { useCartStore } from '@/store/cart-store';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const { addItem } = useCartStore();

  const { data: product, isLoading, isError, error } = useProductQuery({
    productId,
  });

  const handleAddToCart = () => {
    if (!product || !product.available) return;

    // 수량만큼 반복해서 추가 (또는 store에서 수량 처리)
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }

    // 성공 피드백 (향후 toast 메시지 추가 가능)
    alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`);
  };

  const handleGoBack = () => {
    router.push('/');
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 에러 상태
  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">
          {error?.message || '상품 정보를 불러오는데 실패했습니다.'}
        </p>
        <Button onClick={handleGoBack}>돌아가기</Button>
      </div>
    );
  }

  const hasValidImage = product.image !== null && product.image.trim() !== '';
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-4 text-lg font-semibold">상품 상세</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
            {hasValidImage && !imageError && product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onError={() => setImageError(true)}
                unoptimized={!product.image.startsWith('http')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">☕</div>
                  <p className="text-lg text-muted-foreground">이미지 준비중</p>
                </div>
              </div>
            )}

            {/* Out of Stock Overlay */}
            {!product.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white font-bold text-2xl">품절</span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{product.category}</Badge>
                {product.popular && (
                  <Badge className="bg-accent text-accent-foreground">인기</Badge>
                )}
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {!product.available && (
                <Badge variant="destructive" className="mb-2">
                  품절
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-baseline gap-3">
                  {product.discountPrice && (
                    <p className="text-lg text-muted-foreground line-through">
                      {product.price.toLocaleString('ko-KR')}원
                    </p>
                  )}
                  <p className="text-3xl font-bold text-primary">
                    {displayPrice.toLocaleString('ko-KR')}원
                  </p>
                </div>
                {product.discountPrice && (
                  <p className="text-sm text-red-500 mt-2">
                    {Math.round(
                      ((product.price - product.discountPrice) / product.price) * 100
                    )}
                    % 할인
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quantity Control */}
            <div>
              <label className="text-sm font-medium mb-2 block">수량</label>
              <QuantityControl value={quantity} onChange={setQuantity} />
            </div>

            {/* Add to Cart Button */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full text-lg h-14"
                onClick={handleAddToCart}
                disabled={!product.available}
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.available
                  ? `${(displayPrice * quantity).toLocaleString('ko-KR')}원 담기`
                  : '품절'}
              </Button>

              {product.available && (
                <p className="text-sm text-muted-foreground text-center">
                  총 {quantity}개 ·{' '}
                  {(displayPrice * quantity).toLocaleString('ko-KR')}원
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
