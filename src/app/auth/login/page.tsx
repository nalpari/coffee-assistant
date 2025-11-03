'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useSearchParams를 사용하는 내부 컴포넌트
 */
function LoginContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  // 이미 로그인된 사용자는 원래 페이지로 리디렉트
  useEffect(() => {
    if (!loading && user) {
      router.replace(returnUrl);
    }
  }, [user, loading, router, returnUrl]);

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg font-medium">로딩 중...</div>
          <div className="text-sm text-muted-foreground mt-2">
            인증 상태를 확인하고 있습니다.
          </div>
        </div>
      </div>
    );
  }

  // 이미 로그인된 경우 null 반환 (리디렉트 진행 중)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            로그인이 필요합니다
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            서비스를 이용하려면 로그인해주세요
          </p>
        </div>

        {/* 로그인 버튼 */}
        <div className="mt-8">
          <GoogleSignInButton />
        </div>

        {/* 추가 정보 */}
        <div className="text-center text-xs text-muted-foreground">
          <p>계속 진행하면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 로그인 페이지 컴포넌트
 * 비로그인 사용자에게 로그인 UI를 제공하고,
 * 이미 로그인된 사용자는 메인 페이지로 리디렉트합니다.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="text-lg font-medium">로딩 중...</div>
            <div className="text-sm text-muted-foreground mt-2">
              인증 상태를 확인하고 있습니다.
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
