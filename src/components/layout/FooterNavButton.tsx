'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FooterNavButtonProps {
  icon: LucideIcon;
  label: string;
  href: string; // Phase 2에서 사용 예정
  isActive: boolean;
}

export function FooterNavButton({
  icon: Icon,
  label,
  href: _href, // Phase 2에서 사용 예정 (unused prefix로 lint 경고 회피)
  isActive,
}: FooterNavButtonProps) {
  return (
    <button
      type="button"
      className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[56px] transition-colors duration-200"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'w-6 h-6 transition-colors duration-200',
          isActive ? 'text-black' : 'text-gray-400'
        )}
      />
      <span
        className={cn(
          'text-xs font-medium transition-colors duration-200',
          isActive ? 'text-black' : 'text-gray-400'
        )}
      >
        {label}
      </span>
    </button>
  );
}
