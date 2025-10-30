'use client';

import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function Header({ searchQuery, onSearchChange, cartItemCount = 0, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <h1 className="text-xl font-bold hidden sm:block">Coffee Assistant</h1>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="메뉴 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Cart Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onCartClick}
          aria-label={`장바구니, ${cartItemCount}개 아이템`}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50 ring-2 ring-white animate-pulse"
              variant="destructive"
            >
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
