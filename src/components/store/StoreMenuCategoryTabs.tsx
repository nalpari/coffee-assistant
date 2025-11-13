'use client';

import { Grid3x3 } from 'lucide-react';

interface StoreMenuCategoryTabsProps {
  categories: Array<{ id: number; name: string }>;
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function StoreMenuCategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
}: StoreMenuCategoryTabsProps) {
  const isAllSelected = selectedCategory === null;

  return (
    <div
      className="flex items-center gap-[6px] overflow-x-auto scrollbar-hide pb-[14px] scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
    >
      {/* 전체 버튼 */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`
          flex h-10 min-w-10 items-center justify-center rounded-full px-[14px] transition-colors
          ${
            isAllSelected
              ? 'bg-[#444] text-white'
              : 'border border-[#EDEDED] bg-white text-[#444] hover:bg-gray-50'
          }
        `}
        aria-label="전체"
        aria-pressed={isAllSelected}
      >
        <Grid3x3 className="h-[14px] w-[14px]" strokeWidth={1.5} />
      </button>

      {/* 카테고리 탭들 */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex h-10 items-center justify-center rounded-full px-[14px] transition-colors
              ${
                isSelected
                  ? 'bg-[#444] text-white'
                  : 'border border-[#EDEDED] bg-white text-[#444] hover:bg-gray-50'
              }
            `}
          >
            <span
              className={`whitespace-nowrap text-[14px] leading-[150%] tracking-[-0.35px] ${
                isSelected ? 'font-medium' : 'font-normal'
              }`}
            >
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
