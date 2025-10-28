-- =====================================================
-- 초기 데이터 시딩
-- =====================================================
-- 공통코드 및 카테고리 초기 데이터 생성

-- =====================================================
-- 1. 공통코드 - 메뉴 상태 (부모 코드)
-- =====================================================

INSERT INTO public.common_code (id, name, value, parent_id, sort_order, del_yn, created_by, created_date, description)
VALUES
  ('MENU_STATUS', '메뉴 상태', 'menu_status', NULL, 1, 'N', 'system', NOW(), '메뉴 아이템의 판매 상태 분류');

-- =====================================================
-- 2. 공통코드 - 메뉴 상태 (자식 코드)
-- =====================================================

INSERT INTO public.common_code (id, name, value, parent_id, sort_order, del_yn, created_by, created_date, description)
VALUES
  ('MENU_STATUS_ACTIVE', '판매중', 'active', 'MENU_STATUS', 1, 'N', 'system', NOW(), '현재 판매 가능한 메뉴'),
  ('MENU_STATUS_SOLDOUT', '품절', 'soldout', 'MENU_STATUS', 2, 'N', 'system', NOW(), '일시적으로 품절된 메뉴'),
  ('MENU_STATUS_DISCONTINUED', '단종', 'discontinued', 'MENU_STATUS', 3, 'N', 'system', NOW(), '더 이상 판매하지 않는 메뉴');

-- =====================================================
-- 3. 공통코드 - 마케팅 태그 (부모 코드)
-- =====================================================

INSERT INTO public.common_code (id, name, value, parent_id, sort_order, del_yn, created_by, created_date, description)
VALUES
  ('MARKETING_TAG', '마케팅 태그', 'marketing_tag', NULL, 2, 'N', 'system', NOW(), '메뉴 프로모션 및 특징 태그');

-- =====================================================
-- 4. 공통코드 - 마케팅 태그 (자식 코드)
-- =====================================================

INSERT INTO public.common_code (id, name, value, parent_id, sort_order, del_yn, created_by, created_date, description)
VALUES
  ('MARKETING_TAG_POPULAR', '인기', 'popular', 'MARKETING_TAG', 1, 'N', 'system', NOW(), '인기 메뉴 표시'),
  ('MARKETING_TAG_NEW', '신메뉴', 'new', 'MARKETING_TAG', 2, 'N', 'system', NOW(), '신규 출시 메뉴'),
  ('MARKETING_TAG_SEASONAL', '시즌 한정', 'seasonal', 'MARKETING_TAG', 3, 'N', 'system', NOW(), '계절 한정 메뉴'),
  ('MARKETING_TAG_HOT', 'HOT', 'hot', 'MARKETING_TAG', 4, 'N', 'system', NOW(), '뜨거운 음료 전용'),
  ('MARKETING_TAG_COLD', 'COLD', 'cold', 'MARKETING_TAG', 5, 'N', 'system', NOW(), '차가운 음료 전용'),
  ('MARKETING_TAG_BESTSELLER', '베스트', 'bestseller', 'MARKETING_TAG', 6, 'N', 'system', NOW(), '가장 많이 팔리는 메뉴');

-- =====================================================
-- 5. 공통코드 - 카테고리 상태 (부모 코드)
-- =====================================================

INSERT INTO public.common_code (id, name, value, parent_id, sort_order, del_yn, created_by, created_date, description)
VALUES
  ('CATEGORY_STATUS', '카테고리 상태', 'category_status', NULL, 3, 'N', 'system', NOW(), '카테고리 활성화 상태 분류');

-- =====================================================
-- 6. 공통코드 - 카테고리 상태 (자식 코드)
-- =====================================================

INSERT INTO public.common_code (id, name, value, parent_id, sort_order, del_yn, created_by, created_date, description)
VALUES
  ('CATEGORY_STATUS_ACTIVE', '활성', 'active', 'CATEGORY_STATUS', 1, 'N', 'system', NOW(), '현재 사용 중인 카테고리'),
  ('CATEGORY_STATUS_INACTIVE', '비활성', 'inactive', 'CATEGORY_STATUS', 2, 'N', 'system', NOW', '일시적으로 사용하지 않는 카테고리');

-- =====================================================
-- 7. 카테고리 초기 데이터
-- =====================================================

INSERT INTO public.category (name, order_no, status, created_by, created_date)
VALUES
  ('커피', 1, 'CATEGORY_STATUS_ACTIVE', 'system', NOW()),
  ('디저트', 2, 'CATEGORY_STATUS_ACTIVE', 'system', NOW()),
  ('음료', 3, 'CATEGORY_STATUS_ACTIVE', 'system', NOW()),
  ('푸드', 4, 'CATEGORY_STATUS_ACTIVE', 'system', NOW());

-- =====================================================
-- 참고사항
-- =====================================================
-- 시딩 순서:
-- 1. common_code (부모) → common_code (자식) → category
-- 2. menu 테이블 데이터는 관리자 화면에서 추가 또는 별도 시딩 스크립트 작성
-- 3. created_by = 'system'은 시스템 초기화 데이터를 의미

-- 공통코드 ID 명명 규칙:
-- - 부모: {DOMAIN} (예: MENU_STATUS, MARKETING_TAG)
-- - 자식: {PARENT}_{VALUE} (예: MENU_STATUS_ACTIVE, MARKETING_TAG_POPULAR)
