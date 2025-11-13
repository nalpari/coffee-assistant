'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle as googleSignIn, signOut as logout } from '@/lib/supabase-auth';
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 상태 프로바이더 컴포넌트
 * 전역 인증 상태를 관리하고 하위 컴포넌트에 제공합니다.
 *
 * @param children - 하위 React 노드
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 클라이언트 마운트 완료 표시
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 리스너 설정
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => subscription.unsubscribe();
  }, []);

  /**
   * 구글 OAuth 로그인 실행
   */
  const signInWithGoogle = async () => {
    await googleSignIn();
  };

  /**
   * 로그아웃 실행
   */
  const signOut = async () => {
    await logout();
  };

  // SSR 중에는 기본 상태로 렌더링하여 Hydration 불일치 방지
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, session: null, loading: true, signInWithGoogle, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 인증 컨텍스트 사용 훅
 * AuthProvider 내부에서만 사용 가능합니다.
 *
 * @returns 인증 상태와 메서드
 * @throws AuthProvider 외부에서 사용 시 에러를 throw합니다
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
