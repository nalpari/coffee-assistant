import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
}

/**
 * 브라우저 환경용 Supabase 클라이언트
 * 쿠키 기반 세션 관리를 사용하여 서버와 세션을 공유합니다.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
