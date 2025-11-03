import { supabase } from '@/lib/supabase';

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
      redirectTo: `${window.location.origin}/auth/callback`,
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
