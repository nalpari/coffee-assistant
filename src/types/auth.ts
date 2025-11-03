import { User, Session } from '@supabase/supabase-js';

/**
 * 인증 상태 인터페이스
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * 인증 컨텍스트 타입
 * React Context에서 사용되는 인증 관련 상태와 메서드를 정의
 */
export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
