'use client';

import type { Store } from '@/types/store';

interface StorePhotoSectionProps {
  image?: string;
  imageUrl?: string;
  status: Store['status'];
  orderCount: number;
  hasCoupon: boolean;
  hasStamp: boolean;
  hasEvent?: boolean;
}

export function StorePhotoSection({
  image,
  imageUrl,
  status,
  orderCount,
  hasCoupon,
  hasStamp,
  hasEvent = false,
}: StorePhotoSectionProps) {
  const resolveLocalImagePath = (value?: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.replace(/^\/+/, '');
  };

  const sanitizedImageUrl = imageUrl?.trim();
  const sanitizedImage = resolveLocalImagePath(image);
  const backgroundSource =
    sanitizedImageUrl || `/${sanitizedImage ?? 'coffee_default.png'}`;
  const backgroundImageStyle = `url(${encodeURI(backgroundSource)})`;

  const getStatusText = () => {
    switch (status) {
      case 'inactive':
      case 'closed':
        return '준비중';
      case 'active':
        return '영업중';
      default:
        return '준비중';
    }
  };

  return (
    <div className="relative w-full aspect-square flex-shrink-0">
      {/* 매장 사진 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: backgroundImageStyle }}
      >
        {/* 정보 배��� 영역 (중앙) */}
        <div className="absolute left-1/2 top-[145px] -translate-x-1/2 inline-flex flex-col items-start gap-1.5 w-[100px] h-[86px]">
          {/* 상태 배지 */}
          <div className="flex h-10 min-w-[100px] px-3 justify-center items-center self-stretch rounded-full bg-black/60">
            <div className="text-[#D9D9D9] text-sm font-semibold leading-[150%] tracking-[-0.35px]">
              {getStatusText()}
            </div>
          </div>

          {/* 주문수 배지 */}
          <div className="flex h-10 px-3 justify-center items-center self-stretch rounded-full bg-black/60">
            <div className="text-[#D9D9D9] text-sm font-semibold leading-[150%] tracking-[-0.35px]">
              주문수 {orderCount}
            </div>
          </div>
        </div>

        {/* 구분 배지 영역 (하단) */}
        <div className="absolute left-6 bottom-[38px] inline-flex items-center gap-1.5 h-5">
          {/* 쿠폰 배지 */}
          {hasCoupon && (
            <div className="flex h-5 pr-2 justify-center items-center gap-1 rounded-[66px] border border-[rgba(249,131,59,0.7)] bg-[rgba(249,131,59,0.7)]">
              <div className="flex w-5 h-5 px-0.5 flex-col justify-center items-center aspect-square rounded-full bg-white">
                <div className="text-[#F9833B] text-center text-[11px] font-black leading-[150%] tracking-[-0.275px]">
                  C
                </div>
              </div>
              <div className="text-white text-xs font-medium leading-[150%] tracking-[-0.3px]">
                쿠폰
              </div>
            </div>
          )}

          {/* 스탬프 배지 */}
          {hasStamp && (
            <div className="flex h-5 pr-2 justify-center items-center gap-1 rounded-[66px] border border-[rgba(79,191,255,0.7)] bg-[rgba(79,191,255,0.7)]">
              <div className="flex w-5 h-5 px-0.5 flex-col justify-center items-center aspect-square rounded-full bg-white">
                <div className="text-[#4FBFFF] text-center text-[11px] font-black leading-[150%] tracking-[-0.275px]">
                  S
                </div>
              </div>
              <div className="text-white text-xs font-medium leading-[150%] tracking-[-0.3px]">
                스탬프
              </div>
            </div>
          )}

          {/* 매장 진행 이벤트 배지 */}
          {hasEvent && (
            <div className="flex h-5 pr-2 justify-center items-center gap-1 rounded-[66px] border border-[rgba(243,74,90,0.7)] bg-[rgba(243,74,90,0.7)]">
              <div className="flex w-5 h-5 px-0.5 flex-col justify-center items-center aspect-square rounded-full bg-white">
                <div className="text-[#F34A5A] text-center text-[11px] font-black leading-[150%] tracking-[-0.275px]">
                  E
                </div>
              </div>
              <div className="text-white text-xs font-medium leading-[150%] tracking-[-0.3px]">
                매장 진행 이벤트
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
