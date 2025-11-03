'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FooterNavButtonProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function FooterNavButton({
  icon: Icon,
  label,
  href,
  isActive,
  onClick,
  disabled = false,
}: FooterNavButtonProps) {
  // 준비중인 기능인 경우 버튼으로 렌더링
  if (disabled || onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
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

  // 활성화된 기능은 Link로 렌더링
  return (
    <Link
      href={href}
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
    </Link>
  );
}
