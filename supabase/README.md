# Supabase 마이그레이션

이 디렉토리는 Coffee Assistant 프로젝트의 Supabase 데이터베이스 마이그레이션 파일을 포함합니다.

## 📂 마이그레이션 파일 목록

| 파일명 | 설명 | 테이블 | 의존성 |
|--------|------|--------|--------|
| `20250001000000_create_common_code.sql` | 공통코드 테이블 생성 | `common_code` | 없음 (자기참조) |
| `20250001000001_create_category.sql` | 카테고리 테이블 생성 | `category` | - |
| `20250001000002_create_menu.sql` | 메뉴 아이템 테이블 생성 | `menu` | `category` FK |
| `20250001000003_create_image.sql` | 이미지 테이블 생성 | `image` | `menu` FK |
| `20250001000004_setup_rls.sql` | Row Level Security 정책 설정 | 모든 테이블 | 위 4개 테이블 |
| `20250001000005_seed_initial_data.sql` | 초기 데이터 시딩 | `common_code`, `category` | RLS 정책 |

## 🚀 빠른 시작

### 1. Supabase CLI 설치

```bash
npm install -g supabase
# 또는
pnpm add -g supabase
```

### 2. Supabase 프로젝트 연결

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

### 3. 마이그레이션 실행

**로컬 개발 환경:**
```bash
supabase start
supabase db reset
```

**프로덕션 환경:**
```bash
supabase db push
```

## 📊 데이터베이스 스키마

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│  common_code    │ (자기참조)
│  - id (PK)      │◄──┐
│  - parent_id    │───┘
│  - name         │
│  - value        │
│  - del_yn       │
└─────────────────┘
        ▲
        │ (status 참조)
        │
┌─────────────────┐
│  category       │
│  - id (PK)      │
│  - name         │
│  - order_no     │
│  - status       │
└─────────────────┘
        ▲
        │ (FK)
        │
┌─────────────────┐
│  menu           │
│  - id (PK)      │
│  - name         │
│  - price        │
│  - category_id  │
│  - status       │
│  - marketing[]  │
└─────────────────┘
        ▲
        │ (FK)
        │
┌─────────────────┐
│  image          │
│  - file_uuid(PK)│
│  - menu_id      │
│  - file_name    │
│  - ordering     │
└─────────────────┘
```

### 테이블 설명

#### 1. `common_code` - 공통코드 (계층형)
- 메뉴 상태, 마케팅 태그, 카테고리 상태 등 코드성 데이터 관리
- 부모-자식 관계로 계층 구조 구현
- 논리 삭제 지원 (del_yn)

**주요 코드 그룹 (실제 DB 데이터):**
- `E01` (메뉴 상태): E0101(사용), E0102(미사용)
- `E02` (메뉴 마케팅): E0201(New), E0202(Best), E0203(Event)
- `D01` (카테고리 상태): D0101(사용), D0102(미사용)

#### 2. `category` - 카테고리
- 메뉴 분류 (실제 DB: COFFEE, NON-COFFEE, SIGNATURE, SMOOTHIE & FRAPPE, ADE & TEA, COLD BREW)
- 정렬 순서 관리 (order_no)
- 상태 관리 (common_code 참조)

#### 3. `menu` - 메뉴 아이템
- 판매 상품 정보
- 가격 및 할인가
- 온도 옵션 (cold, hot)
- 마케팅 태그 배열
- 카테고리 FK

#### 4. `image` - 이미지
- 메뉴별 이미지 파일 정보
- 다중 이미지 지원 (ordering)
- 실제 파일은 Supabase Storage에 저장

## 🔐 보안 (RLS 정책)

모든 테이블에 Row Level Security 활성화:

- **읽기**: 모든 사용자 허용 (public)
- **쓰기**: 인증된 사용자만 허용 (authenticated)

### 추가 정책 (테이블별)

**common_code:**
- 읽기: del_yn = 'N'인 활성 코드만

**category:**
- 읽기: 활성 상태 카테고리만

**menu:**
- 읽기: 판매 가능한 메뉴만 (판매중, 품절)

**image:**
- 읽기: 모든 이미지

## 📝 초기 데이터

실제 데이터베이스에 삽입된 데이터 (`data/` 폴더):

### 공통코드 (실제 데이터)
- 메뉴 관련 (E): E01(메뉴 상태), E02(메뉴 마케팅)
  - E0101(사용), E0102(미사용)
  - E0201(New), E0202(Best), E0203(Event)
- 카테고리 관련 (D): D01(카테고리 상태)
  - D0101(사용), D0102(미사용)

### 카테고리 (6개, ID: 1-6)
- COFFEE (orderNo: 1, ID: 1)
- NON-COFFEE (orderNo: 2, ID: 2)
- SIGNATURE (orderNo: 3, ID: 3)
- SMOOTHIE & FRAPPE (orderNo: 4, ID: 4)
- ADE & TEA (orderNo: 5, ID: 5)
- COLD BREW (orderNo: 6, ID: 6)

### 메뉴 아이템 (78개)
- 실제 커피숍 메뉴 데이터
- 각 메뉴는 카테고리 ID와 공통코드로 연결
- 예: 아메리카노 HOT (price: 1500, categoryId: 1, status: 'E0101')

## 🔧 개발 가이드

### 새 마이그레이션 생성

```bash
supabase migration new <migration_name>
```

### 마이그레이션 롤백

```bash
supabase migration repair --status reverted <migration-version>
```

### 타입 생성

```bash
supabase gen types typescript --local > ../src/types/database.types.ts
```

## 📚 상세 가이드

전체 설정 가이드는 [docs/SUPABASE_SETUP.md](../docs/SUPABASE_SETUP.md) 참고

## ⚠️ 주의사항

1. **의존성 순서**: 마이그레이션 파일의 타임스탬프 순서대로 실행해야 합니다.
2. **롤백 주의**: 프로덕션 환경에서는 롤백이 데이터 손실을 초래할 수 있습니다.
3. **RLS 정책**: 프로덕션 배포 전 RLS 정책을 반드시 검토하세요.
4. **초기 데이터**: 시딩 데이터는 프로젝트 요구사항에 맞게 수정 가능합니다.

---

**마지막 업데이트**: 2025-10-28
**버전**: 1.0
