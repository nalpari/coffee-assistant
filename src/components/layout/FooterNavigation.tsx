'use client';

import { usePathname } from 'next/navigation';
import { Home, Receipt, Sparkles, Ticket, User } from 'lucide-react';
import { FooterNavButton } from './FooterNavButton';

export function FooterNavigation() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: '홈', href: '/' },
    { icon: Receipt, label: '주문내역', href: '/orders' },
    { icon: Sparkles, label: 'AI추천', href: '/ai-recommendations' },
    { icon: Ticket, label: '쿠폰', href: '/coupons' },
    { icon: User, label: '마이', href: '/profile' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-50 lg:hidden">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <FooterNavButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </footer>
  );
}
