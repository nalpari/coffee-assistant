'use client';

import { X } from 'lucide-react';

interface AiRecommendationHeaderProps {
  onClose?: () => void;
  disabled?: boolean;
}

export function AiRecommendationHeader({ 
  onClose, 
  disabled = false 
}: AiRecommendationHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[79px] w-full items-center justify-end bg-white px-6">
      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#E3E5E5] bg-white transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="닫기"
      >
        <X className="h-5 w-5 text-[#1C1C1C]" strokeWidth={1.5} />
      </button>
    </header>
  );
}
