'use client';

import { Star, MapPin, MessageSquare, ChevronRight } from 'lucide-react';

interface StoreInfoProps {
  name: string;
  description: string;
  orderCount: number;
  likeCount: number;
  reviewCount: number;
  notice?: string;
  onStoreInfoClick?: () => void;
  onReviewClick?: () => void;
  onFavoriteClick?: () => void;
  onNoticeClick?: () => void;
}

export function StoreInfo({
  name,
  description,
  orderCount,
  likeCount,
  reviewCount,
  notice,
  onStoreInfoClick,
  onReviewClick,
  onFavoriteClick,
  onNoticeClick,
}: StoreInfoProps) {
  return (
    <div className="flex w-full px-6 pt-8 pb-6 flex-col items-start border-b border-[#F2F0F0] bg-white">
      <div className="flex flex-col items-start gap-6 w-full">
        {/* Store Info Section */}
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex flex-col items-start gap-5 w-full">
            {/* Store Name */}
            <div className="flex flex-col justify-center items-start gap-4 w-full">
              <h2 className="text-[#1A1A1A] text-lg font-semibold leading-[150%] tracking-[-0.45px]">
                {name}
              </h2>
            </div>

            {/* Description & Stats */}
            <div className="flex flex-col justify-center items-start gap-2 w-full">
              {/* Description */}
              <div className="w-full text-[#1A1A1A] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                {description}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2">
                <div className="text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                  주문수 : {orderCount}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-[15px] h-[15px] fill-[#C7CAD3] stroke-none" />
                  <div className="text-[#777] text-sm font-normal leading-[150%] tracking-[-0.35px]">
                    {likeCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Button Area */}
          <div className="flex items-center gap-1.5 w-full">
            {/* 점포정보 Button */}
            <button
              type="button"
              onClick={() => {
                if (onStoreInfoClick) {
                  onStoreInfoClick();
                } else {
                  alert('기능 개발중');
                }
              }}
              className="flex flex-1 px-3.5 py-[11px] justify-center items-center gap-1 rounded-[80px] border border-[#EDEDED] bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <MapPin className="w-[18px] h-[18px] fill-[#C7CAD3] stroke-none" />
              <span className="text-[#444] text-sm font-medium leading-[150%] tracking-[-0.35px]">
                점포정보
              </span>
            </button>

            {/* 후기 Button */}
            <button
              type="button"
              onClick={() => {
                if (onReviewClick) {
                  onReviewClick();
                } else {
                  alert('기능 개발중');
                }
              }}
              className="flex flex-1 px-3.5 py-[11px] justify-center items-center gap-1 rounded-[80px] border border-[#EDEDED] bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <MessageSquare className="w-[18px] h-[18px] fill-[#C7CAD3] stroke-none" />
              <span className="text-[#444] text-sm font-medium leading-[150%] tracking-[-0.35px]">
                후기 ({reviewCount})
              </span>
            </button>

            {/* 찜 Button */}
            <button
              type="button"
              onClick={() => {
                if (onFavoriteClick) {
                  onFavoriteClick();
                } else {
                  alert('기능 개발중');
                }
              }}
              className="flex flex-1 px-3.5 py-[11px] justify-center items-center gap-1 rounded-[80px] border border-[#EDEDED] bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Star className="w-[18px] h-[18px] fill-[#C7CAD3] stroke-none" />
              <span className="text-[#444] text-sm font-medium leading-[150%] tracking-[-0.35px]">
                찜
              </span>
            </button>
          </div>
        </div>

        {/* Notice Section */}
        {notice && (
          <button
            type="button"
            onClick={onNoticeClick}
            className="flex py-px pr-1 pl-0 items-center gap-[18px] w-full hover:bg-gray-50 active:bg-gray-100 transition-colors rounded"
          >
            <div className="flex-1 text-[#777] text-sm font-normal leading-[140%] tracking-[-0.35px] text-left line-clamp-2">
              {notice}
            </div>
            <ChevronRight className="w-[6.5px] h-[13px] stroke-[#777] stroke-[1.5px]" />
          </button>
        )}
      </div>
    </div>
  );
}
