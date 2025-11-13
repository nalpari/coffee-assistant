'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export function FooterNavigation() {
  const pathname = usePathname();

  // AI 추천 페이지에서는 푸터 숨김
  if (pathname === '/ai-recommendations') {
    return null;
  }

  const handleComingSoon = (featureName: string) => {
    alert(`${featureName} 기능은 준비중입니다.`);
  };

  const isHomeActive = pathname === '/';
  const isFavoritesActive = pathname === '/favorites';
  const isAIActive = pathname === '/ai-recommendations';
  const isOrdersActive = pathname === '/orders';
  const isProfileActive = pathname === '/profile';

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Flat background bar */}
      <div className="relative w-full h-[68px] bg-white">
        {/* Border line positioned 10px from top */}
        <div className="absolute top-[10px] left-0 right-0 h-px bg-[#EDEDED]" />
        {/* Navigation Items Container - Responsive Flexbox */}
        <div className="relative h-full w-full max-w-[600px] mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between h-full pb-[10px]">
            {/* 1. 홈 */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-[6px] min-w-[60px] flex-1"
              aria-label="홈"
              aria-current={isHomeActive ? 'page' : undefined}
            >
            <div className="relative w-5 h-5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M1.10139 11.9635C0.748375 9.66624 0.571865 8.51763 1.00617 7.49938C1.44047 6.48112 2.40403 5.78443 4.33114 4.39106L5.77099 3.35C8.16829 1.61667 9.36694 0.75 10.75 0.75C12.1331 0.75 13.3317 1.61667 15.729 3.35L17.1689 4.39106C19.096 5.78443 20.0595 6.48112 20.4938 7.49938C20.9281 8.51763 20.7516 9.66624 20.3986 11.9635L20.0976 13.9224C19.5971 17.1789 19.3469 18.8072 18.179 19.7786C17.0111 20.75 15.3037 20.75 11.8888 20.75H9.61119C6.19634 20.75 4.48891 20.75 3.321 19.7786C2.15309 18.8072 1.90287 17.1789 1.40243 13.9224L1.10139 11.9635Z" 
                  stroke={isHomeActive ? "#1C1C1C" : "#C4C7CC"}
                  strokeWidth="1.5" 
                  strokeLinejoin="round"
                  fill="none"
                />
                <rect
                  x="7"
                  y="10"
                  width="6"
                  height="6"
                  rx="2"
                  stroke={isHomeActive ? "#1C1C1C" : "#C4C7CC"}
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <span 
              className="text-[10px] font-medium leading-[150%]"
              style={{ 
                color: isHomeActive ? '#1C1C1C' : '#C4C7CC',
                letterSpacing: '-0.25px',
                fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif'
              }}
            >
              홈
            </span>
          </Link>

            {/* 2. 찜 */}
            <button
              onClick={() => handleComingSoon('찜')}
              className="flex flex-col items-center justify-center gap-[6px] min-w-[60px] flex-1"
              aria-label="찜"
            >
            <div className="relative w-5 h-5">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.3063 2.04976L12.8902 5.24359C13.1061 5.68818 13.6821 6.11463 14.168 6.19629L17.0387 6.67718C18.8745 6.98567 19.3065 8.32853 17.9836 9.65325L15.7519 11.9034C15.3739 12.2845 15.1669 13.0195 15.2839 13.5457L15.9228 16.3312C16.4268 18.5361 15.2659 19.389 13.3311 18.2367L10.6404 16.6307C10.1545 16.3403 9.35356 16.3403 8.85862 16.6307L6.16791 18.2367C4.24213 19.389 3.07226 18.527 3.5762 16.3312L4.21513 13.5457C4.33212 13.0195 4.12514 12.2845 3.74718 11.9034L1.51543 9.65325C0.201572 8.32853 0.624526 6.98567 2.46032 6.67718L5.33101 6.19629C5.80795 6.11463 6.38389 5.68818 6.59987 5.24359L8.18369 2.04976C9.0476 0.316747 10.4514 0.316747 11.3063 2.04976Z"
                  stroke={isFavoritesActive ? "#1C1C1C" : "#C4C7CC"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span 
              className="text-[10px] font-medium leading-[150%]"
              style={{ 
                color: isFavoritesActive ? '#1C1C1C' : '#C4C7CC',
                letterSpacing: '-0.25px',
                fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif'
              }}
            >
              찜
            </span>
          </button>

            {/* 3. AI - Center button with elevated icon */}
            <Link
              href="/ai-recommendations"
              className="flex flex-col items-center justify-center gap-[6px] min-w-[70px] flex-1"
              aria-label="AI"
              aria-current={isAIActive ? 'page' : undefined}
            >
            {/* Icon Container - elevated above baseline */}
            <div className="relative w-[42px] h-[42px] flex items-center justify-center -mt-[22px]">
              <Image
                src="https://api.builder.io/api/v1/image/assets/TEMP/b4d9f6824ed2cce099fd86367b8c233ec9961e82?width=84"
                alt="AI"
                width={42}
                height={42}
                className="object-contain"
              />
            </div>
            {/* AI Text */}
            <span
              className="text-[10px] font-medium leading-[150%]"
              style={{
                color: isAIActive ? '#1C1C1C' : '#C4C7CC',
                letterSpacing: '-0.25px',
                fontFamily: 'Pretendard, -apple-system, Roboto, Helvetica, sans-serif'
              }}
            >
              AI
            </span>
          </Link>

            {/* 4. 주문내역 */}
            <Link
              href="/orders"
              className="flex flex-col items-center justify-center gap-[6px] min-w-[60px] flex-1"
              aria-label="주문내역"
              aria-current={isOrdersActive ? 'page' : undefined}
            >
            <svg width="34" height="35" viewBox="0 0 34 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.5 8.75C8.5 4.97876 8.5 3.09315 9.7448 1.92157C10.9896 0.75 12.9931 0.75 17 0.75H17.7727C21.0339 0.75 22.6645 0.75 23.7969 1.54784C24.1214 1.77643 24.4094 2.04752 24.6523 2.35289C25.5 3.41867 25.5 4.95336 25.5 8.02273V10.5682C25.5 13.5314 25.5 15.0129 25.0311 16.1962C24.2772 18.0986 22.6829 19.5991 20.6616 20.3086C19.4044 20.75 17.8302 20.75 14.6818 20.75C12.8827 20.75 11.9832 20.75 11.2648 20.4978C10.1098 20.0924 9.19875 19.2349 8.76796 18.1479C8.5 17.4717 8.5 16.6251 8.5 14.9318V8.75Z"
                stroke={isOrdersActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M25.5 10.75C25.5 12.5909 24.0076 14.0833 22.1667 14.0833C21.5009 14.0833 20.716 13.9667 20.0686 14.1401C19.4935 14.2942 19.0442 14.7435 18.8901 15.3186C18.7167 15.966 18.8333 16.7509 18.8333 17.4167C18.8333 19.2576 17.3409 20.75 15.5 20.75"
                stroke={isOrdersActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 5.75H20"
                stroke={isOrdersActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 9.75H16"
                stroke={isOrdersActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                fill={isOrdersActive ? "#1C1C1C" : "#C4C7CC"}
                xmlSpace="preserve"
                style={{ whiteSpace: 'pre' }}
                fontFamily="Pretendard"
                fontSize="10"
                letterSpacing="-0.025em"
              >
                <tspan x="0.0898438" y="33.8203">주문내역</tspan>
              </text>
            </svg>
          </Link>

            {/* 5. 마이페이지 */}
            <button
              onClick={() => handleComingSoon('마이페이지')}
              className="flex flex-col items-center justify-center gap-[6px] min-w-[60px] flex-1"
              aria-label="마이페이지"
            >
            <svg width="43" height="35" viewBox="0 0 43 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M31.5 4.25C31.5 6.183 29.933 7.75 28 7.75C26.067 7.75 24.5 6.183 24.5 4.25C24.5 2.317 26.067 0.75 28 0.75C29.933 0.75 31.5 2.317 31.5 4.25Z"
                stroke={isProfileActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
              />
              <path
                d="M31.4506 9.75C31.4833 10.0789 31.5 10.4125 31.5 10.75C31.5 16.2728 27.0228 20.75 21.5 20.75C15.9772 20.75 11.5 16.2728 11.5 10.75C11.5 5.22715 15.9772 0.75 21.5 0.75C21.8375 0.75 22.1711 0.766719 22.5 0.799375"
                stroke={isProfileActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M17.5 8.75H21.5"
                stroke={isProfileActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 13.75H25.5"
                stroke={isProfileActive ? "#1C1C1C" : "#C4C7CC"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                fill={isProfileActive ? "#1C1C1C" : "#C4C7CC"}
                xmlSpace="preserve"
                style={{ whiteSpace: 'pre' }}
                fontFamily="Pretendard"
                fontSize="10"
                letterSpacing="-0.025em"
              >
                <tspan x="0.393555" y="33.8203">마이페이지</tspan>
              </text>
            </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
