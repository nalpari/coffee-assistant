import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * OAuth 콜백 핸들러
 * 구글 OAuth 인증 후 리다이렉트되는 엔드포인트입니다.
 * 인증 코드를 세션으로 교환하고 HTTP 쿠키에 저장한 후 메인 페이지로 리다이렉트합니다.
 *
 * @param request - Next.js 요청 객체
 * @returns 메인 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // 서버 사이드 Supabase 클라이언트 생성 (쿠키 기반)
    const supabase = await createSupabaseServerClient();

    // 인증 코드를 세션으로 교환하고 쿠키에 저장
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth 콜백 에러:', error);
      // 에러 발생 시 에러 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
  }

  // 메인 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/', request.url));
}
