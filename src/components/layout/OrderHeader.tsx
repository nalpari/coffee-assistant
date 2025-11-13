'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OrderHeaderProps {
  title: string;
  backHref?: string;
  onBackClick?: () => void;
  rightElement?: React.ReactNode;
}

export function OrderHeader({ 
  title,
  backHref,
  onBackClick,
  rightElement
}: OrderHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  const BackButton = backHref ? (
    <Link href={backHref}>
      <button
        type="button"
        className="absolute left-6 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2E2] transition-colors hover:bg-gray-50"
        style={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        }}
        aria-label="뒤로가기"
      >
        <ArrowLeft className="h-[18px] w-[18px] text-[#1C1C1C]" strokeWidth={1.5} />
      </button>
    </Link>
  ) : (
    <button
      type="button"
      onClick={handleBack}
      className="absolute left-6 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2E2] transition-colors hover:bg-gray-50"
      style={{
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      }}
      aria-label="뒤로가기"
    >
      <ArrowLeft className="h-[18px] w-[18px] text-[#1C1C1C]" strokeWidth={1.5} />
    </button>
  );

  return (
    <header
      className="sticky top-0 z-50 flex h-[68px] w-full items-center justify-center px-6 relative border-b transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottomColor: isScrolled ? '#EEE' : 'transparent',
      }}
    >
      {/* 왼쪽: 뒤로가기 버튼 */}
      {BackButton}

      {/* 중앙: 제목 */}
      <h1 
        className="text-center text-xl font-semibold leading-[150%] tracking-[-0.5px]"
        style={{ color: '#1A1A1A' }}
      >
        {title}
      </h1>

      {/* 오른쪽: 추가 요소 */}
      {rightElement && (
        <div className="absolute right-6 top-4">
          {rightElement}
        </div>
      )}
    </header>
  );
}

