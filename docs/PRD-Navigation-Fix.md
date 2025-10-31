# PRD: 상품 상세 페이지 네비게이션 개선

## 문서 정보
- **문서 버전**: 1.0
- **작성일**: 2025-10-31
- **담당자**: Frontend Team
- **우선순위**: High (Critical Bug Fix)
- **예상 소요 시간**: 1-2 시간

---

## 1. 개요 (Executive Summary)

### 1.1 목적
상품 상세 페이지에서 뒤로가기 버튼 클릭 시 발생하는 404 에러를 해결하여 사용자가 항상 메인 페이지로 안전하게 돌아갈 수 있도록 합니다.

### 1.2 배경
현재 상품 상세 페이지([src/app/products/[id]/page.tsx](src/app/products/[id]/page.tsx:41-43))에서 `router.back()`을 사용하여 이전 페이지로 이동하고 있습니다. 그러나 다음과 같은 시나리오에서 문제가 발생합니다:

**문제 시나리오**:
1. 사용자가 URL을 직접 입력하여 상품 상세 페이지 접근 (예: `/products/158`)
2. 브라우저 히스토리가 비어있음 (이전 페이지 없음)
3. 뒤로가기 버튼 클릭 시 `router.back()` 실행
4. 히스토리가 없어서 404 에러 또는 예상치 못한 동작 발생

### 1.3 기대 효과
- **사용자 경험 개선**: 어떤 경로로 접근하든 항상 메인 페이지로 안전하게 복귀
- **에러 감소**: 404 에러 발생 방지
- **일관된 동작**: 모든 사용자에게 동일한 네비게이션 경험 제공

---

## 2. 문제 분석 (Problem Analysis)

### 2.1 현재 코드
```typescript
// src/app/products/[id]/page.tsx:41-43
const handleGoBack = () => {
  router.back();
};
```

### 2.2 router.back()의 동작 방식

**Next.js `router.back()` 특징**:
- 브라우저의 `window.history.back()`과 동일하게 동작
- 히스토리 스택에서 이전 항목으로 이동
- **히스토리가 없으면 예측 불가능한 동작**

**문제 케이스**:
| 접근 방법 | 히스토리 | router.back() 동작 |
|----------|---------|-------------------|
| 메인 페이지 → 상품 클릭 | 존재 (/) | ✅ 메인 페이지로 복귀 |
| URL 직접 입력 | 없음 | ❌ 404 또는 빈 페이지 |
| 외부 링크 클릭 | 외부 사이트 | ❌ 외부 사이트로 이동 |
| 새 탭에서 열기 | 없음 | ❌ 404 또는 빈 페이지 |

### 2.3 근본 원인
`router.back()`은 **히스토리 기반 네비게이션**이므로, 히스토리가 없거나 예상치 못한 히스토리가 있을 때 문제가 발생합니다.

---

## 3. 요구사항 정의 (Requirements)

### 3.1 기능 요구사항

#### FR-1: 안전한 뒤로가기 동작
**요구사항**:
- 뒤로가기 버튼 클릭 시 항상 메인 페이지(`/`)로 이동
- 히스토리 존재 여부와 무관하게 일관된 동작 보장

**수용 기준**:
- URL 직접 입력 후 뒤로가기 → 메인 페이지 이동
- 메인 페이지에서 상품 클릭 후 뒤로가기 → 메인 페이지 이동
- 외부 링크에서 접근 후 뒤로가기 → 메인 페이지 이동

#### FR-2: 히스토리 보존 옵션 (선택적)
**요구사항** (Advanced):
- 가능한 경우 히스토리를 활용하여 이전 페이지로 이동
- 히스토리가 없는 경우에만 메인 페이지로 fallback

**수용 기준**:
- 메인 페이지에서 진입 시 메인 페이지로 복귀
- 검색 페이지에서 진입 시 검색 페이지로 복귀
- 직접 URL 입력 시 메인 페이지로 fallback

---

### 3.2 비기능 요구사항

#### NFR-1: 성능
- 네비게이션 지연 < 100ms
- 추가 네트워크 요청 없음

#### NFR-2: 접근성
- 뒤로가기 버튼 명확한 레이블 제공
- 키보드 네비게이션 지원 (Tab + Enter)

#### NFR-3: 호환성
- 모든 주요 브라우저에서 동일하게 동작
- 모바일/데스크톱 환경 모두 지원

---

## 4. 해결 방안 (Solution Options)

### 4.1 Option 1: 단순 메인 페이지 이동 (권장 ✅)

**구현 방법**:
```typescript
const handleGoBack = () => {
  router.push('/');
};
```

**장점**:
- ✅ 가장 단순하고 명확한 해결책
- ✅ 모든 시나리오에서 일관된 동작
- ✅ 404 에러 완전 방지
- ✅ 추가 로직 불필요

**단점**:
- ❌ 히스토리 기반 네비게이션 미활용
- ❌ 사용자가 검색 페이지에서 진입한 경우 검색 페이지로 돌아가지 못함

**적용 시기**: Phase 1 (즉시)

---

### 4.2 Option 2: 히스토리 체크 후 조건부 이동 (Advanced)

**구현 방법**:
```typescript
const handleGoBack = () => {
  // 히스토리가 있고, 현재 도메인 내에서 이동한 경우
  if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
    router.back();
  } else {
    // 히스토리가 없거나 외부에서 진입한 경우
    router.push('/');
  }
};
```

**장점**:
- ✅ 히스토리가 있을 때는 활용
- ✅ 히스토리가 없을 때는 안전하게 fallback
- ✅ 더 나은 사용자 경험 (컨텍스트 유지)

**단점**:
- ❌ 추가 로직 필요
- ❌ `document.referrer` 신뢰성 문제 (프라이버시 설정에 따라 차단 가능)
- ❌ 복잡도 증가

**적용 시기**: Phase 2 (선택적)

---

### 4.3 Option 3: 커스텀 히스토리 관리 (Not Recommended)

**구현 방법**:
- 전역 상태에 이전 페이지 경로 저장
- 페이지 진입 시 이전 경로 기록
- 뒤로가기 시 저장된 경로로 이동

**장점**:
- ✅ 완전한 제어 가능

**단점**:
- ❌ 과도한 복잡도
- ❌ 상태 관리 오버헤드
- ❌ 브라우저 뒤로가기 버튼과 동기화 문제

**적용 시기**: 미적용 (오버엔지니어링)

---

## 5. 권장 구현 계획 (Implementation Plan)

### 5.1 Phase 1: 단순 메인 페이지 이동 (즉시 적용)

**작업 범위**:
- `handleGoBack` 함수 수정: `router.back()` → `router.push('/')`
- 뒤로가기 버튼 레이블 명확화 (선택적)

**예상 소요 시간**: 30분

**파일 수정**:
```typescript
// src/app/products/[id]/page.tsx
const handleGoBack = () => {
  router.push('/');
};
```

**검증 방법**:
1. URL 직접 입력: `/products/158` → 뒤로가기 클릭 → `/` 이동 확인
2. 메인 페이지에서 진입: `/` → 상품 클릭 → 뒤로가기 클릭 → `/` 이동 확인
3. 브라우저 뒤로가기 버튼과 헤더 뒤로가기 버튼 모두 테스트

---

### 5.2 Phase 2: 히스토리 기반 조건부 이동 (선택적)

**작업 범위**:
- 히스토리 체크 로직 추가
- `document.referrer` 검증
- Fallback 로직 구현

**예상 소요 시간**: 1-1.5시간

**파일 수정**:
```typescript
// src/app/products/[id]/page.tsx
const handleGoBack = () => {
  const hasHistory = window.history.length > 1;
  const isInternalReferrer = document.referrer &&
    document.referrer.startsWith(window.location.origin);

  if (hasHistory && isInternalReferrer) {
    router.back();
  } else {
    router.push('/');
  }
};
```

**추가 고려사항**:
- 외부 사이트에서 진입 시 fallback 동작 확인
- 새 탭에서 열기 시나리오 테스트
- 모바일 환경 테스트

---

## 6. 테스트 계획 (Testing Plan)

### 6.1 단위 테스트 (선택적)
```typescript
describe('ProductDetailPage - handleGoBack', () => {
  it('should navigate to home page when no history', () => {
    // router.push('/') 호출 확인
  });

  it('should use router.back() when valid history exists', () => {
    // router.back() 호출 확인 (Phase 2)
  });
});
```

### 6.2 통합 테스트 시나리오

#### Test Case 1: URL 직접 입력
```
Given: 사용자가 /products/158 URL을 직접 입력
When: 뒤로가기 버튼 클릭
Then: 메인 페이지(/)로 이동
```

#### Test Case 2: 메인 페이지에서 진입
```
Given: 사용자가 메인 페이지에서 상품 카드 클릭
When: 뒤로가기 버튼 클릭
Then: 메인 페이지(/)로 이동
```

#### Test Case 3: 외부 링크에서 진입
```
Given: 사용자가 외부 사이트 링크를 통해 /products/158 접근
When: 뒤로가기 버튼 클릭
Then: 메인 페이지(/)로 이동 (외부 사이트로 이동 X)
```

#### Test Case 4: 새 탭에서 열기
```
Given: 사용자가 상품 카드를 새 탭에서 열기
When: 뒤로가기 버튼 클릭
Then: 메인 페이지(/)로 이동
```

### 6.3 E2E 테스트 (Playwright)
```typescript
test('상품 상세 페이지 뒤로가기 동작', async ({ page }) => {
  // Test Case 1: URL 직접 입력
  await page.goto('/products/158');
  await page.click('[aria-label="뒤로가기"]');
  await expect(page).toHaveURL('/');

  // Test Case 2: 메인 페이지에서 진입
  await page.goto('/');
  await page.click('[data-testid="menu-card"]:first-child');
  await page.click('[aria-label="뒤로가기"]');
  await expect(page).toHaveURL('/');
});
```

### 6.4 크로스 브라우저 테스트
- Chrome (최신 버전)
- Safari (iOS 포함)
- Firefox
- Edge

---

## 7. 위험 요소 및 대응 방안 (Risks & Mitigation)

### 7.1 기술적 위험

#### 위험 1: document.referrer 신뢰성 문제 (Phase 2)
- **영향도**: Medium
- **대응 방안**:
  - `document.referrer`가 비어있을 경우 메인 페이지로 fallback
  - 브라우저 프라이버시 설정에 영향받을 수 있음 인지
  - Phase 1 구현을 먼저 적용하여 안정성 확보

#### 위험 2: 브라우저 뒤로가기 버튼과 불일치
- **영향도**: Low
- **대응 방안**:
  - 헤더 뒤로가기 버튼과 브라우저 뒤로가기 버튼은 다른 동작 가능
  - 사용자에게 명확한 레이블 제공 ("홈으로" vs "뒤로")

### 7.2 UX 위험

#### 위험 3: 사용자가 검색 결과로 돌아가지 못함
- **영향도**: Medium
- **대응 방안**:
  - Phase 2에서 히스토리 기반 네비게이션 구현
  - 또는 "홈으로" 레이블로 명확히 명시
  - 향후 Breadcrumb 네비게이션 추가 고려

---

## 8. 대안 방안 (Alternative Solutions)

### 8.1 Breadcrumb 네비게이션 추가
```
홈 > 카테고리 > 상품명
```
- 사용자에게 더 명확한 네비게이션 제공
- 현재 위치 파악 용이
- Phase 3에서 고려

### 8.2 "홈으로" 버튼으로 레이블 변경
```typescript
<Button>
  <Home className="h-5 w-5" />
</Button>
```
- 뒤로가기가 아닌 "홈으로" 명확히 표시
- 사용자 기대치 조정

---

## 9. 성공 지표 (Success Metrics)

### 9.1 정량적 지표
- **404 에러 발생률**: 0% (현재 > 0%)
- **뒤로가기 성공률**: 100%
- **페이지 이탈률**: 5% 이하 유지

### 9.2 정성적 지표
- 사용자 피드백: "뒤로가기가 예상대로 동작한다" 긍정 피드백 90% 이상
- QA 테스트: 모든 시나리오에서 일관된 동작 확인

---

## 10. 구현 체크리스트

### Phase 1 (필수)
- [ ] `handleGoBack` 함수 `router.push('/')` 로 변경
- [ ] 뒤로가기 버튼 `aria-label` 확인
- [ ] URL 직접 입력 시나리오 테스트
- [ ] 메인 페이지에서 진입 시나리오 테스트
- [ ] 외부 링크 진입 시나리오 테스트
- [ ] 새 탭 열기 시나리오 테스트

### Phase 2 (선택적)
- [ ] 히스토리 체크 로직 구현
- [ ] `document.referrer` 검증 로직 추가
- [ ] Fallback 동작 테스트
- [ ] 크로스 브라우저 테스트

---

## 11. 참고 자료 (References)

### 11.1 Next.js 문서
- **useRouter**: https://nextjs.org/docs/app/api-reference/functions/use-router
- **Navigation**: https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating

### 11.2 관련 이슈
- Stack Overflow: "router.back() causing 404 error"
- Next.js GitHub Issues: Navigation edge cases

### 11.3 Best Practices
- 항상 fallback 경로 제공
- 히스토리 기반 네비게이션의 한계 인지
- 사용자에게 명확한 레이블 제공

---

## 12. 부록 (Appendix)

### 12.1 코드 비교

#### Before (현재)
```typescript
const handleGoBack = () => {
  router.back();
};
```

#### After (Phase 1)
```typescript
const handleGoBack = () => {
  router.push('/');
};
```

#### After (Phase 2 - Advanced)
```typescript
const handleGoBack = () => {
  const hasHistory = window.history.length > 1;
  const isInternalReferrer = document.referrer &&
    document.referrer.startsWith(window.location.origin);

  if (hasHistory && isInternalReferrer) {
    router.back();
  } else {
    router.push('/');
  }
};
```

---

## 13. 승인 및 검토 (Approvals)

| 역할 | 이름 | 승인 상태 | 날짜 |
|------|------|----------|------|
| Product Owner | - | Pending | - |
| Frontend Lead | - | Pending | - |
| UX Designer | - | Pending | - |
| QA Lead | - | Pending | - |

---

**문서 끝**
