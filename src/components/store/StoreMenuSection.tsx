'use client';

import type { MenuItemDisplay } from '@/types/menu';
import { StoreMenuProductCard } from './StoreMenuProductCard';

interface StoreMenuSectionProps {
  categoryName: string;
  products: MenuItemDisplay[];
  onProductClick?: (product: MenuItemDisplay) => void;
}

export function StoreMenuSection({
  categoryName,
  products,
  onProductClick,
}: StoreMenuSectionProps) {
  if (products.length === 0) return null;

  return (
    <div className="flex flex-col gap-[18px]">
      {/* 카테고리 제목 */}
      <div className="flex items-center gap-[10px] px-1">
        <h2 className="text-[16px] font-semibold leading-[150%] tracking-[-0.4px] text-[#1A1A1A]">
          {categoryName}
        </h2>
      </div>

      {/* 제품 목록 */}
      <div className="flex flex-col gap-[18px]">
        {products.map((product) => (
          <StoreMenuProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            discountPrice={product.discountPrice}
            image={product.image}
            available={product.available}
            onClick={() => onProductClick?.(product)}
          />
        ))}
      </div>
    </div>
  );
}
