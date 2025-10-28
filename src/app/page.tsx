'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CategoryTabs } from '@/components/menu/CategoryTabs';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { CartButton } from '@/components/cart/CartButton';
import { CartSheet } from '@/components/cart/CartSheet';
import { useCartStore } from '@/store/cart-store';
import { mockMenuItems } from '@/data/mock-menu';
import type { MenuItemDisplay } from '@/types/menu';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { getTotalItems, addItem } = useCartStore();

  // 필터링된 메뉴 아이템
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (item: MenuItemDisplay) => {
    // 장바구니에 아이템 추가
    addItem(item);
    // 장바구니 Sheet 열기
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="container mx-auto pb-24">
        <MenuGrid
          items={filteredItems}
          onItemClick={handleItemClick}
        />
      </main>

      <CartButton
        itemCount={getTotalItems()}
        onClick={() => setIsCartOpen(true)}
      />

      <CartSheet
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
      />
    </div>
  );
}
