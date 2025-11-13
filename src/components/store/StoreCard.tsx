'use client';

import type { KeyboardEvent } from 'react';
import { Heart, MessageCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Store } from '@/types/store';

interface StoreCardProps {
  store: Store;
  onPhoneClick?: () => void;
  onClick?: () => void;
}

export function StoreCard({ store, onPhoneClick, onClick }: StoreCardProps) {
  const resolveLocalImagePath = (value?: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.replace(/^\/+/, '');
  };

  const sanitizedImageUrl = store.imageUrl?.trim();
  const sanitizedImage = resolveLocalImagePath(store.image);
  const backgroundSource =
    sanitizedImageUrl || `/${sanitizedImage ?? 'coffee_default.png'}`;
  const backgroundImageStyle = `url(${encodeURI(backgroundSource)})`;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        'flex w-full px-6 py-7 border-t border-[#F2F0F0] bg-white transition-colors',
        onClick ? 'cursor-pointer hover:bg-[#FDFDFD]' : ''
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${store.name} 상세 보기` : undefined}
    >
      <div className="flex items-start gap-6 w-full">
        {/* 썸네일 */}
        <div className="flex flex-col justify-center items-center flex-shrink-0">
          <div
            className="flex w-[140px] h-[140px] p-3.5 flex-col items-start rounded-[32px] bg-[#F2F2F2] relative bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: backgroundImageStyle }}
          >
            {/* 배지 그룹 */}
            <div className="flex flex-col justify-center items-start gap-1">
              {/* 쿠폰 배지 */}
              {store.hasCoupon && (
                <div className="flex h-5 pr-2 justify-center items-center gap-1 rounded-[66px] border border-[#F9833B] bg-[#F9833B]">
                  <div className="flex w-5 h-5 px-0.5 flex-col justify-center items-center rounded-full bg-white">
                    <div className="text-[#F9833B] text-center text-[11px] font-black leading-[150%] tracking-[-0.275px]">
                      C
                    </div>
                  </div>
                  <div className="text-white text-xs font-medium leading-[150%] tracking-[-0.3px]">
                    쿠폰
                  </div>
                </div>
              )}
              
              {/* 스템프 배지 */}
              {store.hasStamp && (
                <div className="flex h-5 pr-2 justify-center items-center gap-1 rounded-[66px] border border-[#4FBFFF] bg-[#4FBFFF]">
                  <div className="flex w-5 h-5 px-0.5 flex-col justify-center items-center rounded-full bg-white">
                    <div className="text-[#4FBFFF] text-center text-[11px] font-black leading-[150%] tracking-[-0.275px]">
                      S
                    </div>
                  </div>
                  <div className="text-white text-xs font-medium leading-[150%] tracking-[-0.3px]">
                    스템프
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="flex flex-col justify-between items-start flex-1 min-w-0 h-[140px]">
          <div className="flex flex-col items-start w-full">
            {/* 매장 이름 */}
            <div className="mb-2 w-full">
              <div className="text-[#1A1A1A] text-[15px] font-semibold leading-[150%] tracking-[-0.375px]">
                {store.name}
              </div>
            </div>

            {/* 메뉴 아이템 - 매장 이름 바로 아래 */}
            {store.menuName && (
              <div className="mb-1 w-full text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                {store.menuName}
              </div>
            )}

            {/* 통계 정보 */}
            <div className="flex items-center gap-[6px] mb-1">
              {/* 좋아요 */}
              <div className="flex items-center gap-1">
                <Heart className="w-[15px] h-[15px] fill-[#C7CAD3] stroke-none" />
                <div className="text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                  {store.likeCount}
                </div>
              </div>

              {/* 댓글 */}
              <div className="flex items-center gap-1">
                <MessageCircle className="w-[15px] h-[15px] fill-[#C7CAD3] stroke-none" />
                <div className="text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                  {store.commentCount}
                </div>
              </div>

              {/* 주문 수 */}
              <div className="text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                주문수 : {store.orderCount}
              </div>
            </div>

            {/* 거리 정보 */}
            <div className="flex items-center gap-1">
              <MapPin className="w-[15px] h-[15px] fill-[#C7CAD3] stroke-none" />
              <div className="text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                {store.distance ?? '거리 정보 없음'}
              </div>
            </div>
          </div>

          {/* 전화 버튼 */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPhoneClick?.();
            }}
            className="flex h-8 px-3 justify-center items-center rounded-[80px] border border-[#EDEDED] bg-white text-[#444] text-sm font-medium leading-[150%] tracking-[-0.35px] hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            전화
          </button>
        </div>
      </div>
    </div>
  );
}
