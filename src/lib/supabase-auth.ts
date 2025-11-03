import { supabase } from '@/lib/supabase';

/**
 * 애플리케이션의 베이스 URL을 동적으로 가져옵니다.
 * 환경에 따라 적절한 URL을 반환합니다.
 *
 * **중요**: 이 함수는 클라이언트와 서버 양쪽에서 호출될 수 있습니다.
 * - 클라이언트: OAuth 리다이렉트 URL 생성 (signInWithGoogle)
 * - 서버: API 라우트, Server Components에서 URL 필요 시
 *
 * 우선순위:
 * 1. 브라우저 환경: window.location.origin (가장 정확함)
 * 2. 서버 환경: NEXT_PUBLIC_SITE_URL 환경 변수
 * 3. 서버 환경: NEXT_PUBLIC_VERCEL_URL 환경 변수
 * 4. 폴백: http://localhost:3000
 *
 * @returns 올바른 형식의 베이스 URL (https:// 포함, 슬래시로 종료)
 */
export function getURL(): string {
  // 브라우저 환경에서는 항상 현재 페이지의 origin 사용
  // 이것이 OAuth 리다이렉트에서 가장 정확한 URL입니다
  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    return url.endsWith('/') ? url : `${url}/`;
  }

  // 서버 환경: 환경 변수 사용
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // 프로덕션 URL
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel 자동 설정
    'http://localhost:3000'; // 개발 환경 기본값

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
