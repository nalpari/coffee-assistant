'use client';

import { usePathname } from 'next/navigation';
import { Home, Receipt, Sparkles, Ticket, User } from 'lucide-react';
import { FooterNavButton } from './FooterNavButton';

export function FooterNavigation() {
  const pathname = usePathname();

  const handleComingSoon = (featureName: string) => {
    alert(`${featureName} 기능은 준비중입니다.`);
  };

  const navItems = [
    { icon: Home, label: '홈', href: '/', enabled: true },
    { icon: Receipt, label: '주문내역', href: '/orders', enabled: true },
    { icon: Sparkles, label: 'AI추천', href: '/ai-recommendations', enabled: true },
    { icon: Ticket, label: '쿠폰', href: '/coupons', enabled: false },
    { icon: User, label: '마이', href: '/profile', enabled: false },
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
            onClick={!item.enabled ? () => handleComingSoon(item.label) : undefined}
            disabled={!item.enabled}
          />
        ))}
      </nav>
    </footer>
  );
}
