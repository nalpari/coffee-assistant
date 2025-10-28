-- =====================================================
-- 이미지 테이블 생성
-- =====================================================
-- 메뉴 아이템별 이미지 파일 정보 관리

CREATE TABLE IF NOT EXISTS public.image (
  file_uuid varchar(255) NOT NULL,
  created_by varchar(255) NOT NULL,
  created_date timestamp(6) NULL,
  file_name varchar(255) NOT NULL,
  menu_id int8 NOT NULL,
  menu_type varchar(255) NOT NULL,
  ordering int4 NOT NULL,

  CONSTRAINT image_pkey PRIMARY KEY (file_uuid)
);

-- =====================================================
-- 인덱스 생성 (성능 최적화)
-- =====================================================

-- 메뉴별 이미지 조회 최적화
CREATE INDEX IF NOT EXISTS idx_image_menu_id
ON public.image USING btree (menu_id);

-- 메뉴별 이미지 정렬 조회 최적화
CREATE INDEX IF NOT EXISTS idx_image_menu_ordering
ON public.image USING btree (menu_id, ordering);

-- =====================================================
-- 테이블 코멘트
-- =====================================================

COMMENT ON TABLE public.image IS '메뉴 이미지 테이블 - 메뉴별 이미지 파일 정보 관리';
COMMENT ON COLUMN public.image.file_uuid IS '파일 UUID (PK, 고유 식별자)';
COMMENT ON COLUMN public.image.file_name IS '파일명 (원본 파일명 또는 저장된 파일명)';
COMMENT ON COLUMN public.image.menu_id IS '메뉴 FK (menu 테이블 참조)';
COMMENT ON COLUMN public.image.menu_type IS '메뉴 타입 구분자 (확장성을 위한 필드)';
COMMENT ON COLUMN public.image.ordering IS '이미지 정렬 순서 (메뉴당 여러 이미지 지원)';

-- =====================================================
-- 참고사항
-- =====================================================
-- 실제 이미지 파일은 Supabase Storage에 저장됩니다.
-- 저장 경로: bucket "menu-images" / {file_uuid}.{extension}
-- URL 패턴: https://{project-id}.supabase.co/storage/v1/object/public/menu-images/{file_uuid}.jpg
