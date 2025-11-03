'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 사용자 프로필 컴포넌트
 * 로그인한 사용자의 정보를 표시하고 로그아웃 기능을 제공합니다.
 */
export function UserProfile() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  /**
   * 로그아웃 핸들러
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {user.user_metadata?.avatar_url && (
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name || '사용자'}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="text-sm">
          <div className="font-medium">
            {user.user_metadata?.full_name || user.email}
          </div>
          <div className="text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>
      <Button
        onClick={handleSignOut}
        variant="ghost"
        size="sm"
      >
        로그아웃
      </Button>
    </div>
  );
}
