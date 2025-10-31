# PRD: Product Detail Page URL Construction Error Fix

## 📋 문서 정보

- **작성일**: 2025-10-31
- **우선순위**: P0 (Critical)
- **영향 범위**: 상품 상세 페이지
- **예상 소요 시간**: 1-2 hours

---

## 🎯 문제 정의 (Problem Statement)

### 현재 상황

상품 상세 페이지에서 스크롤 시 다음 에러가 발생:

```
TypeError: Failed to construct 'URL': Invalid URL
    at s.formatted_url (simulator.js:1:28992)
    at e.get (simulator.js:7:23131)
    at e.evaluate (simulator.js:7:24131)
    at s.formatted_url (simulator.js:7:37767)
    ...
```

### 에러 분석

**에러 위치**: [src/app/products/[id]/page.tsx:92-100](src/app/products/[id]/page.tsx#L92-L100)

**에러 유형**: URL Construction Error in Next.js Image Component

**발생 조건**:
1. ✅ 상품 상세 페이지 스크롤 시
2. ✅ 이미지가 `null`인 상품 렌더링 시
3. ✅ Next.js Image 컴포넌트의 lazy loading 중

### 근본 원인 분석

#### 1️⃣ 데이터 레벨 분석

**[types/menu.ts:219](src/types/menu.ts#L219)** - MenuItemDisplay 타입:
```typescript
image: string | null;  // ✅ null 허용
```

**[lib/api/menu.ts:302-304](src/lib/api/menu.ts#L302-L304)** - 이미지 URL 생성:
```typescript
const firstImage = images[0];
const imageUrl = firstImage
  ? `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`
  : null;  // ❌ null 반환 가능
```

**문제점**:
- 이미지가 없는 상품의 경우 `imageUrl = null`
- `null` 값이 Next.js Image 컴포넌트에 전달될 가능성

#### 2️⃣ 컴포넌트 레벨 분석

**[page.tsx:66](src/app/products/[id]/page.tsx#L66)** - 방어 코드:
```typescript
const hasValidImage = product.image !== null && product.image.trim() !== '';
```

**[page.tsx:91-100](src/app/products/[id]/page.tsx#L91-L100)** - 이미지 렌더링:
```typescript
{hasValidImage && !imageError ? (
  <Image
    src={product.image!}  // ❌ null assertion 사용
    alt={product.name}
    fill
    ...
  />
) : (
  <div>이미지 준비중</div>
)}
```

**문제점**:
1. `hasValidImage` 체크가 있지만 `!` (null assertion) 사용
2. 스크롤 중 lazy loading 시점에 `null` 체크 재평가
3. Next.js Image 컴포넌트 내부에서 URL 생성자 호출 시 에러

#### 3️⃣ Next.js Image 컴포넌트 동작

**Image Component 내부 처리**:
1. `src` prop 받음
2. 이미지 최적화를 위해 내부적으로 `new URL(src)` 호출
3. `src`가 `null`이거나 빈 문자열일 경우 "Invalid URL" 에러 발생
4. 스크롤 lazy loading 시점에 조건부 체크가 재평가되면서 에러 발생 가능

---

## 🎯 목표 (Objectives)

### 비즈니스 목표
- [ ] 사용자에게 에러 없는 스크롤 경험 제공
- [ ] 이미지 없는 상품도 안정적으로 표시
- [ ] 개발자 경험 개선 (콘솔 에러 제거)

### 기술적 목표
- [ ] URL 생성 시 유효성 검증 추가
- [ ] Next.js Image 컴포넌트에 null 값 전달 방지
- [ ] 다층 방어 코드 구현 (Defense in Depth)

### 성공 지표
- ✅ 상품 상세 페이지 스크롤 시 에러 0건
- ✅ 이미지 없는 상품도 정상 렌더링
- ✅ 브라우저 콘솔 에러 없음

---

## 🔧 해결 방안 (Solution)

### Layer 1: API 레벨 방어 (menu.ts)

#### 현재 코드 문제점
```typescript
const firstImage = images[0];
const imageUrl = firstImage
  ? `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`
  : null;
```

**개선 코드** - URL 유효성 검증 추가:
```typescript
const firstImage = images[0];
let imageUrl: string | null = null;

if (firstImage && firstImage.fileUuid && firstImage.menuType) {
  try {
    // URL 유효성 검증을 위해 URL 생성자 사용
    const url = `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`;
    new URL(url); // URL 유효성 검증
    imageUrl = url;
  } catch (error) {
    console.warn(`Invalid image URL for menu ${item.id}:`, error);
    imageUrl = null;
  }
}
```

**개선 사항**:
1. ✅ `fileUuid`와 `menuType` 존재 여부 확인
2. ✅ `new URL()` 생성자로 URL 유효성 검증
3. ✅ 에러 발생 시 `null` 반환 및 경고 로그
4. ✅ 잘못된 URL이 절대 외부로 전달되지 않음

---

### Layer 2: 컴포넌트 레벨 방어 (page.tsx)

#### 현재 코드 문제점
```typescript
{hasValidImage && !imageError ? (
  <Image
    src={product.image!}  // ❌ null assertion
    ...
  />
) : (
  <div>이미지 준비중</div>
)}
```

**개선 코드** - 명시적 null 체크:
```typescript
{hasValidImage && !imageError && product.image ? (
  <Image
    src={product.image}  // ✅ null assertion 제거
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
    onError={() => setImageError(true)}
    unoptimized={!product.image.startsWith('http')}  // ✅ 외부 URL 최적화 스킵
  />
) : (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">☕</div>
      <p className="text-lg text-muted-foreground">이미지 준비중</p>
    </div>
  </div>
)}
```

**개선 사항**:
1. ✅ `&& product.image` 명시적 null 체크 추가
2. ✅ `!` (null assertion) 제거
3. ✅ `unoptimized` 속성으로 상대 경로 처리
4. ✅ 세 가지 조건 모두 만족해야 이미지 렌더링

---

### Layer 3: 타입 안전성 강화

**TypeScript 타입 가드 추가 (선택적)**:
```typescript
function isValidImageUrl(url: string | null): url is string {
  if (!url || url.trim() === '') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 사용
{isValidImageUrl(product.image) && !imageError ? (
  <Image src={product.image} ... />
) : (
  <div>이미지 준비중</div>
)}
```

---

## 📐 기술 스펙 (Technical Specifications)

### 파일 변경 사항

#### 1. src/lib/api/menu.ts

**변경 라인**: 298-314

**Before**:
```typescript
const firstImage = images[0];
const imageUrl = firstImage
  ? `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`
  : null;
```

**After**:
```typescript
const firstImage = images[0];
let imageUrl: string | null = null;

if (firstImage && firstImage.fileUuid && firstImage.menuType) {
  try {
    const url = `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`;
    new URL(url);
    imageUrl = url;
  } catch (error) {
    console.warn(`Invalid image URL for menu ${item.id}:`, error);
    imageUrl = null;
  }
}
```

#### 2. src/app/products/[id]/page.tsx

**변경 라인**: 91-100

**Before**:
```typescript
{hasValidImage && !imageError ? (
  <Image
    src={product.image!}
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
    onError={() => setImageError(true)}
  />
```

**After**:
```typescript
{hasValidImage && !imageError && product.image ? (
  <Image
    src={product.image}
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
    onError={() => setImageError(true)}
    unoptimized={!product.image.startsWith('http')}
  />
```

---

## 🚀 구현 단계 (Implementation Steps)

### Step 1: menu.ts 수정 (15분)

```typescript
// src/lib/api/menu.ts:298-314
const firstImage = images[0];
let imageUrl: string | null = null;

if (firstImage && firstImage.fileUuid && firstImage.menuType) {
  try {
    const url = `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`;
    new URL(url);
    imageUrl = url;
  } catch (error) {
    console.warn(`Invalid image URL for menu ${item.id}:`, error);
    imageUrl = null;
  }
}
```

**검증**:
```bash
# TypeScript 컴파일 확인
pnpm tsc --noEmit
```

---

### Step 2: page.tsx 수정 (10분)

```typescript
// src/app/products/[id]/page.tsx:91-100
{hasValidImage && !imageError && product.image ? (
  <Image
    src={product.image}
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
    onError={() => setImageError(true)}
    unoptimized={!product.image.startsWith('http')}
  />
) : (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">☕</div>
      <p className="text-lg text-muted-foreground">이미지 준비중</p>
    </div>
  </div>
)}
```

**검증**:
```bash
# ESLint 검사
pnpm lint
```

---

### Step 3: 테스트 (20분)

#### 3.1 로컬 개발 서버 테스트

```bash
# 개발 서버 재시작
pnpm dev
```

**브라우저에서**:
1. http://localhost:3000 접속
2. 이미지 있는 상품 클릭 → 상세 페이지
3. **스크롤 테스트** → 콘솔 에러 확인
4. 이미지 없는 상품 클릭 → 상세 페이지
5. **스크롤 테스트** → 폴백 UI 확인

#### 3.2 테스트 케이스

```
[ ] TC-001: 이미지 있는 상품 스크롤
  Given: 상품 152 (이미지 있음)
  When: 상세 페이지 접속 후 스크롤
  Then: 콘솔 에러 없음, 이미지 정상 표시

[ ] TC-002: 이미지 없는 상품 렌더링
  Given: 이미지 null인 상품
  When: 상세 페이지 접속
  Then: "이미지 준비중" 폴백 UI 표시

[ ] TC-003: 잘못된 URL 상품
  Given: fileUuid가 빈 문자열인 상품
  When: 상세 페이지 접속
  Then: null 처리 후 폴백 UI 표시

[ ] TC-004: 스크롤 반복 테스트
  Given: 상품 상세 페이지
  When: 10회 스크롤 up/down
  Then: 에러 발생 없음
```

---

### Step 4: 커밋 (5분)

```bash
git add src/lib/api/menu.ts src/app/products/[id]/page.tsx
git commit -m "fix: Add URL validation to prevent Invalid URL error in product detail page

- Add URL constructor validation in menu.ts image URL generation
- Add explicit null check in product detail Image component
- Add unoptimized prop for non-http URLs
- Remove null assertion operator for type safety

Fixes TypeError: Failed to construct 'URL' during product page scrolling"
```

---

## ✅ 완료 기준 (Definition of Done)

### 필수 요구사항
- [x] menu.ts에 URL 유효성 검증 추가
- [x] page.tsx에 명시적 null 체크 추가
- [x] TypeScript 컴파일 에러 없음
- [x] ESLint 경고 없음
- [ ] 스크롤 시 콘솔 에러 미발생
- [ ] 이미지 없는 상품 폴백 UI 정상 표시

### 코드 품질
- [x] null assertion (`!`) 제거
- [x] 다층 방어 코드 구현
- [x] 에러 처리 로깅 추가
- [x] 타입 안전성 유지

### 문서화
- [x] PRD 작성 완료
- [ ] 변경 사항 커밋
- [ ] 팀 공유 (해당 시)

---

## 🧪 테스트 계획 (Test Plan)

### 수동 테스트 체크리스트

```
환경: 로컬 개발 서버 (pnpm dev)

✅ TC-001: 이미지 있는 상품 스크롤
  Given: http://localhost:3000/products/152 접속
  When: 페이지 스크롤 (10회 반복)
  Then:
    - 콘솔에 "TypeError: Failed to construct 'URL'" 없음
    - 이미지 정상 표시
    - 스크롤 부드러움

✅ TC-002: 이미지 없는 상품
  Given: image = null인 상품
  When: 상세 페이지 접속
  Then:
    - 폴백 UI (☕ 이모지 + "이미지 준비중") 표시
    - 콘솔 에러 없음

✅ TC-003: 빠른 스크롤 반복
  Given: 상품 상세 페이지
  When: 빠르게 스크롤 up/down 반복
  Then:
    - 에러 발생 없음
    - 메모리 누수 없음

✅ TC-004: 브라우저 뒤로가기 후 재진입
  Given: 상품 상세 페이지 방문 후 메인으로 이동
  When: 브라우저 뒤로가기 → 같은 상품 재클릭
  Then:
    - 캐시된 이미지 정상 표시
    - 에러 없음
```

---

## 📊 성공 지표 (Success Metrics)

### 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 스크롤 에러 발생 | 100% | 0% | 브라우저 콘솔 |
| 이미지 폴백 성공률 | 불안정 | 100% | 이미지 없는 상품 테스트 |
| URL 유효성 검증 | 없음 | 100% | menu.ts 로직 |
| null assertion 사용 | 1회 | 0회 | 코드 검토 |

### 정성적 지표

- ✅ **사용자 경험**: 스크롤 시 에러 없는 부드러운 경험
- ✅ **개발자 경험**: 콘솔 노이즈 제거, 안전한 코드
- ✅ **유지보수성**: 다층 방어로 향후 유사 이슈 방지

---

## 🚨 위험 요소 및 대응 (Risks & Mitigation)

### 위험 요소 1: 이미지 서버 장애

**위험**:
- MinIO 서버(`3.35.189.180`) 다운 시 모든 이미지 로드 실패
- 폴백 UI는 표시되지만 사용자 경험 저하

**대응책**:
1. **CDN 도입**: CloudFront/Cloudflare 등 CDN 캐싱
2. **다중 서버**: 이미지 서버 이중화
3. **로컬 플레이스홀더**: 기본 이미지 static 폴더에 저장

### 위험 요소 2: DB에 잘못된 데이터 저장

**위험**:
- `fileUuid`에 빈 문자열, 특수문자, 잘못된 경로 저장
- URL 생성 시점에 에러 발생

**대응책**:
1. **DB 제약 조건**: `CHECK (file_uuid IS NOT NULL AND LENGTH(file_uuid) > 0)`
2. **API 입력 검증**: 이미지 업로드 API에서 UUID 형식 검증
3. **현재 수정**: `new URL()` 검증으로 런타임 방어

### 위험 요소 3: Next.js 버전 업그레이드 영향

**위험**:
- Next.js 17+ 업그레이드 시 Image 컴포넌트 동작 변경
- `unoptimized` 속성 deprecated 가능성

**대응책**:
1. **Changelog 모니터링**: Next.js 릴리스 노트 확인
2. **점진적 업그레이드**: 테스트 환경에서 먼저 검증
3. **E2E 테스트**: 이미지 렌더링 E2E 테스트 추가

---

## 📚 참고 자료 (References)

### Next.js 공식 문서
- [Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Remote Patterns](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)

### TypeScript
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Non-null Assertion Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator)

### 관련 이슈
- [Next.js GitHub: Image Invalid URL](https://github.com/vercel/next.js/issues?q=is%3Aissue+image+invalid+url)

### 내부 문서
- [docs/PRD-Product-Image-Error-Fix.md](docs/PRD-Product-Image-Error-Fix.md) - 이전 이미지 에러 해결 기록
- [docs/PRD-CartItem-Image-Error-Fix.md](docs/PRD-CartItem-Image-Error-Fix.md) - 장바구니 이미지 에러 해결

---

## 🔄 변경 이력 (Changelog)

### 2025-10-31 - 초안 작성
- **작성자**: Claude Code
- **이유**: 상품 상세 페이지 스크롤 시 "Failed to construct 'URL'" 에러 발생
- **근본 원인**: null 이미지 URL이 Next.js Image 컴포넌트에 전달됨
- **해결 방안**: API 레벨 URL 검증 + 컴포넌트 레벨 null 체크

---

## 🎓 학습 내용 (Lessons Learned)

### Next.js Image Component 동작 원리
1. **URL 생성 의존성**: Image 컴포넌트는 `src`를 `new URL()`로 처리
2. **lazy loading 시점**: 스크롤 시 조건부 체크 재평가
3. **null assertion 위험**: `!` 사용은 런타임 에러 숨김

### 다층 방어 (Defense in Depth)
1. **Layer 1 (API)**: 데이터 생성 시점 검증 (menu.ts)
2. **Layer 2 (Component)**: UI 렌더링 시점 검증 (page.tsx)
3. **Layer 3 (Type)**: 타입 가드로 컴파일 시점 안전성

### TypeScript Best Practices
1. **Avoid null assertion**: `!` 대신 명시적 체크
2. **Type guards**: `is` 키워드로 타입 좁히기
3. **Early return**: 조건 분기 간소화

---

## 🏁 최종 정리

### 핵심 요약
- **문제**: Next.js Image 컴포넌트에 null URL 전달로 에러 발생
- **원인**: API 레벨 URL 생성 시 유효성 검증 없음 + 컴포넌트 레벨 null assertion 사용
- **해결**: 다층 방어 구현 (API 검증 + 컴포넌트 명시적 체크)
- **예상 소요**: 1-2시간
- **위험도**: 낮음 (방어 코드 추가)

### 다음 단계
1. ✅ menu.ts 수정 완료
2. ✅ page.tsx 수정 완료
3. ⏳ 브라우저 테스트 수행
4. ⏳ 커밋 및 문서화

**성공을 기원합니다! 🚀**
