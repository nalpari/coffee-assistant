'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 보호된 라우트 컴포넌트
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트합니다.
 *
 * @param children - 보호할 컴포넌트
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩 완료 후 사용자가 없으면 로그인 페이지로 리디렉트
    if (!loading && !user) {
      // 현재 경로를 returnUrl 파라미터로 전달
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
    }
  }, [user, loading, router, pathname]);

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">로딩 중...</div>
          <div className="text-sm text-muted-foreground mt-2">
            인증 상태를 확인하고 있습니다.
          </div>
        </div>
      </div>
    );
  }

  // 사용자가 없으면 null 반환 (리디렉트 진행 중)
  if (!user) {
    return null;
  }

  // 인증된 사용자에게만 children 표시
  return <>{children}</>;
}
