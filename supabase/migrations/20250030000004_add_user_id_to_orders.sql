-- =============================================
-- orders 테이블에 user_id 컬럼 추가
-- 사용자별 주문 내역 분리를 위한 마이그레이션
-- =============================================

-- 1. orders 테이블에 user_id 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. user_id 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 3. 기존 RLS 정책 삭제 (새로운 정책으로 교체)
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;

-- 4. 새로운 RLS 정책 생성 (user_id 기반)
-- 읽기 정책: 자신의 주문만 조회 가능
CREATE POLICY "orders_select_policy"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 쓰기 정책: 인증된 사용자만 주문 생성 가능 (자신의 user_id로만)
CREATE POLICY "orders_insert_policy"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 업데이트 정책: 자신의 주문만 업데이트 가능
CREATE POLICY "orders_update_policy"
ON public.orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. 코멘트 추가
COMMENT ON COLUMN public.orders.user_id IS '주문한 사용자 ID (auth.users 참조)';

