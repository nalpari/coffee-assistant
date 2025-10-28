# Supabase 데이터베이스 설정 가이드

## 📋 개요

이 문서는 Coffee Assistant 프로젝트의 Supabase 데이터베이스 설정 및 마이그레이션 실행 가이드입니다.

## 🎯 전제 조건

- Node.js 18+ 설치
- pnpm 패키지 매니저 설치
- Supabase 계정 생성 ([supabase.com](https://supabase.com))

## 📂 마이그레이션 파일 구조

```
supabase/migrations/
├── 20250001000000_create_common_code.sql  # 공통코드 테이블
├── 20250001000001_create_category.sql     # 카테고리 테이블
├── 20250001000002_create_menu.sql         # 메뉴 테이블
├── 20250001000003_create_image.sql        # 이미지 테이블
├── 20250001000004_setup_rls.sql           # RLS 정책 설정
└── 20250001000005_seed_initial_data.sql   # 초기 데이터 시딩
```

### 테이블 생성 순서 및 의존성

```
common_code (자기참조)
    ↓
category (common_code 참조)
    ↓
menu (category FK, common_code 참조)
    ↓
image (menu FK)
```

## 🚀 Supabase 프로젝트 설정

### 1단계: Supabase CLI 설치

```bash
# npm으로 전역 설치
npm install -g supabase

# 또는 pnpm으로 전역 설치
pnpm add -g supabase
```

### 2단계: Supabase 프로젝트 초기화

```bash
# Supabase CLI 로그인
supabase login

# 프로젝트 디렉토리에서 초기화
supabase init
```

### 3단계: Supabase 프로젝트 생성 (웹 대시보드)

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `coffee-assistant` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` (가장 가까운 리전)
   - **Pricing Plan**: Free (무료 티어로 시작)
4. "Create new project" 클릭
5. 프로젝트 생성 대기 (약 2분 소요)

### 4단계: 프로젝트 연결

```bash
# Supabase 프로젝트와 로컬 연결
supabase link --project-ref <YOUR_PROJECT_REF>

# YOUR_PROJECT_REF는 프로젝트 대시보드 URL에서 확인:
# https://app.supabase.com/project/<YOUR_PROJECT_REF>
```

### 5단계: 환경변수 설정

프로젝트 대시보드에서 API 키 확인:
- **Settings** → **API** 메뉴 이동
- `Project URL` 및 `anon public` 키 복사

`.env.local` 파일 생성:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
```

**주의**: `.env.local` 파일은 Git에 커밋하지 마세요! (`.gitignore`에 이미 포함됨)

## 📊 마이그레이션 실행

### 로컬 개발 환경 (권장)

```bash
# 로컬 Supabase 시작 (Docker 필요)
supabase start

# 마이그레이션 실행
supabase db reset

# 로컬 Studio 접속
# http://localhost:54323
```

### 프로덕션 환경 (Supabase Cloud)

```bash
# 프로덕션 데이터베이스에 마이그레이션 적용
supabase db push

# 또는 개별 마이그레이션 파일 실행 (수동)
supabase db execute --file supabase/migrations/20250001000000_create_common_code.sql
```

## ✅ 마이그레이션 검증

### 1. 테이블 생성 확인

Supabase Dashboard → **Table Editor** 메뉴에서 확인:
- `common_code` 테이블
- `category` 테이블
- `menu` 테이블
- `image` 테이블

### 2. 초기 데이터 확인

```sql
-- 공통코드 데이터 확인
SELECT * FROM public.common_code WHERE del_yn = 'N' ORDER BY sort_order;

-- 카테고리 데이터 확인
SELECT * FROM public.category ORDER BY order_no;
```

### 3. RLS 정책 확인

Supabase Dashboard → **Authentication** → **Policies** 메뉴에서 확인:
- 각 테이블별 읽기/쓰기 정책 설정 확인

### 4. 인덱스 확인

```sql
-- 인덱스 목록 조회
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## 🔧 프론트엔드 통합

### 1. Supabase 클라이언트 패키지 설치

```bash
pnpm add @supabase/supabase-js
```

### 2. Supabase 클라이언트 초기화

`src/lib/supabase.ts` 파일 생성:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. TypeScript 타입 생성

```bash
# Supabase CLI로 자동 타입 생성
supabase gen types typescript --local > src/types/database.types.ts

# 또는 프로덕션에서 생성
supabase gen types typescript --project-id <YOUR_PROJECT_REF> > src/types/database.types.ts
```

### 4. API 레이어 예시

`src/lib/api/menu.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import type { MenuItemDisplay } from '@/types/menu';

/**
 * 모든 활성 메뉴 조회
 */
export async function getActiveMenus(): Promise<MenuItemDisplay[]> {
  const { data, error } = await supabase
    .from('menu')
    .select(`
      *,
      category:category_id (
        id,
        name
      )
    `)
    .in('status', ['E0101', 'E0102']) // E0101=사용, E0102=미사용
    .order('order_no');

  if (error) {
    console.error('메뉴 조회 오류:', error);
    throw error;
  }

  // DB 응답을 MenuItemDisplay로 변환
  return data.map(mapMenuItemToDisplay);
}

/**
 * 카테고리별 메뉴 조회
 */
export async function getMenusByCategory(categoryId: number): Promise<MenuItemDisplay[]> {
  const { data, error } = await supabase
    .from('menu')
    .select(`
      *,
      category:category_id (
        id,
        name
      )
    `)
    .eq('category_id', categoryId)
    .eq('status', 'E0101') // E0101=사용
    .order('order_no');

  if (error) {
    console.error('카테고리별 메뉴 조회 오류:', error);
    throw error;
  }

  return data.map(mapMenuItemToDisplay);
}

/**
 * DB 응답 → MenuItemDisplay 변환 함수
 */
function mapMenuItemToDisplay(item: any): MenuItemDisplay {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    discountPrice: item.discount_price,
    image: '', // TODO: 첫 번째 이미지 URL 조립
    images: [], // TODO: image 테이블 조인
    category: item.category?.name || '',
    categoryId: item.category_id,
    tags: [], // TODO: marketing 배열 → common_code 조인
    available: item.status === 'E0101', // E0101=사용
    popular: item.marketing?.includes('E0202') || false, // E0202=Best
    cold: item.cold,
    hot: item.hot,
    orderNo: item.order_no,
  };
}
```

## 📸 Supabase Storage 설정 (이미지 저장)

### 1. Storage Bucket 생성

Supabase Dashboard → **Storage** 메뉴:
1. "Create a new bucket" 클릭
2. **Name**: `menu-images`
3. **Public bucket**: 체크 (공개 접근 허용)
4. "Create bucket" 클릭

### 2. Storage 정책 설정

```sql
-- 읽기: 모든 사용자 허용
CREATE POLICY "이미지 읽기 허용"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- 쓰기: 인증된 사용자만 허용
CREATE POLICY "이미지 업로드는 인증 사용자만"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');
```

### 3. 이미지 업로드 예시

```typescript
import { supabase } from '@/lib/supabase';

export async function uploadMenuImage(file: File, menuId: number): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileUuid = crypto.randomUUID();
  const fileName = `${fileUuid}.${fileExt}`;
  const filePath = `${fileName}`;

  // Supabase Storage에 업로드
  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // image 테이블에 메타데이터 저장
  const { error: dbError } = await supabase
    .from('image')
    .insert({
      file_uuid: fileUuid,
      file_name: file.name,
      menu_id: menuId,
      menu_type: 'menu',
      ordering: 1,
      created_by: 'system',
      created_date: new Date().toISOString(),
    });

  if (dbError) {
    throw dbError;
  }

  // 공개 URL 반환
  const { data } = supabase.storage
    .from('menu-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

## 🐛 트러블슈팅

### 문제 1: 마이그레이션 실패

**증상**: `supabase db push` 실행 시 오류 발생

**해결방법**:
```bash
# 마이그레이션 상태 확인
supabase migration list

# 특정 마이그레이션 롤백
supabase migration repair --status reverted <migration-version>

# 로컬 DB 재설정
supabase db reset
```

### 문제 2: RLS 정책으로 데이터 조회 불가

**증상**: 프론트엔드에서 데이터 조회 시 빈 배열 반환

**해결방법**:
1. Supabase Dashboard → **Table Editor**에서 직접 데이터 확인
2. RLS 정책 확인 및 수정:
   ```sql
   -- 임시로 RLS 비활성화 (개발 환경만)
   ALTER TABLE public.menu DISABLE ROW LEVEL SECURITY;
   ```

### 문제 3: TypeScript 타입 불일치

**증상**: Supabase 클라이언트 사용 시 타입 오류

**해결방법**:
```bash
# 타입 재생성
supabase gen types typescript --local > src/types/database.types.ts

# 프로젝트 재빌드
pnpm build
```

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase CLI 가이드](https://supabase.com/docs/guides/cli)
- [Supabase + Next.js 통합](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## 🔄 다음 단계

1. ✅ Supabase 프로젝트 생성 및 연결
2. ✅ 마이그레이션 실행 및 검증
3. ✅ 초기 데이터 시딩 확인
4. ⏭️ 프론트엔드 API 레이어 구현
5. ⏭️ 메뉴 관리 기능 개발
6. ⏭️ 이미지 업로드 기능 구현

---

**작성일**: 2025-10-28
**버전**: 1.0
**담당자**: Coffee Assistant Team
