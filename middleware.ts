import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js 미들웨어 - Supabase 세션 관리
 *
 * 모든 요청에서 Supabase 세션을 확인하고 필요 시 자동으로 리프레시합니다.
 * 이는 사용자 세션의 지속성을 보장하고 만료를 방지하는 핵심 로직입니다.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function middleware(request: NextRequest) {
  // 응답 객체 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Supabase 서버 클라이언트 생성 (쿠키 기반)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 요청에서 모든 쿠키 읽기
        getAll() {
          return request.cookies.getAll();
        },
        // 응답에 쿠키 설정
        setAll(cookiesToSet) {
          // 요청 쿠키 업데이트
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // 새로운 응답 객체 생성
          response = NextResponse.next({
            request,
          });

          // 응답 쿠키 설정
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 확인 및 자동 리프레시
  // getUser()는 액세스 토큰이 만료된 경우 자동으로 리프레시합니다
  await supabase.auth.getUser();

  // 선택적: 특정 경로에 대한 인증 보호
  // 예시: /dashboard, /profile 등 보호된 경로
  // if (!user && request.nextUrl.pathname.startsWith('/protected')) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  return response;
}

/**
 * 미들웨어가 실행될 경로 설정
 *
 * 정적 파일, 이미지, favicon 등은 제외하고
 * 모든 동적 경로에서 세션 관리를 수행합니다.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
