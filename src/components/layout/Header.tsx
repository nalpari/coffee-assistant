'use client';

import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { LogoutButton } from '@/components/auth/LogoutButton';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function Header({ searchQuery, onSearchChange, cartItemCount = 0, onCartClick }: HeaderProps) {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* 좌측: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">☕</span>
          <h1 className="text-xl font-bold hidden sm:block">Coffee Assistant</h1>
        </div>

        {/* 중앙: Search Bar */}
        <div className="flex-1 flex justify-center px-4 md:px-8 min-w-0">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="메뉴 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* 우측: Cart, Logout, Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {loading ? (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          ) : user ? (
            <>
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

              {/* Logout Icon Button */}
              <LogoutButton onSignOut={signOut} loading={loading} />

              {/* User Avatar */}
              <UserAvatar
                avatarUrl={user.user_metadata?.avatar_url}
                userName={user.user_metadata?.full_name || user.email}
                userEmail={user.email}
                size={32}
              />
            </>
          ) : (
            <div className="w-full sm:w-48">
              <GoogleSignInButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
