'use client';

import { MenuCard } from './MenuCard';
import type { MenuItemDisplay } from '@/types/menu';

interface MenuGridProps {
  items: MenuItemDisplay[];
  onItemClick: (item: MenuItemDisplay) => void;
}

export function MenuGrid({ items, onItemClick }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-lg">메뉴를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
}
