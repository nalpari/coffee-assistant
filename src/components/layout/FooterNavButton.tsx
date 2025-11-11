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
  const content = (
    <>
      <Icon
        className={cn(
          'w-5 h-5 transition-colors duration-200'
        )}
        strokeWidth={1.5}
        style={{ 
          color: isActive ? '#1C1C1C' : '#C4C7CC',
          stroke: isActive ? '#1C1C1C' : '#C4C7CC'
        }}
      />
      <span
        className="text-[10px] font-medium leading-[150%] tracking-[-0.25px] transition-colors duration-200"
        style={{ color: isActive ? '#1C1C1C' : '#C4C7CC' }}
      >
        {label}
      </span>
    </>
  );

  const className = "flex flex-col items-center justify-center gap-1.5 h-full px-2 transition-colors duration-200";

  // 준비중인 기능인 경우 버튼으로 렌더링
  if (disabled || onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </button>
    );
  }

  // 활성화된 기능은 Link로 렌더링
  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}
