'use client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8" data-testid="loading-spinner">
      <div className="flex flex-col items-center gap-3">
        {/* 스피너 애니메이션 */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
        </div>

        {/* 로딩 텍스트 */}
        <p className="text-sm text-gray-600 font-medium">
          메뉴를 불러오는 중...
        </p>
      </div>
    </div>
  );
}
