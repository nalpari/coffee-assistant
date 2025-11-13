-- =============================================
-- orders 테이블에 store_id 컬럼 추가
-- 매장별 주문 관리 및 매장 정보 저장을 위한 마이그레이션
-- =============================================

-- 1. orders 테이블에 store_id 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS store_id BIGINT REFERENCES public.stores(id) ON DELETE SET NULL;

-- 2. store_id 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);

-- 3. 코멘트 추가
COMMENT ON COLUMN public.orders.store_id IS '주문한 매장 ID (stores 테이블 참조)';

