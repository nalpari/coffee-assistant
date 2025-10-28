# Mock Data 개선 문서

## 📋 개선 개요

Mock Data를 실제 DB 스키마와 완벽하게 매핑하고, 향후 API 전환을 위한 구조를 준비했습니다.

**개선 날짜**: 2025-10-28
**관련 Phase**: Phase 1 (기반 설정)
**영향 범위**: `src/types/menu.ts`, `src/data/mock-menu.ts`, `src/lib/api/menu.ts`

---

## 🎯 개선 목표

### 1. DB 스키마와의 명확한 매핑
- 모든 타입과 필드에 DB 테이블/컬럼 정보 주석 추가
- 공통코드 참조 관계 명시
- FK 관계 및 제약조건 문서화

### 2. API 전환 계획 수립
- Mock 데이터 → API 전환 시나리오 명시
- 실제 구현 코드 예시 제공 (주석 형태)
- 타입 호환성 보장

### 3. 타입 안전성 강화
- DB 응답 타입과 Mock 타입 일치
- 컴파일 타임 타입 검증
- 마이그레이션 시 타입 에러 최소화

---

## 📁 개선된 파일 구조

```
src/
├── types/
│   └── menu.ts              ✨ DB 스키마 주석 강화, @dbColumn/@dbTable 추가
├── data/
│   └── mock-menu.ts         ✨ DB 쿼리 주석, API 전환 계획 명시
└── lib/
    └── api/
        └── menu.ts          ✨ 신규 생성 - 향후 API 함수 준비
```

---

## ✨ 주요 개선 사항

### 1. 타입 정의 개선 (`src/types/menu.ts`)

#### Before (기존 코드 없음)
```typescript
// 타입 정의 파일 자체가 없었음
```

#### After (개선된 코드)
```typescript
/**
 * 메뉴 아이템 인터페이스 (DB 엔티티)
 *
 * @dbTable menu
 * @dbPrimaryKey id (bigint, auto_increment)
 */
export interface MenuItem extends BaseEntity {
  /** @dbColumn id bigint PRIMARY KEY AUTO_INCREMENT */
  id: number;

  /** @dbColumn name varchar(255) NOT NULL */
  name: string;

  /**
   * @dbColumn status varchar(255) NOT NULL DEFAULT 'E0101'
   * @dbCodeRef common_code.id
   * @dbValues E0101=사용(MENU_ACTIVE), E0102=미사용(MENU_INACTIVE)
   */
  status: string;

  // ... 기타 필드
}
```

**개선 효과**:
- ✅ DB 스키마와 1:1 매핑 명확화
- ✅ 공통코드 참조 관계 문서화
- ✅ 제약조건 및 기본값 명시
- ✅ 개발자가 DB 스키마를 이해하기 쉬움

---

### 2. Mock Data 개선 (`src/data/mock-menu.ts`)

#### Before (기존 코드 없음)
```typescript
// Mock 데이터 파일 자체가 없었음
```

#### After (개선된 코드)
```typescript
/**
 * 모크 메뉴 데이터
 *
 * 🚨 임시 개발 데이터입니다. 실제 DB 연동 시 API 응답으로 대체됩니다.
 *
 * @purpose MVP 단계에서 프론트엔드 개발을 위한 임시 데이터
 * @replacement Phase 6에서 `src/lib/api/menu.ts`의 getMenuItems() 함수로 대체 예정
 * @dbSchema docs/ddl.md 참조 - 실제 DB 스키마와 동일한 구조 유지
 *
 * @dbEquivalent SELECT
 *   m.*,
 *   c.name as category,
 *   i.file_name as image,
 *   ARRAY_AGG(cc.name) as tags,
 *   (m.status = 'E0101') as available,
 *   ('E0202' = ANY(m.marketing)) as popular
 * FROM menu m
 * LEFT JOIN category c ON m.category_id = c.id
 * LEFT JOIN image i ON m.id = i.menu_id AND i.ordering = 0
 * LEFT JOIN common_code cc ON cc.id = ANY(m.marketing)
 * WHERE m.status = 'E0101'
 * GROUP BY m.id, c.name, i.file_name
 * ORDER BY m.order_no ASC;
 */
export const mockMenuItems: MenuItemDisplay[] = [
  {
    /**
     * @dbTable menu
     * @dbRow id=87, category_id=1, status='E0101', marketing='{}'
     */
    id: 87,
    name: '아메리카노 HOT',
    // ...
  },
  // ...
];

/**
 * TODO: Phase 6에서 아래 함수로 대체
 *
 * @futureImplementation
 * ```typescript
 * export async function getMenuItems(): Promise<MenuItemDisplay[]> {
 *   const response = await fetch('/api/menu');
 *   return response.json();
 * }
 * ```
 */
```

**개선 효과**:
- ✅ Mock 데이터의 임시성 명확히 표시
- ✅ 실제 DB 쿼리와의 동등성 문서화
- ✅ API 전환 계획 명시 (Phase 6)
- ✅ 각 데이터 항목의 DB 매핑 주석 추가

---

### 3. API 유틸리티 함수 준비 (`src/lib/api/menu.ts`)

#### Before (기존 파일 없음)

#### After (신규 생성)
```typescript
/**
 * 메뉴 아이템 목록 조회
 *
 * @dbQuery
 * ```sql
 * SELECT
 *   m.id, m.name, ...
 * FROM menu m
 * LEFT JOIN category c ON m.category_id = c.id
 * WHERE m.status = 'E0101'
 * ORDER BY m.order_no ASC;
 * ```
 *
 * @futureImplementation Phase 6
 * ```typescript
 * export async function getMenuItems(): Promise<MenuItemDisplay[]> {
 *   const response = await fetch('/api/menu', {
 *     method: 'GET',
 *     headers: { 'Content-Type': 'application/json' },
 *     cache: 'no-store',
 *   });
 *
 *   if (!response.ok) {
 *     throw new Error(`Failed to fetch menu items`);
 *   }
 *
 *   return response.json();
 * }
 * ```
 */
export async function getMenuItems(): Promise<MenuItemDisplay[]> {
  // 🚨 임시: Mock 데이터 반환 (Phase 6에서 실제 API 호출로 대체)
  return Promise.resolve(mockMenuItems);
}
```

**개선 효과**:
- ✅ API 인터페이스 미리 정의
- ✅ 실제 구현 코드 예시 제공
- ✅ DB 쿼리 명시로 백엔드 개발 가이드
- ✅ 점진적 마이그레이션 지원

---

## 🔄 API 전환 로드맵

### Phase 1-5 (현재)
```typescript
// src/data/mock-menu.ts 사용
import { mockMenuItems } from '@/data/mock-menu';

const menuItems = mockMenuItems; // 동기 방식
```

### Phase 6 (백엔드 연동)
```typescript
// src/lib/api/menu.ts 사용
import { getMenuItems } from '@/lib/api/menu';

const menuItems = await getMenuItems(); // 비동기 방식
```

**마이그레이션 단계**:
1. ✅ **Step 1**: Mock 데이터 구조 정의 (완료)
2. ✅ **Step 2**: API 함수 인터페이스 준비 (완료)
3. ⏳ **Step 3**: 백엔드 API 구현 (Phase 6)
4. ⏳ **Step 4**: API 함수 실제 구현 (Phase 6)
5. ⏳ **Step 5**: 프론트엔드 코드 전환 (Phase 6)
6. ⏳ **Step 6**: Mock 데이터 제거 (Phase 6 완료 후)

---

## 📊 타입 호환성 보장

### 컴파일 타임 검증
```typescript
// src/data/mock-menu.ts
const _typeCheck: MenuItemDisplay = mockMenuItems[0];
const _categoryTypeCheck: CategoryInfo = mockCategories[0];

// 타입 에러가 발생하지 않음 → 호환성 보장
```

### 런타임 검증
```typescript
// Phase 6 API 전환 시
const apiResponse = await getMenuItems();
const mockData = mockMenuItems;

// 동일한 타입 → 프론트엔드 코드 변경 최소화
type ApiType = typeof apiResponse[0];
type MockType = typeof mockData[0];
// ApiType === MockType (완벽한 호환성)
```

---

## 🎨 DB 스키마 매핑 예시

### 공통코드 구조
```typescript
/**
 * 메뉴 관련 공통코드 (E)
 *   ├─ 메뉴 상태 (E01)
 *   │   ├─ E0101: "사용" (MENU_ACTIVE)
 *   │   └─ E0102: "미사용" (MENU_INACTIVE)
 *   └─ 메뉴 마케팅 유형 (E02)
 *       ├─ E0201: "New" (MENU_TYPE_NEW)
 *       ├─ E0202: "Best" (MENU_TYPE_BEST)
 *       └─ E0203: "Event" (MENU_TYPE_EVENT)
 */
```

### 계산 필드 로직
```typescript
// available: status = 'E0101'
available: item.status === 'E0101'

// popular: 'E0202' IN marketing
popular: item.marketing.includes('E0202')

// category: JOIN category.name
category: categories.find(c => c.id === item.categoryId)?.name || ''

// tags: JOIN common_code.name[]
tags: item.marketing.map(code =>
  commonCodes.find(cc => cc.id === code)?.name || ''
)
```

---

## ✅ 검증 결과

### TypeScript 타입 체크
```bash
$ pnpm tsc --noEmit
✅ 타입 에러 없음
```

### Next.js 빌드
```bash
$ pnpm build
✅ 빌드 성공
Route (app)
┌ ○ /
└ ○ /_not-found
○  (Static)  prerendered as static content
```

### 호환성 검증
- ✅ Mock 데이터 타입 === API 응답 타입
- ✅ DB 스키마 주석 완벽 매핑
- ✅ 공통코드 참조 관계 명시
- ✅ API 전환 계획 문서화

---

## 📝 개발 가이드

### Mock 데이터 사용 (Phase 1-5)
```typescript
// 동기 방식
import { mockMenuItems, mockCategories } from '@/data/mock-menu';

function MenuPage() {
  const items = mockMenuItems; // 즉시 사용 가능
  const categories = mockCategories;

  return (
    <div>
      {items.map(item => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### API 함수 사용 (Phase 6)
```typescript
// 비동기 방식
import { getMenuItems, getCategories } from '@/lib/api/menu';

async function MenuPage() {
  const items = await getMenuItems(); // API 호출
  const categories = await getCategories();

  return (
    <div>
      {items.map(item => (
        <MenuCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

**마이그레이션 시 변경 사항**:
- Import 경로만 변경
- 동기 → 비동기 처리 추가
- 나머지 코드는 동일 (타입 호환성 보장)

---

## 🚀 향후 계획

### Phase 6: 백엔드 연동
1. **Supabase 설정**
   - PostgreSQL 데이터베이스 생성
   - 테이블 스키마 적용 (docs/ddl.md)
   - Row Level Security (RLS) 설정

2. **API 구현**
   - Next.js API Routes 생성 (`app/api/menu/route.ts`)
   - Supabase 클라이언트 연동
   - 에러 핸들링 및 로깅

3. **프론트엔드 전환**
   - `src/lib/api/menu.ts` 실제 구현
   - Mock import → API import 전환
   - 에러 바운더리 추가

4. **테스트 및 검증**
   - API 응답 타입 검증
   - E2E 테스트 실행
   - 성능 측정 및 최적화

5. **Mock 데이터 제거**
   - `src/data/mock-menu.ts` 삭제
   - 관련 주석 정리
   - 문서 업데이트

---

## 📚 참고 자료

- **DB 스키마**: `docs/ddl.md`
- **타입 정의**: `src/types/menu.ts`
- **Mock 데이터**: `src/data/mock-menu.ts`
- **API 함수**: `src/lib/api/menu.ts`
- **요구사항 문서**: `REQUIREMENTS.md`
- **구현 가이드**: `IMPLEMENTATION_GUIDE.md`

---

## 💡 베스트 프랙티스

### 1. DB 주석 작성 규칙
```typescript
/**
 * @dbTable 테이블명
 * @dbColumn 컬럼명 타입 제약조건
 * @dbCodeRef 공통코드 참조
 * @dbValues 가능한 값 목록
 */
```

### 2. Mock 데이터 작성 규칙
```typescript
{
  /**
   * @dbTable 테이블명
   * @dbRow 실제 DB 행 데이터
   * @note 특이사항
   */
  id: 1,
  // ...
}
```

### 3. API 함수 작성 규칙
```typescript
/**
 * @dbQuery SQL 쿼리 명시
 * @futureImplementation 실제 구현 코드 예시
 */
export async function functionName() {
  // 🚨 임시: Mock 반환
  // Phase 6에서 실제 API 호출로 대체
}
```

---

**문서 버전**: 1.0
**작성일**: 2025-10-28
**작성자**: Coffee Assistant Team
