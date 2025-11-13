-- =====================================================
-- 매장 이미지 컬럼 추가
-- 생성일: 2025-11-13
-- 설명: stores 테이블에 기본 이미지 경로를 저장하는 image 컬럼 추가
-- =====================================================

-- 1. image 컬럼 추가 (기본값: coffee_1.png)
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS image TEXT DEFAULT 'coffee_1.png' NOT NULL;

-- 2. 컬럼 코멘트
COMMENT ON COLUMN public.stores.image IS '매장 기본 이미지 파일 경로';

-- 3. 기존 레코드 업데이트 (기본값으로 설정)
UPDATE public.stores
SET image = COALESCE(image, 'coffee_1.png');

