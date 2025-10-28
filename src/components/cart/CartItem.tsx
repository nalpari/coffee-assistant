'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const displayPrice = item.discountPrice ?? item.price;
  const hasDiscount = item.discountPrice !== null && item.discountPrice !== undefined;

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {/* 이미지 */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* 상품 정보 및 수량 조절 */}
      <div className="flex-1 flex flex-col gap-2">
        {/* 상품명 및 삭제 버튼 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
            {item.badge && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={() => onRemove(item.id)}
            aria-label="상품 삭제"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 가격 및 수량 조절 */}
        <div className="flex items-center justify-between">
          {/* 가격 */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-semibold text-primary">
                  {displayPrice.toLocaleString()}원
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {item.price.toLocaleString()}원
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold">
                {displayPrice.toLocaleString()}원
              </span>
            )}
          </div>

          {/* 수량 조절 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="수량 감소"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="수량 증가"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* 소계 */}
        <div className="text-right text-sm text-muted-foreground">
          소계: <span className="font-semibold text-foreground">{(displayPrice * item.quantity).toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}
