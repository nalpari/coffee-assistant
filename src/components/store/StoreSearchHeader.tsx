'use client';

import { Search, MapPin, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'nearest' | 'popular' | 'recent';

interface StoreSearchHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onLocationClick?: () => void;
  onSortChange?: (sort: SortOption | undefined) => void;
  onFilterClick?: () => void;
  onReset: () => void;
  selectedSort?: SortOption;
  isOpenOnly: boolean;
  onToggleOpen: () => void;
}

export function StoreSearchHeader({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onLocationClick,
  onSortChange,
  onFilterClick,
  onReset,
  selectedSort,
  isOpenOnly,
  onToggleOpen,
}: StoreSearchHeaderProps) {
  const handleNearestClick = () => {
    onSortChange?.(selectedSort === 'nearest' ? undefined : 'nearest');
  };

  const handleSearchButtonClick = () => {
    onSearchSubmit?.();
  };

  return (
    <div className="flex flex-col items-start gap-5 self-stretch border-b border-[#F2F0F0] bg-white px-6 pb-[18px] pt-6">
      {/* Search Input Section */}
      <div className="flex items-start gap-2 self-stretch">
        {/* Search Form */}
        <div className="relative flex h-11 flex-1 items-center justify-end gap-2.5 rounded-full bg-[#F6F7F9] pl-[18px]">
          <input
            type="text"
            placeholder="점포명 또는 메뉴"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSearchSubmit?.();
              }
            }}
            className="flex-1 bg-transparent text-[15px] font-medium leading-[150%] tracking-[-0.375px] text-[#444] placeholder:text-[#999] focus:outline-none"
          />
          {/* Clear Button */}
          {searchValue.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="flex h-[52px] w-[52px] items-center justify-center"
              aria-label="검색어 지우기"
            >
              <X className="h-[18px] w-[18px] text-[#999]" strokeWidth={1.5} />
            </button>
          )}
          <button
            type="button"
            onClick={handleSearchButtonClick}
            className="flex h-[52px] w-[52px] items-center justify-center -ml-2.5"
            aria-label="검색"
          >
            <Search className="h-[22px] w-[22px] text-[#999]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Location Button */}
        <button
          type="button"
          onClick={onLocationClick}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E2E2E2] bg-white"
          aria-label="위치 설정"
        >
          <MapPin className="h-5 w-5 text-[#444]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Filter Settings Section */}
      <div className="flex flex-col items-start gap-3.5 self-stretch">
        <div className="flex h-11 items-center justify-between gap-2 self-stretch">
          {/* 가까운 순 버튼 */}
          <button
            type="button"
            onClick={handleNearestClick}
            className={cn(
              'flex h-11 items-center justify-center rounded-full px-2 text-[14px] font-normal leading-[150%] tracking-[-0.35px] transition-colors cursor-pointer',
              selectedSort === 'nearest'
                ? 'bg-[#444] text-white border border-[#444]'
                : 'border border-[#EDEDED] bg-white text-[#444]'
            )}
            aria-pressed={selectedSort === 'nearest'}
          >
            <span>가까운 순</span>
          </button>

          {/* 영업중 버튼 */}
          <button
            type="button"
            onClick={onToggleOpen}
            className={cn(
              'flex h-11 items-center justify-center rounded-full px-2 text-[14px] font-normal leading-[150%] tracking-[-0.35px] transition-colors cursor-pointer',
              isOpenOnly
                ? 'bg-[#444] text-white border border-[#444]'
                : 'border border-[#EDEDED] bg-white text-[#444]'
            )}
            aria-pressed={isOpenOnly}
          >
            <span>영업중</span>
          </button>

          {/* 정렬 버튼 */}
          <button
            type="button"
            onClick={onFilterClick}
            className="flex h-11 items-center justify-center rounded-full border border-[#EDEDED] bg-white cursor-pointer"
          >
            <div className="flex items-center gap-2 px-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#444]" strokeWidth={1.5} />
              <span className="text-[14px] font-normal leading-[150%] tracking-[-0.35px] text-[#444] whitespace-nowrap">
                정렬
              </span>
            </div>
          </button>

          {/* 초기화 버튼 */}
          <button
            type="button"
            onClick={onReset}
            className="flex h-11 items-center justify-center rounded-full border border-[#EDEDED] bg-white cursor-pointer"
          >
            <div className="flex items-center gap-2 px-2">
              <RefreshCw className="h-3.5 w-3.5 text-[#444]" strokeWidth={1.5} />
              <span className="text-[14px] font-normal leading-[150%] tracking-[-0.35px] text-[#444]">
                초기화
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
