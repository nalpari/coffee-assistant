-- =====================================================
-- 공통코드 테이블 생성
-- =====================================================
-- 계층형 공통코드 관리 (메뉴 상태, 마케팅 태그 등)
-- 자기참조 FK로 부모-자식 관계 구현

CREATE TABLE IF NOT EXISTS public.common_code (
  id varchar(50) NOT NULL,
  created_by varchar(255) NOT NULL,
  created_date timestamp(6) DEFAULT now() NOT NULL,
  updated_by varchar(255) NULL,
  updated_date timestamp(6) NULL,
  del_yn varchar(1) DEFAULT 'N'::character varying NOT NULL,
  description text NULL,
  extra_value text NULL,
  name varchar(100) NOT NULL,
  parent_id varchar(50) NULL,
  sort_order int4 DEFAULT 0 NOT NULL,
  value varchar(100) NOT NULL,

  CONSTRAINT common_code_pkey PRIMARY KEY (id),
  CONSTRAINT idx_common_code_value_unique UNIQUE (value),
  CONSTRAINT fkrn6cve5ahtpxtnslisd8y38ky FOREIGN KEY (parent_id) REFERENCES public.common_code(id)
);

-- =====================================================
-- 인덱스 생성 (성능 최적화)
-- =====================================================

-- 복합 인덱스: 계층 구조 조회 최적화
CREATE INDEX IF NOT EXISTS idx_common_code_covering_recursive
ON public.common_code USING btree (parent_id, del_yn, sort_order, id, value, name);

-- 삭제 여부 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_common_code_del_yn
ON public.common_code USING btree (del_yn);

-- 계층 구조 조회 최적화
CREATE INDEX IF NOT EXISTS idx_common_code_hierarchy_btree
ON public.common_code USING btree (parent_id, id, del_yn);

-- ID 기반 활성 코드 조회 최적화
CREATE INDEX IF NOT EXISTS idx_common_code_id_active
ON public.common_code USING btree (id, del_yn);

-- 부모 코드 기반 정렬된 자식 조회 최적화
CREATE INDEX IF NOT EXISTS idx_common_code_parent_active
ON public.common_code USING btree (parent_id, del_yn, sort_order);

-- =====================================================
-- 테이블 코멘트
-- =====================================================

COMMENT ON TABLE public.common_code IS '계층형 공통코드 테이블 - 메뉴 상태, 마케팅 태그 등 코드성 데이터 관리';
COMMENT ON COLUMN public.common_code.id IS '코드 ID (PK, 예: MENU_STATUS_ACTIVE)';
COMMENT ON COLUMN public.common_code.name IS '코드 이름 (예: 판매중)';
COMMENT ON COLUMN public.common_code.value IS '코드 값 (unique, 예: active)';
COMMENT ON COLUMN public.common_code.parent_id IS '부모 코드 ID (계층 구조, 예: MENU_STATUS)';
COMMENT ON COLUMN public.common_code.del_yn IS '삭제 여부 (Y/N)';
COMMENT ON COLUMN public.common_code.sort_order IS '정렬 순서';
