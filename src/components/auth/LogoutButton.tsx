'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * 로그아웃 버튼 컴포넌트
 *
 * 아이콘 기반의 로그아웃 버튼으로, hover 시 툴팁을 표시합니다.
 * 로딩 상태를 관리하여 중복 클릭을 방지합니다.
 *
 * @param onSignOut - 로그아웃 처리 함수
 * @param loading - 외부 로딩 상태 (선택적)
 */
export interface LogoutButtonProps {
  onSignOut: () => Promise<void>;
  loading?: boolean;
}

export function LogoutButton({ onSignOut, loading: externalLoading }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 로그아웃 클릭 핸들러
   * 로딩 상태를 관리하고 에러 처리를 수행합니다.
   */
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || externalLoading;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isDisabled}
            aria-label="로그아웃"
            className="hover:text-destructive transition-colors"
          >
            <LogOut className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-sm">로그아웃</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
