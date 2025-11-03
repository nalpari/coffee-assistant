/**
 * Supabase 서버 사이드 클라이언트
 * API Routes와 Server Components에서 사용하는 인증된 Supabase 클라이언트
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 사이드 Supabase 클라이언트 생성
 *
 * Next.js App Router의 API Routes와 Server Components에서 사용
 * 쿠키 기반 세션 관리로 서버에서 사용자 인증 상태 확인
 *
 * @returns Supabase 클라이언트 인스턴스
 *
 * @example
 * ```typescript
 * // API Route에서 사용
 * export async function GET() {
 *   const supabase = createSupabaseServerClient();
 *   const { data: { session } } = await supabase.auth.getSession();
 *   // ...
 * }
 * ```
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서는 쿠키 설정 불가능
            // API Routes와 Server Actions에서만 쿠키 설정 가능
          }
        },
      },
    }
  );
}

/**
 * 서버에서 현재 세션 가져오기
 *
 * @returns 세션 정보 또는 null
 * @throws 인증 오류 시 에러를 throw하지 않고 null 반환
 *
 * @example
 * ```typescript
 * const session = await getServerSession();
 * if (!session) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export async function getServerSession() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('세션 조회 실패:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('세션 조회 중 오류:', error);
    return null;
  }
}

/**
 * 서버에서 현재 사용자 정보 가져오기
 *
 * @returns 사용자 정보 또는 null
 *
 * @example
 * ```typescript
 * const user = await getServerUser();
 * if (!user) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * console.log('사용자 ID:', user.id);
 * ```
 */
export async function getServerUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}
