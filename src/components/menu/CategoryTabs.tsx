'use client';

import { Coffee, Droplet, Star, IceCream } from 'lucide-react';

interface CategoryTabsProps {
  selectedCategory: number | 'all';
  onCategoryChange: (category: number | 'all') => void;
}

// 실제 DB 카테고리 데이터 기반
const categories = [
  { id: 'all' as const, name: '전체', Icon: null },
  { id: 1, name: 'COFFEE', Icon: Coffee },
  { id: 2, name: 'NON-COFFEE', Icon: Droplet },
  { id: 3, name: 'SIGNATURE', Icon: Star },
  { id: 4, name: 'SMOOTHIE & FRAPPE', Icon: IceCream },
  { id: 5, name: 'ADE & TEA', Icon: Coffee },
  { id: 6, name: 'COLD BREW', Icon: Coffee },
];

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background">
      <div className="container px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(({ id, name, Icon }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                onClick={() => onCategoryChange(id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full
                  whitespace-nowrap transition-colors touchable
                  ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-muted'
                  }
                `}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="font-medium">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
