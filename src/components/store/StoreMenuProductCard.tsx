'use client';

import Image from 'next/image';
import { useState } from 'react';

interface StoreMenuProductCardProps {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string | null;
  available: boolean;
  onClick?: () => void;
}

export function StoreMenuProductCard({
  name,
  price,
  discountPrice,
  image,
  available,
  onClick,
}: StoreMenuProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = image !== null && image.trim() !== '';
  const finalPrice = discountPrice ?? price;
  const hasDiscount = discountPrice !== undefined && discountPrice < price;

  return (
    <div
      className="relative flex w-full cursor-pointer items-start gap-6"
      onClick={onClick}
    >
      {/* 이미지 */}
      <div className="relative flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[32px] bg-[#F8F8F8]">
        {hasValidImage && !imageError ? (
          <Image
            src={image!}
            alt={name}
            fill
            className="object-contain"
            sizes="100px"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">☕</span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-1 flex-col gap-3 py-3">
        {/* 제품명 */}
        <h3 className="self-stretch text-[15px] font-medium leading-[68px] tracking-[-0.375px] text-[#1A1A1A]">
          {name}
        </h3>

        {/* 가격 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-[6px]">
            {/* 최종 가격 */}
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] leading-normal tracking-[-0.375px] text-[#1A1A1A]">
              <span className="font-semibold">{finalPrice.toLocaleString('ko-KR')}</span>
              <span className="font-medium">원</span>
            </p>

            {/* 할인 전 가격 */}
            {hasDiscount && (
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-normal leading-normal tracking-[-0.35px] text-[#777] line-through">
                {price.toLocaleString('ko-KR')}원
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 품절 오버레이 */}
      {!available && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[32px] bg-white/90">
          <p className="text-[17px] font-medium leading-[68px] tracking-[-0.425px] text-[#1A1A1A]">
            일시품절
          </p>
        </div>
      )}
    </div>
  );
}
