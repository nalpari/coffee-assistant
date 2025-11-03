import { supabase } from '@/lib/supabase';

/**
 * 애플리케이션의 베이스 URL을 동적으로 가져옵니다.
 * 환경에 따라 적절한 URL을 반환합니다.
 *
 * 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL (프로덕션 URL, .env.local에 설정)
 * 2. NEXT_PUBLIC_VERCEL_URL (Vercel이 자동으로 설정)
 * 3. window.location.origin (클라이언트 측 폴백)
 * 4. http://localhost:3000 (개발 환경 기본값)
 *
 * @returns 올바른 형식의 베이스 URL (https:// 포함, 슬래시로 종료)
 */
export function getURL(): string {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 프로덕션 URL 우선
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel 자동 설정
    (typeof window !== 'undefined' ? window.location.origin : undefined) ?? // 클라이언트 폴백
    'http://localhost:3000/'; // 개발 환경 기본값

  // localhost가 아니면 https:// 강제
  url = url.startsWith('http') ? url : `https://${url}`;

  // 슬래시로 끝나도록 보장
  url = url.endsWith('/') ? url : `${url}/`;

  return url;
}

/**
 * 구글 OAuth 로그인 시작
 * PKCE 플로우를 사용하여 보안을 강화합니다.
 *
 * @returns OAuth 데이터 또는 에러
 * @throws 로그인 실패 시 에러를 throw합니다
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getURL()}auth/callback`,
      scopes: 'https://www.googleapis.com/auth/userinfo.email',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 로그아웃
 * 현재 사용자 세션을 종료합니다.
 *
 * @throws 로그아웃 실패 시 에러를 throw합니다
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * 현재 사용자 세션 가져오기
 *
 * @returns 현재 세션 또는 null
 * @throws 세션 조회 실패 시 에러를 throw합니다
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

/**
 * 현재 사용자 정보 가져오기
 *
 * @returns 현재 사용자 또는 null
 * @throws 사용자 조회 실패 시 에러를 throw합니다
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}
