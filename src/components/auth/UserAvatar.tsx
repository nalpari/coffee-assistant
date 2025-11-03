'use client';

import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * 사용자 아바타 컴포넌트
 *
 * 로그인한 사용자의 아바타 이미지를 표시하고
 * hover 시 툴팁으로 사용자 정보를 보여줍니다.
 *
 * @param avatarUrl - 아바타 이미지 URL (선택적, 없으면 기본 아바타 표시)
 * @param userName - 사용자 이름 (툴팁 표시용)
 * @param userEmail - 사용자 이메일 (툴팁 표시용)
 * @param size - 아바타 크기 (px, 기본값: 32)
 */
export interface UserAvatarProps {
  avatarUrl?: string;
  userName?: string;
  userEmail?: string;
  size?: number;
}

export function UserAvatar({
  avatarUrl,
  userName,
  userEmail,
  size = 32
}: UserAvatarProps) {
  // 기본 아바타 URL (아바타가 없을 경우 표시할 기본 이미지)
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&size=${size * 2}&background=random`;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Image
              src={avatarUrl || defaultAvatarUrl}
              alt={userName || '사용자'}
              width={size}
              height={size}
              className="rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all cursor-pointer"
              onError={(e) => {
                // 이미지 로딩 실패 시 기본 아바타로 대체
                e.currentTarget.src = defaultAvatarUrl;
              }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            {userName && (
              <div className="font-medium text-sm">{userName}</div>
            )}
            {userEmail && (
              <div className="text-xs text-muted-foreground">{userEmail}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
