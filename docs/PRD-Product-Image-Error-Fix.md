# PRD: 상품 상세 페이지 스크롤 시 Invalid URL 에러 수정

## 1. 개요

### 1.1 문서 정보
- **작성일**: 2025-10-31
- **버전**: 1.0.0
- **작성자**: Development Team
- **상태**: Ready for Implementation

### 1.2 문제 요약
상품 상세 페이지(`/products/[id]`)에서 스크롤을 움직일 때마다 다음 에러가 발생합니다:

```
TypeError: Failed to construct 'URL': Invalid URL
    at s.formatted_url (simulator.js:1:28992)
    at e.get (simulator.js:7:23131)
    at e.evaluate (simulator.js:7:24131)
    at s.formatted_url (simulator.js:7:37767)
    at s.n (simulator.js:13:74380)
    at It.e._render (simulator.js:7:17870)
    at s.n (simulator.js:7:26922)
    at e.get (simulator.js:7:23131)
    at e.run (simulator.js:7:23868)
    at Fi (simulator.js:7:29108)
```

## 2. 근본 원인 분석 (Root Cause Analysis)

### 2.1 에러 발생 지점
- **파일**: `src/app/products/[id]/page.tsx`
- **컴포넌트**: Next.js `Image` 컴포넌트
- **라인**: 92-100 (Image 컴포넌트 렌더링)

### 2.2 에러 발생 원인

#### 원인 1: 빈 문자열 URL 생성
**위치**: `src/lib/api/menu.ts:298-304`

```typescript
const firstImage = images[0];
const imageUrl = firstImage
  ? `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`
  : '';  // ❌ 문제: 빈 문자열 반환
```

**문제점**:
- 이미지가 없는 상품의 경우 `image` 필드에 빈 문자열(`''`)이 할당됨
- Next.js Image 컴포넌트는 lazy loading을 위해 URL 객체를 생성하려고 시도
- 빈 문자열은 유효한 URL이 아니므로 `new URL('')` 호출 시 에러 발생

#### 원인 2: 조건부 렌더링의 불완전성
**위치**: `src/app/products/[id]/page.tsx:66, 91`

```typescript
const hasValidImage = product.image && product.image.trim() !== '';

{hasValidImage && !imageError ? (
  <Image src={product.image} ... />
) : (
  <div>이미지 준비중</div>
)}
```

**문제점**:
- `product.image`가 빈 문자열일 때 `hasValidImage`는 `false`가 되어야 하지만
- 스크롤 시 React의 재렌더링 과정에서 Next.js Image 컴포넌트가 내부적으로 URL 검증을 시도
- `simulator.js`는 Next.js 개발 모드의 내부 파일로, Image 컴포넌트의 lazy loading 최적화 과정에서 에러 발생

#### 원인 3: Image 컴포넌트의 스크롤 최적화
- Next.js Image 컴포넌트는 viewport 진입 시 이미지 로딩을 최적화
- 스크롤할 때마다 이미지의 가시성을 체크하고 URL 형식을 검증
- 빈 문자열이 `src` 속성에 존재하면 스크롤마다 URL 생성 시도 → 에러 발생

### 2.3 영향 범위
- **직접 영향**: 상품 상세 페이지 (`/products/[id]`)
- **간접 영향**: 이미지가 없는 모든 상품
- **사용자 경험**: 콘솔 에러 발생으로 인한 성능 저하 및 잠재적 렌더링 문제

## 3. 해결 방안

### 3.1 우선순위 및 전략

#### 해결 우선순위
1. **P0 (Critical)**: URL 생성 로직 수정 - 빈 문자열 대신 null 반환
2. **P1 (High)**: Image 컴포넌트 조건부 렌더링 개선
3. **P2 (Medium)**: 타입 안정성 강화
4. **P3 (Low)**: 테스트 케이스 추가

#### 구현 전략
- **Progressive Enhancement**: 단계별 개선으로 안정성 확보
- **Backward Compatible**: 기존 코드와의 호환성 유지
- **Type Safety**: TypeScript를 활용한 타입 안전성 강화

### 3.2 Solution 1: URL 생성 로직 수정 (P0)

#### 3.2.1 목표
- 이미지가 없는 경우 빈 문자열 대신 `null` 또는 `undefined` 반환
- MenuItemDisplay 타입 정의와 일관성 유지

#### 3.2.2 구현 내용

**파일**: `src/lib/api/menu.ts`

**수정 전**:
```typescript
const imageUrl = firstImage
  ? `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`
  : '';
```

**수정 후**:
```typescript
const imageUrl = firstImage
  ? `http://3.35.189.180/minio/images/${firstImage.menuType}/${firstImage.fileUuid}`
  : null;
```

#### 3.2.3 타입 수정

**파일**: `src/types/menu.ts`

**수정 전**:
```typescript
export interface MenuItemDisplay {
  // ...
  /** @computed 첫 번째 image.file_name (ordering ASC LIMIT 1) */
  image: string;
  // ...
}
```

**수정 후**:
```typescript
export interface MenuItemDisplay {
  // ...
  /** @computed 첫 번째 image.file_name (ordering ASC LIMIT 1) | null if no image */
  image: string | null;
  // ...
}
```

#### 3.2.4 영향 범위
- `src/lib/api/menu.ts` - URL 생성 로직
- `src/types/menu.ts` - MenuItemDisplay 타입 정의
- `src/app/products/[id]/page.tsx` - 이미지 조건부 렌더링
- `src/components/menu/MenuCard.tsx` - 메뉴 카드 이미지 렌더링 (잠재적 영향)

### 3.3 Solution 2: Image 컴포넌트 조건부 렌더링 개선 (P1)

#### 3.3.1 목표
- null-safe한 이미지 렌더링 보장
- Next.js Image 컴포넌트가 유효한 URL만 받도록 보장

#### 3.3.2 구현 내용

**파일**: `src/app/products/[id]/page.tsx`

**수정 전**:
```typescript
const hasValidImage = product.image && product.image.trim() !== '';

{hasValidImage && !imageError ? (
  <Image
    src={product.image}
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
    onError={() => setImageError(true)}
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

**수정 후**:
```typescript
const hasValidImage = product.image !== null && product.image.trim() !== '';

{hasValidImage && !imageError ? (
  <Image
    src={product.image!}  // TypeScript non-null assertion (조건문에서 이미 검증됨)
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
    onError={() => setImageError(true)}
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

#### 3.3.3 개선 사항
- `product.image !== null` 명시적 null 체크 추가
- `product.image!` non-null assertion으로 TypeScript 타입 안전성 보장
- 조건문에서 이미 null이 아님을 검증했으므로 안전

### 3.4 Solution 3: 잠재적 영향 컴포넌트 검증 (P2)

#### 3.4.1 목표
- MenuCard 등 다른 컴포넌트에서도 동일한 문제가 발생하지 않도록 예방

#### 3.4.2 검증 대상

**파일**: `src/components/menu/MenuCard.tsx`

**예상 코드**:
```typescript
{product.image ? (
  <Image src={product.image} ... />
) : (
  <div>Fallback</div>
)}
```

**권장 수정**:
```typescript
{product.image !== null && product.image.trim() !== '' ? (
  <Image src={product.image} ... />
) : (
  <div>Fallback</div>
)}
```

#### 3.4.3 체크리스트
- [ ] MenuCard.tsx - 이미지 렌더링 로직 검증
- [ ] MenuGrid.tsx - 그리드 내 이미지 렌더링 검증
- [ ] 기타 MenuItemDisplay를 사용하는 모든 컴포넌트

### 3.5 Solution 4: 테스트 케이스 추가 (P3)

#### 3.5.1 Unit Test

**파일**: `__tests__/lib/api/menu.test.ts` (신규 생성)

```typescript
describe('mapMenuItemToDisplay', () => {
  it('should return null for image when no images exist', () => {
    const mockData = {
      id: 1,
      name: 'Test Product',
      // ... other fields
      image: [], // 빈 배열
    };

    const result = mapMenuItemToDisplay(mockData);
    expect(result.image).toBeNull();
  });

  it('should return valid URL when image exists', () => {
    const mockData = {
      id: 1,
      name: 'Test Product',
      image: [{
        fileUuid: 'test-uuid.jpg',
        menuType: 'menu',
        // ... other fields
      }],
    };

    const result = mapMenuItemToDisplay(mockData);
    expect(result.image).toBe('http://3.35.189.180/minio/images/menu/test-uuid.jpg');
  });
});
```

#### 3.5.2 Integration Test

**파일**: `__tests__/app/products/[id]/page.test.tsx` (신규 생성)

```typescript
describe('ProductDetailPage', () => {
  it('should show fallback when image is null', () => {
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      image: null,
      // ... other fields
    };

    render(<ProductDetailPage />);
    expect(screen.getByText('이미지 준비중')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should not throw URL error on scroll', async () => {
    const mockProduct = {
      id: 1,
      image: null,
      // ... other fields
    };

    render(<ProductDetailPage />);

    // 스크롤 이벤트 시뮬레이션
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    // 에러가 발생하지 않아야 함
    expect(console.error).not.toHaveBeenCalled();
  });
});
```

## 4. 구현 계획

### 4.1 Phase 1: 긴급 수정 (P0)
**목표**: 에러 발생 즉시 해결

#### Task 1.1: URL 생성 로직 수정
- **담당**: Backend/Frontend Developer
- **예상 시간**: 30분
- **파일**: `src/lib/api/menu.ts`
- **작업**:
  1. `mapMenuItemToDisplay` 함수에서 imageUrl 생성 로직 수정 (빈 문자열 → null)
  2. 로컬 테스트로 에러 재현 및 해결 확인

#### Task 1.2: 타입 정의 수정
- **담당**: Frontend Developer
- **예상 시간**: 15분
- **파일**: `src/types/menu.ts`
- **작업**:
  1. `MenuItemDisplay.image` 타입을 `string | null`로 수정
  2. JSDoc 주석 업데이트

#### Task 1.3: 즉시 검증
- **담당**: QA / Developer
- **예상 시간**: 15분
- **작업**:
  1. 개발 서버 실행
  2. 이미지 없는 상품 상세 페이지 접속
  3. 스크롤 테스트 - 콘솔 에러 확인
  4. 이미지 있는 상품에서도 정상 작동 확인

**Total Time**: 1시간

### 4.2 Phase 2: 조건부 렌더링 개선 (P1)
**목표**: 타입 안전성 및 코드 품질 향상

#### Task 2.1: ProductDetailPage 수정
- **담당**: Frontend Developer
- **예상 시간**: 30분
- **파일**: `src/app/products/[id]/page.tsx`
- **작업**:
  1. `hasValidImage` 로직 개선 (`!== null` 명시)
  2. Image 컴포넌트에 non-null assertion 추가
  3. TypeScript 컴파일 에러 해결

#### Task 2.2: 기타 컴포넌트 검증
- **담당**: Frontend Developer
- **예상 시간**: 1시간
- **파일**:
  - `src/components/menu/MenuCard.tsx`
  - `src/components/menu/MenuGrid.tsx`
  - 기타 MenuItemDisplay 사용 컴포넌트
- **작업**:
  1. 모든 Image 컴포넌트 사용처 찾기
  2. null-safe 렌더링 로직 적용
  3. TypeScript 타입 에러 해결

**Total Time**: 1.5시간

### 4.3 Phase 3: 테스트 추가 (P2-P3)
**목표**: 회귀 방지 및 품질 보증

#### Task 3.1: Unit Test 작성
- **담당**: Developer
- **예상 시간**: 1시간
- **파일**: `__tests__/lib/api/menu.test.ts`
- **작업**:
  1. `mapMenuItemToDisplay` 함수 테스트 작성
  2. 이미지 있음/없음 케이스 커버
  3. Jest 실행 및 통과 확인

#### Task 3.2: Integration Test 작성
- **담당**: Developer / QA
- **예상 시간**: 1.5시간
- **파일**: `__tests__/app/products/[id]/page.test.tsx`
- **작업**:
  1. ProductDetailPage 컴포넌트 테스트 작성
  2. 스크롤 이벤트 시뮬레이션 테스트
  3. 에러 발생하지 않음 검증

**Total Time**: 2.5시간

### 4.4 Phase 4: QA 및 배포
**목표**: 프로덕션 배포 준비

#### Task 4.1: 통합 QA
- **담당**: QA Team
- **예상 시간**: 1시간
- **작업**:
  1. 모든 시나리오 테스트
  2. 크로스 브라우저 테스트
  3. 모바일 디바이스 테스트

#### Task 4.2: 배포
- **담당**: DevOps / Developer
- **예상 시간**: 30분
- **작업**:
  1. PR 생성 및 코드 리뷰
  2. CI/CD 파이프라인 통과 확인
  3. 프로덕션 배포
  4. 모니터링 및 롤백 준비

**Total Time**: 1.5시간

### 4.5 전체 일정
- **Phase 1 (긴급)**: 1시간 → 즉시 진행
- **Phase 2 (개선)**: 1.5시간 → Phase 1 완료 후
- **Phase 3 (테스트)**: 2.5시간 → Phase 2와 병행 가능
- **Phase 4 (배포)**: 1.5시간 → 모든 Phase 완료 후

**총 예상 시간**: 6.5시간 (1일 이내 완료 가능)

## 5. 검증 기준 (Acceptance Criteria)

### 5.1 기능 검증
- [ ] 이미지가 없는 상품 상세 페이지에서 스크롤 시 에러가 발생하지 않음
- [ ] 이미지가 있는 상품에서 정상적으로 이미지가 표시됨
- [ ] 이미지 로딩 실패 시 fallback UI가 표시됨
- [ ] 모든 상품 목록에서 이미지 렌더링이 정상 작동함

### 5.2 기술 검증
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 없음
- [ ] 콘솔 에러 없음
- [ ] Next.js 빌드 성공

### 5.3 성능 검증
- [ ] 이미지 lazy loading이 정상 작동함
- [ ] 스크롤 성능 저하 없음
- [ ] 메모리 누수 없음

### 5.4 테스트 검증
- [ ] Unit test 통과율 100%
- [ ] Integration test 통과
- [ ] E2E test 통과 (선택사항)

## 6. 위험 관리

### 6.1 잠재적 위험

#### 위험 1: 타입 변경으로 인한 호환성 문제
- **가능성**: Medium
- **영향도**: High
- **대응 방안**:
  - 모든 MenuItemDisplay 사용처 사전 검증
  - TypeScript strict mode 활용
  - 단계적 배포 (dev → staging → production)

#### 위험 2: 다른 컴포넌트에서 동일 에러 발생
- **가능성**: Low
- **영향도**: Medium
- **대응 방안**:
  - 전체 codebase grep으로 Image 컴포넌트 사용처 검색
  - 일관된 패턴 적용

#### 위험 3: 이미지 로딩 성능 저하
- **가능성**: Low
- **영향도**: Low
- **대응 방안**:
  - 기존 lazy loading 로직 유지
  - 성능 모니터링

### 6.2 롤백 계획
- Git을 통한 즉시 롤백 가능
- 변경사항이 비교적 작아 롤백 리스크 최소
- 롤백 시 이전 버전으로 복원 후 근본 원인 재분석

## 7. 성공 지표

### 7.1 정량적 지표
- **에러 발생률**: 0% (현재: 100% on scroll)
- **콘솔 에러 수**: 0개 (현재: 매 스크롤마다 발생)
- **페이지 로딩 시간**: 유지 또는 개선
- **테스트 커버리지**: 이미지 관련 로직 100%

### 7.2 정성적 지표
- 개발자 경험: 명확한 타입 정의로 개발 편의성 향상
- 유지보수성: null-safe 패턴으로 버그 예방
- 코드 품질: TypeScript strict mode 준수

## 8. 참고 자료

### 8.1 관련 파일
- `src/app/products/[id]/page.tsx` - 상품 상세 페이지
- `src/lib/api/menu.ts` - 메뉴 API 및 데이터 변환
- `src/types/menu.ts` - 메뉴 타입 정의
- `src/components/menu/MenuCard.tsx` - 메뉴 카드 컴포넌트

### 8.2 기술 문서
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [TypeScript Non-null Assertion](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)
- [React Conditional Rendering](https://react.dev/learn/conditional-rendering)

### 8.3 관련 이슈
- 에러 스택트레이스: `TypeError: Failed to construct 'URL': Invalid URL`
- 발생 위치: `simulator.js` (Next.js internal)
- 트리거: 스크롤 이벤트 시 Image lazy loading

## 9. 부록

### 9.1 에러 재현 방법
1. 개발 서버 실행: `pnpm dev`
2. 이미지가 없는 상품 ID로 접속: `http://localhost:3000/products/[id]`
3. 브라우저 DevTools 콘솔 열기
4. 페이지 스크롤
5. 콘솔에서 `TypeError: Failed to construct 'URL'` 확인

### 9.2 수정 전후 비교

#### 수정 전
```typescript
// src/lib/api/menu.ts
const imageUrl = firstImage ? `...` : '';  // ❌ 빈 문자열

// src/types/menu.ts
image: string;  // ❌ null 허용 안 함

// src/app/products/[id]/page.tsx
const hasValidImage = product.image && product.image.trim() !== '';  // ❌ null 체크 없음
```

#### 수정 후
```typescript
// src/lib/api/menu.ts
const imageUrl = firstImage ? `...` : null;  // ✅ null 반환

// src/types/menu.ts
image: string | null;  // ✅ null 허용

// src/app/products/[id]/page.tsx
const hasValidImage = product.image !== null && product.image.trim() !== '';  // ✅ 명시적 null 체크
```

### 9.3 체크리스트

#### Phase 1 체크리스트
- [ ] `src/lib/api/menu.ts` 수정
- [ ] `src/types/menu.ts` 수정
- [ ] 로컬 테스트 완료
- [ ] 에러 재현 안 됨 확인

#### Phase 2 체크리스트
- [ ] `src/app/products/[id]/page.tsx` 수정
- [ ] MenuCard.tsx 검증
- [ ] MenuGrid.tsx 검증
- [ ] TypeScript 컴파일 성공

#### Phase 3 체크리스트
- [ ] Unit test 작성
- [ ] Integration test 작성
- [ ] 모든 테스트 통과

#### Phase 4 체크리스트
- [ ] QA 완료
- [ ] PR 생성 및 리뷰
- [ ] CI/CD 통과
- [ ] 프로덕션 배포
- [ ] 배포 후 모니터링

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-10-31
**다음 리뷰일**: 구현 완료 후
