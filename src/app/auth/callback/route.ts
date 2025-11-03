import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * OAuth 콜백 핸들러
 * 구글 OAuth 인증 후 리다이렉트되는 엔드포인트입니다.
 * 인증 코드를 세션으로 교환하고 HTTP 쿠키에 저장한 후 메인 페이지로 리다이렉트합니다.
 *
 * @param request - Next.js 요청 객체
 * @returns 메인 페이지로 리다이렉트 또는 에러 페이지
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/';

  // OAuth 제공자로부터 에러가 반환된 경우
  if (error) {
    console.error('OAuth 제공자 에러:', {
      error,
      description: errorDescription,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '알 수 없는 오류')}`,
        request.url
      )
    );
  }

  // 인증 코드가 없는 경우
  if (!code) {
    console.error('OAuth 콜백: 인증 코드가 없습니다', {
      url: request.url,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL('/?error=missing_code&description=인증 코드가 누락되었습니다', request.url)
    );
  }

  try {
    // 서버 사이드 Supabase 클라이언트 생성 (쿠키 기반)
    const supabase = await createSupabaseServerClient();

    // 인증 코드를 세션으로 교환하고 쿠키에 저장
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('세션 교환 에러:', {
        error: exchangeError,
        code: code.substring(0, 10) + '...', // 보안을 위해 일부만 로깅
        timestamp: new Date().toISOString(),
      });

      return NextResponse.redirect(
        new URL(
          `/?error=session_exchange_failed&description=${encodeURIComponent(exchangeError.message)}`,
          request.url
        )
      );
    }

    // 인증 성공: 사용자가 요청한 페이지 또는 메인 페이지로 리다이렉트
    // 프로덕션 환경에서는 x-forwarded-host 헤더 확인
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
      // 로컬 개발 환경: origin 사용
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    } else if (forwardedHost) {
      // 프로덕션 환경 (로드 밸런서 뒤): x-forwarded-host 사용
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      // 기본: origin 사용
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  } catch (error) {
    // 예상치 못한 에러 처리
    console.error('OAuth 콜백 처리 중 예외 발생:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL('/?error=unexpected_error&description=인증 처리 중 오류가 발생했습니다', request.url)
    );
  }
}
