-- =====================================================
-- Row Level Security (RLS) 정책 설정
-- =====================================================
-- Supabase의 보안 기능을 활용하여 데이터 접근 제어

-- =====================================================
-- RLS 활성화
-- =====================================================

ALTER TABLE public.common_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 공통코드 테이블 정책
-- =====================================================

-- 읽기: 모든 사용자 허용 (del_yn = 'N'인 활성 코드만)
CREATE POLICY "공통코드 읽기 허용"
ON public.common_code
FOR SELECT
TO public
USING (del_yn = 'N');

-- 쓰기: 인증된 사용자만 허용 (관리자 기능)
CREATE POLICY "공통코드 쓰기는 인증 사용자만"
ON public.common_code
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 카테고리 테이블 정책
-- =====================================================

-- 읽기: 모든 사용자 허용 (활성 카테고리만)
CREATE POLICY "카테고리 읽기 허용"
ON public.category
FOR SELECT
TO public
USING (status LIKE 'CATEGORY_STATUS_ACTIVE%');

-- 쓰기: 인증된 사용자만 허용 (관리자 기능)
CREATE POLICY "카테고리 쓰기는 인증 사용자만"
ON public.category
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 메뉴 테이블 정책
-- =====================================================

-- 읽기: 모든 사용자 허용 (판매 가능한 메뉴만)
CREATE POLICY "메뉴 읽기 허용"
ON public.menu
FOR SELECT
TO public
USING (
  status IN (
    'MENU_STATUS_ACTIVE',
    'MENU_STATUS_SOLDOUT'
  )
);

-- 쓰기: 인증된 사용자만 허용 (관리자 기능)
CREATE POLICY "메뉴 쓰기는 인증 사용자만"
ON public.menu
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 이미지 테이블 정책
-- =====================================================

-- 읽기: 모든 사용자 허용
CREATE POLICY "이미지 읽기 허용"
ON public.image
FOR SELECT
TO public
USING (true);

-- 쓰기: 인증된 사용자만 허용 (관리자 기능)
CREATE POLICY "이미지 쓰기는 인증 사용자만"
ON public.image
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 참고사항
-- =====================================================
-- public: 익명 사용자 포함 모든 사용자
-- authenticated: 로그인한 사용자만
--
-- 현재 정책:
-- - 읽기: 모든 사용자 허용 (공개 메뉴 앱)
-- - 쓰기: 인증된 사용자만 (관리자 기능, 추후 role 기반으로 세분화 가능)
