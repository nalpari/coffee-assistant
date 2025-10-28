# 데이터베이스 구축 워크플로우

## 🎯 전체 개요

Coffee Assistant 프로젝트의 데이터베이스 설계부터 프론트엔드 통합까지의 체계적인 워크플로우입니다.

**소요 시간**: 약 4-5시간
**데이터베이스**: Supabase (PostgreSQL 기반)
**테이블 수**: 4개 (common_code, category, menu, image)

---

## 📊 Phase 1: 요구사항 분석 및 설계 (완료)

### ✅ 작업 완료 항목

1. **DDL 문서 분석** (`docs/ddl.md`)
   - 4개 테이블 구조 파악
   - FK 관계 및 의존성 정리
   - 인덱스 전략 확인

2. **타입 정의 업데이트**
   - `IMPLEMENTATION_GUIDE.md`: TypeScript 타입 정의
   - `REQUIREMENTS.md`: 데이터 모델 섹션
   - `IMPLEMENTATION_WORKFLOW.md`: 타입 시스템 통합

3. **마이그레이션 전략 수립**
   - Supabase 선택 (PostgreSQL, RESTful API, 실시간)
   - 테이블 생성 순서 결정
   - RLS 보안 정책 설계
   - 초기 데이터 시딩 계획

### 📋 의존성 매트릭스

```
common_code (Level 0)
    ↓ status, marketing 참조
category (Level 1)
    ↓ category_id FK
menu (Level 2)
    ↓ menu_id FK
image (Level 3)
```

---

## 📂 Phase 2: 마이그레이션 파일 작성 (완료)

### ✅ 생성된 파일 목록

```
supabase/
├── migrations/
│   ├── 20250001000000_create_common_code.sql    (2.6KB)
│   ├── 20250001000001_create_category.sql       (1.5KB)
│   ├── 20250001000002_create_menu.sql           (2.7KB)
│   ├── 20250001000003_create_image.sql          (2.0KB)
│   ├── 20250001000004_setup_rls.sql             (3.0KB)
│   └── 20250001000005_seed_initial_data.sql     (4.8KB)
└── README.md                                     (3.2KB)
```

### 📊 테이블별 주요 특징

#### 1. common_code (공통코드)
- **PK**: `id` (varchar(50))
- **자기참조 FK**: `parent_id`
- **인덱스**: 5개 (계층 조회 최적화)
- **특징**: 논리 삭제 (del_yn), 정렬 순서 (sort_order)

#### 2. category (카테고리)
- **PK**: `id` (bigint, auto increment)
- **인덱스**: 1개 (order_no)
- **특징**: 정렬 순서 관리, 상태 관리

#### 3. menu (메뉴 아이템)
- **PK**: `id` (bigint, auto increment)
- **FK**: `category_id` → category(id)
- **인덱스**: 4개 (카테고리, 상태, 정렬 최적화)
- **특징**: 가격/할인가, 온도 옵션, 마케팅 태그 배열

#### 4. image (이미지)
- **PK**: `file_uuid` (varchar(255))
- **FK**: 없음 (menu_id는 논리적 관계)
- **인덱스**: 2개 (메뉴별 조회, 정렬 최적화)
- **특징**: 다중 이미지 지원, ordering으로 순서 관리

### 🔐 RLS 보안 정책

**정책 요약**:
- ✅ 모든 테이블 RLS 활성화
- ✅ 읽기: public (익명 포함 모든 사용자)
- ✅ 쓰기: authenticated (인증된 사용자)
- ✅ 추가 필터: 활성 데이터만 조회 (del_yn, status)

### 📝 초기 데이터

**시딩 데이터**:
- 공통코드 12개
  - 메뉴 상태 3개
  - 마케팅 태그 6개
  - 카테고리 상태 2개
- 카테고리 6개 (COFFEE, NON-COFFEE, SIGNATURE, SMOOTHIE & FRAPPE, ADE & TEA, COLD BREW)

---

## 📚 Phase 3: 설정 가이드 문서화 (완료)

### ✅ 작성된 문서

1. **Supabase 설정 가이드** (`docs/SUPABASE_SETUP.md`)
   - Supabase CLI 설치 및 초기화
   - 프로젝트 생성 및 연결
   - 환경변수 설정
   - 마이그레이션 실행 및 검증
   - 프론트엔드 통합 예시
   - Storage 설정 (이미지 저장)
   - 트러블슈팅 가이드

2. **마이그레이션 README** (`supabase/README.md`)
   - 파일 목록 및 의존성
   - ERD 다이어그램
   - 빠른 시작 가이드
   - 테이블 설명
   - 보안 정책 요약

3. **워크플로우 문서** (`docs/DATABASE_WORKFLOW.md`)
   - 전체 프로세스 개요
   - Phase별 작업 내용
   - 다음 단계 가이드

---

## 🚀 Phase 4: Supabase 프로젝트 설정 (다음 단계)

### ⏭️ 작업 순서

#### 4.1 Supabase 계정 및 프로젝트 생성 (15분)

```bash
# 1. Supabase CLI 설치
pnpm add -g supabase

# 2. Supabase 로그인
supabase login
```

**웹 대시보드 작업:**
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. "New Project" 생성
   - Name: `coffee-assistant`
   - Region: `Northeast Asia (Seoul)`
   - Database Password: 강력한 비밀번호 생성 (저장!)
3. 프로젝트 생성 대기 (약 2분)

#### 4.2 프로젝트 연결 (5분)

```bash
# 로컬 프로젝트와 Supabase 연결
supabase link --project-ref <YOUR_PROJECT_REF>

# 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase URL 및 API Key 입력
```

#### 4.3 마이그레이션 실행 (10분)

**옵션 A: 로컬 개발 환경 (권장)**
```bash
# Docker 기반 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db reset

# 로컬 Studio 접속
# http://localhost:54323
```

**옵션 B: 프로덕션 환경**
```bash
# 프로덕션 DB에 직접 마이그레이션
supabase db push
```

#### 4.4 검증 (10분)

```bash
# TypeScript 타입 생성
supabase gen types typescript --local > src/types/database.types.ts
```

**Supabase Dashboard에서 확인:**
1. **Table Editor**: 4개 테이블 생성 확인
2. **Authentication > Policies**: RLS 정책 확인
3. **Storage**: `menu-images` bucket 생성

---

## 🔧 Phase 5: 프론트엔드 통합 (다음 단계)

### ⏭️ 작업 순서

#### 5.1 Supabase 클라이언트 설정 (30분)

```bash
# Supabase JS 클라이언트 설치
pnpm add @supabase/supabase-js
```

**파일 생성:**
- `src/lib/supabase.ts`: 클라이언트 초기화
- `src/types/database.types.ts`: 자동 생성 타입

#### 5.2 API 레이어 구현 (1시간)

**파일 생성:**
- `src/lib/api/menu.ts`: 메뉴 CRUD 함수
- `src/lib/api/category.ts`: 카테고리 조회 함수
- `src/lib/api/common-code.ts`: 공통코드 조회 함수

**주요 함수:**
- `getActiveMenus()`: 활성 메뉴 전체 조회
- `getMenusByCategory(categoryId)`: 카테고리별 조회
- `getCategories()`: 카테고리 목록 조회
- `getCommonCodesByParent(parentId)`: 계층형 코드 조회

#### 5.3 데이터 매퍼 유틸리티 (30분)

**파일 생성:**
- `src/utils/mappers.ts`: DB 응답 변환 함수

**주요 함수:**
- `mapMenuItemToDisplay()`: menu → MenuItemDisplay
- `mapCategoryToInfo()`: category → CategoryInfo
- `buildImageUrl()`: fileUuid → 공개 URL

#### 5.4 React Query 통합 (옵션, 1시간)

```bash
# React Query 설치
pnpm add @tanstack/react-query
```

**파일 생성:**
- `src/hooks/useMenu.ts`: 메뉴 조회 훅
- `src/hooks/useCategory.ts`: 카테고리 조회 훅

---

## 📈 Phase 6: Storage 설정 및 이미지 관리 (다음 단계)

### ⏭️ 작업 순서

#### 6.1 Storage Bucket 생성 (10분)

**Supabase Dashboard:**
1. **Storage** 메뉴 이동
2. "Create bucket" → `menu-images` (public)
3. Storage 정책 설정 (읽기: public, 쓰기: authenticated)

#### 6.2 이미지 업로드 함수 구현 (30분)

**파일 생성:**
- `src/lib/api/image.ts`: 이미지 업로드/조회 함수

**주요 함수:**
- `uploadMenuImage(file, menuId)`: 이미지 업로드
- `getMenuImages(menuId)`: 메뉴별 이미지 조회
- `deleteMenuImage(fileUuid)`: 이미지 삭제

#### 6.3 이미지 URL 헬퍼 (15분)

**파일 생성:**
- `src/utils/image.ts`: 이미지 URL 처리 유틸리티

**주요 함수:**
- `getImageUrl(fileUuid)`: Supabase Storage URL 생성
- `optimizeImageUrl(url, width, quality)`: 이미지 최적화

---

## ✅ 검증 체크리스트

### Phase 4 검증
- [ ] Supabase 프로젝트 생성 완료
- [ ] 4개 테이블 생성 확인 (Table Editor)
- [ ] 초기 데이터 시딩 확인 (공통코드 12개, 카테고리 4개)
- [ ] RLS 정책 활성화 확인 (Authentication > Policies)
- [ ] TypeScript 타입 생성 (`database.types.ts`)

### Phase 5 검증
- [ ] Supabase 클라이언트 정상 동작
- [ ] API 함수로 데이터 조회 가능
- [ ] 데이터 매퍼로 타입 변환 정상 동작
- [ ] React Query 캐싱 동작 (옵션)

### Phase 6 검증
- [ ] Storage bucket 생성 확인
- [ ] 이미지 업로드 성공
- [ ] 이미지 URL 조립 정상 동작
- [ ] 이미지 최적화 (WebP, 리사이징) 동작

---

## 📊 예상 시간표

| Phase | 작업 내용 | 소요 시간 | 누적 시간 | 상태 |
|-------|----------|----------|----------|------|
| 1 | 요구사항 분석 및 설계 | 1시간 | 1시간 | ✅ 완료 |
| 2 | 마이그레이션 파일 작성 | 1시간 | 2시간 | ✅ 완료 |
| 3 | 설정 가이드 문서화 | 30분 | 2.5시간 | ✅ 완료 |
| 4 | Supabase 프로젝트 설정 | 40분 | 3.2시간 | ⏭️ 다음 |
| 5 | 프론트엔드 통합 | 2-3시간 | 5-6시간 | ⏭️ 다음 |
| 6 | Storage 설정 | 1시간 | 6-7시간 | ⏭️ 다음 |

**현재 진행률**: 43% (Phase 3/7 완료)

---

## 🎯 즉시 실행 가능한 다음 단계

### 1. Supabase 프로젝트 생성

```bash
# 1. Supabase CLI 설치
pnpm add -g supabase

# 2. Supabase 로그인
supabase login

# 3. 웹 대시보드에서 프로젝트 생성
# https://app.supabase.com
```

### 2. 로컬 개발 환경 시작

```bash
# 1. 로컬 Supabase 시작 (Docker 필요)
supabase start

# 2. 마이그레이션 실행
supabase db reset

# 3. 로컬 Studio 접속
# http://localhost:54323
```

### 3. 프론트엔드 패키지 설치

```bash
# Supabase JS 클라이언트
pnpm add @supabase/supabase-js

# React Query (선택)
pnpm add @tanstack/react-query
```

---

## 📚 참고 문서

- [Supabase 설정 가이드](./SUPABASE_SETUP.md)
- [마이그레이션 README](../supabase/README.md)
- [DDL 문서](./ddl.md)
- [구현 가이드](../IMPLEMENTATION_GUIDE.md)
- [요구사항 정의서](../REQUIREMENTS.md)

---

## 💡 Tips

### 개발 효율성
- 로컬 Supabase 사용 시 Docker Desktop 필수
- TypeScript 타입 생성 자동화로 타입 안전성 확보
- React Query로 서버 상태 관리 최적화

### 보안
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- RLS 정책은 프로덕션 배포 전 반드시 검토
- API Key는 환경변수로만 관리

### 성능
- 인덱스 활용으로 조회 성능 최적화
- Supabase Storage로 이미지 CDN 활용
- React Query 캐싱으로 불필요한 API 호출 감소

---

**작성일**: 2025-10-28
**버전**: 1.0
**워크플로우 상태**: Phase 3/7 완료 (43%)
