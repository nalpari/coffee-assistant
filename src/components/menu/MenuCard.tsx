'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MenuItemDisplay } from '@/types/menu';

interface MenuCardProps {
  item: MenuItemDisplay;
  onClick: () => void;
  onAddToCart?: (e: React.MouseEvent) => void;
}

export function MenuCard({ item, onClick, onAddToCart }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = item.image !== null && item.image.trim() !== '';

  // 이벤트 버블링 방지
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(e);
  };

  // 이미지 에러 핸들링
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      onClick={onClick}
      className={`
        cursor-pointer transition-all hover:shadow-lg
        ${!item.available && 'opacity-50'}
      `}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-muted">
          {hasValidImage && !imageError ? (
            <Image
              src={item.image!}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={handleImageError}
              unoptimized={true}
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">☕</div>
                <p className="text-sm text-muted-foreground">이미지 준비중</p>
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.popular && (
              <Badge className="bg-accent text-accent-foreground">인기</Badge>
            )}
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          {/* Add to Cart Button */}
          {item.available && onAddToCart && (
            <Button
              size="icon"
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
              aria-label={`${item.name} 장바구니에 담기`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          )}
          {/* Out of Stock Overlay */}
          {!item.available && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white font-bold text-lg">품절</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
          <div className="flex items-center gap-2">
            {item.discountPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {item.price.toLocaleString('ko-KR')}원
              </p>
            )}
            <p className="text-primary font-bold text-xl">
              {(item.discountPrice ?? item.price).toLocaleString('ko-KR')}원
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
