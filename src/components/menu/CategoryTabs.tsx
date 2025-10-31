'use client';

import { Coffee, Droplet, Star, IceCream, LayoutGrid } from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: number | 'all';
  onCategoryChange: (category: number | 'all') => void;
}

// 실제 DB 카테고리 데이터 기반
const categories = [
  { id: 'all' as const, name: '전체', Icon: LayoutGrid },
  { id: 1, name: 'COFFEE', Icon: Coffee },
  { id: 2, name: 'NON-COFFEE', Icon: Droplet },
  { id: 3, name: 'SIGNATURE', Icon: Star },
  { id: 4, name: 'SMOOTHIE & FRAPPE', Icon: IceCream },
  { id: 5, name: 'ADE & TEA', Icon: Coffee },
  { id: 6, name: 'COLD BREW', Icon: Coffee },
];

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  // 선택된 카테고리 정보 찾기
  const selectedCategoryInfo = categories.find((cat) => cat.id === selectedCategory);
  const shouldShowName = selectedCategory !== 'all' && selectedCategoryInfo;

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background">
      <div className="container px-6 py-4 sm:px-8">
        <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
          {categories.map(({ id, name, Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                onClick={() => onCategoryChange(id)}
                className={`
                  flex items-center justify-center gap-2 rounded-full
                  transition-all duration-300 ease-in-out
                  px-3 py-2 sm:px-4 sm:py-2.5
                  cursor-pointer flex-shrink-0
                  ${isActive
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105'
                    : 'bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md hover:scale-105 text-gray-700 hover:text-orange-600'
                  }
                `}
              >
                {Icon && <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="font-medium hidden sm:inline whitespace-nowrap text-sm">{name}</span>
              </button>
            );
          })}
        </div>

        {/* 선택된 카테고리명 표시 영역 */}
        {shouldShowName && (
          <div
            className="border-t border-gray-200 pt-3 pb-2 mt-3 text-center transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2"
            role="status"
            aria-live="polite"
            aria-label="선택된 카테고리"
          >
            <p className="text-sm font-semibold text-primary tracking-wide">
              {selectedCategoryInfo.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
