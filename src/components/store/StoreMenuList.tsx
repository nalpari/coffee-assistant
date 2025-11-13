'use client';

import { useState } from 'react';
import type { MenuItemDisplay } from '@/types/menu';
import { StoreMenuCategoryTabs } from './StoreMenuCategoryTabs';
import { StoreMenuSection } from './StoreMenuSection';

interface StoreMenuListProps {
  products: MenuItemDisplay[];
  onProductClick?: (product: MenuItemDisplay) => void;
}

export function StoreMenuList({
  products,
  onProductClick,
}: StoreMenuListProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 카테고리 목록 추출
  const categories = Array.from(
    new Map(
      products
        .filter((p) => p.categoryId && p.category)
        .map((p) => [p.categoryId, { id: p.categoryId!, name: p.category }])
    ).values()
  ).sort((a, b) => a.id - b.id);

  // 선택된 카테고리로 필터링
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  // 카테고리별로 제품 그룹핑
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const categoryName = product.category || '기타';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, MenuItemDisplay[]>);

  return (
    <div className="flex w-full flex-col gap-6 border-t border-[#F2F0F0] bg-white px-6 pb-6 pt-8">
      {/* 카테고리 탭 */}
      <div className="flex flex-col gap-[14px]">
        <StoreMenuCategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* 카테고리별 제품 섹션 */}
      <div className="flex flex-col gap-6">
        {Object.entries(productsByCategory).map(([categoryName, products]) => (
          <StoreMenuSection
            key={categoryName}
            categoryName={categoryName}
            products={products}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
}
