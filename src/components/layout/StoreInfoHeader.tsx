'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface StoreInfoHeaderProps {
  title?: string;
  onBackClick?: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function StoreInfoHeader({ 
  title = '매장 정보',
  onBackClick,
  cartItemCount = 0,
  onCartClick
}: StoreInfoHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartLabel =
    cartItemCount > 0 ? `장바구니 ${cartItemCount}개` : '장바구니 비어 있음';

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
      <button
        type="button"
        onClick={onBackClick}
        className="absolute left-6 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2E2] transition-colors hover:bg-gray-50"
        style={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        }}
        aria-label="뒤로가기"
      >
        <ArrowLeft className="h-[18px] w-[18px] text-[#1C1C1C]" strokeWidth={1.5} />
      </button>

      {/* 중앙: 제목 */}
      <h1 
        className="text-center text-xl font-semibold leading-[150%] tracking-[-0.5px]"
        style={{ color: '#1A1A1A' }}
      >
        {title}
      </h1>

      {/* 오른쪽: 장바구니 */}
      <button
        type="button"
        onClick={onCartClick}
        className="absolute right-6 top-[18px] flex h-8 w-8 items-center justify-center"
        aria-label={cartLabel}
      >
        <svg
          width="30"
          height="31"
          viewBox="0 0 30 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[30px] w-[29px]"
        >
          <path
            d="M3.75 10L0.75 14V28C0.75 28.5304 0.960714 29.0391 1.33579 29.4142C1.71086 29.7893 2.21957 30 2.75 30H16.75C17.2804 30 17.7891 29.7893 18.1642 29.4142C18.5393 29.0391 18.75 28.5304 18.75 28V14L15.75 10H3.75Z"
            stroke="#1C1C1C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0.75 14H18.75"
            stroke="#1C1C1C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.75 18C13.75 19.0609 13.3286 20.0783 12.5784 20.8284C11.8283 21.5786 10.8109 22 9.75 22C8.68913 22 7.67172 21.5786 6.92157 20.8284C6.17143 20.0783 5.75 19.0609 5.75 18"
            stroke="#1C1C1C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {cartItemCount > 0 && (
          <div className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1C1C1C] px-1 ring-2 ring-white">
            <span className="text-[10px] font-medium leading-none text-white">
              {cartItemCount}
            </span>
          </div>
        )}
      </button>
    </header>
  );
}
