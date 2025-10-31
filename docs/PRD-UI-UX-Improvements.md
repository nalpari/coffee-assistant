# PRD: UI/UX 개선 - 카테고리 아이콘 및 상품 카드 UX 최적화

## 문서 정보
- **문서 버전**: 1.0
- **작성일**: 2025-10-31
- **담당자**: Frontend Team
- **우선순위**: High
- **예상 소요 시간**: 8-12 시간

---

## 1. 개요 (Executive Summary)

### 1.1 목적
현재 메인 페이지의 카테고리 탭 UI가 과도한 공간을 차지하고, 상품 카드 인터랙션 UX가 직관적이지 않은 문제를 해결하여 사용자 경험을 개선합니다.

### 1.2 배경
- 카테고리 아이콘 영역이 과도하게 크게 표시되어 콘텐츠 영역 압박
- 반응형 레이아웃에서 양쪽 끝이 잘리는 문제 발생
- 상품 카드 클릭 시 즉시 장바구니 추가되어 상세 페이지 진입 불가
- 담기 버튼과 상세 보기 기능이 분리되지 않아 사용자 혼란

### 1.3 기대 효과
- **공간 효율성 향상**: 카테고리 탭 영역 30-40% 축소로 콘텐츠 노출 증대
- **UX 개선**: 상품 상세 보기와 담기 기능 분리로 사용자 의도 명확화
- **전환율 향상**: 상세 페이지 도입으로 정보 제공 강화 및 구매 결정 지원
- **반응형 개선**: 모바일/태블릿 환경에서 레이아웃 안정성 확보

---

## 2. 요구사항 정의 (Requirements)

### 2.1 카테고리 탭 UI 개선

#### 2.1.1 아이콘 크기 및 레이아웃 최적화
**현재 상태**:
```tsx
// CategoryTabs.tsx:43-44
<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
<span className="font-medium hidden sm:inline whitespace-nowrap">{name}</span>
```

**개선 요구사항**:
- [x] 아이콘 크기를 `h-3 w-3 sm:h-4 sm:w-4`로 축소 (기존 대비 20% 감소)
- [x] 버튼 패딩을 `px-3 py-2 sm:px-4 sm:py-2.5`로 조정 (기존 대비 25% 감소)
- [x] 가운데 정렬에서 왼쪽 정렬로 변경 (`justify-center` → `justify-start`)
- [x] 좌우 스크롤 영역 여백 추가로 잘림 현상 방지

**수용 기준**:
- 데스크톱 환경에서 카테고리 탭 전체 높이 < 60px
- 모바일 환경에서 좌우 스크롤 시 양쪽 끝 버튼 완전 표시
- 터치 영역(touch target) 최소 44x44px 유지 (접근성 준수)

#### 2.1.2 반응형 레이아웃 개선
**개선 요구사항**:
- [x] 컨테이너 여백 조정: `px-4` → `px-6 sm:px-8`
- [x] 스크롤 가능 영역에 fade-out 그라데이션 추가 (선택적)
- [x] 모바일에서 좌우 스냅 스크롤 기능 추가 (`scroll-snap-type: x mandatory`)

**수용 기준**:
- iPhone SE (375px), iPad (768px), Desktop (1920px) 환경에서 레이아웃 검증
- 스크롤 시 부드러운 애니메이션 적용 (`scroll-behavior: smooth`)

---

### 2.2 상품 카드 인터랙션 개선

#### 2.2.1 담기 버튼 추가
**현재 상태**:
```tsx
// MenuCard.tsx:19-24
<Card onClick={onClick} className="cursor-pointer transition-all hover:shadow-lg">
  {/* 카드 전체 클릭 시 장바구니 추가 */}
</Card>
```

**개선 요구사항**:
- [x] 상품 이미지 영역 오른쪽 하단에 담기 버튼 추가
  - 위치: `absolute bottom-2 right-2`
  - 크기: `h-10 w-10` (40x40px)
  - 디자인: 원형, Primary 색상, 그림자 효과
  - 아이콘: ShoppingCart 또는 Plus 아이콘 (lucide-react)
- [x] 버튼 클릭 시 이벤트 전파 중단 (`event.stopPropagation()`)
- [x] 장바구니 추가 시 시각적 피드백 (버튼 애니메이션, 토스트 메시지)

**수용 기준**:
- 담기 버튼 클릭 시 상품 상세 페이지로 이동하지 않음
- 담기 버튼이 상품 정보(제목, 가격)를 가리지 않음
- 품절 상품의 경우 담기 버튼 비활성화 또는 숨김 처리

#### 2.2.2 상품 카드 클릭 동작 변경
**개선 요구사항**:
- [x] 카드 클릭 시 상품 상세 페이지로 이동 (`/products/[id]`)
- [x] Next.js App Router를 활용한 동적 라우팅 구현
- [x] 상세 페이지 URL 구조: `/products/{product_id}`

**수용 기준**:
- 카드의 담기 버튼 영역 외 모든 영역 클릭 시 상세 페이지 이동
- 브라우저 뒤로가기 버튼으로 메인 페이지 복귀 가능

---

### 2.3 상품 상세 페이지 개발

#### 2.3.1 페이지 구조
**필수 구성 요소**:
1. **상품 이미지 섹션**
   - 메인 이미지 표시 (aspect-ratio: 1:1)
   - 이미지 없을 경우 플레이스홀더 표시
   - 줌 기능 (선택적, Phase 2)

2. **상품 정보 섹션**
   - 상품명 (h1, 폰트 크기: 2xl-3xl)
   - 카테고리 태그 (Badge 컴포넌트)
   - 가격 정보 (할인가 있을 경우 원가 취소선)
   - 상세 설명 (description 필드)
   - 인기 상품 배지 (popular === true인 경우)
   - 재고 상태 표시 (available 필드 기반)

3. **액션 버튼 섹션**
   - 담기 버튼 (Primary, 전체 너비)
   - 수량 조절 컨트롤 (-, 숫자, +)
   - 뒤로가기 버튼 또는 X 아이콘

**레이아웃 구조**:
```
Desktop (>= 768px):          Mobile (< 768px):
┌─────────────────────┐      ┌─────────────────┐
│  Image  │  Info     │      │     Image       │
│         │           │      ├─────────────────┤
│         │  Price    │      │     Info        │
│         │           │      ├─────────────────┤
│         │  Actions  │      │     Actions     │
└─────────────────────┘      └─────────────────┘
```

#### 2.3.2 데이터 연동
**필요 데이터**:
- API Endpoint: `GET /api/menu/{id}`
- 타입: `MenuItemDisplay` (기존 타입 재사용)
- 로딩 상태, 에러 상태 처리

**개선 요구사항**:
- [x] React Query(`useQuery`)를 활용한 데이터 페칭
- [x] 로딩 중 스켈레톤 UI 표시
- [x] 404 에러 시 "상품을 찾을 수 없습니다" 메시지 표시
- [x] 서버 에러 시 재시도 버튼 제공

#### 2.3.3 담기 기능
**개선 요구사항**:
- [x] 수량 조절 가능 (기본값: 1, 최소: 1, 최대: 99)
- [x] 담기 버튼 클릭 시 장바구니 store에 추가
- [x] 성공 시 토스트 메시지: "장바구니에 추가되었습니다"
- [x] 장바구니로 이동 옵션 제공 (토스트 내 "장바구니 보기" 버튼)

**수용 기준**:
- 품절 상품의 경우 담기 버튼 비활성화
- 이미 장바구니에 있는 상품의 경우 수량 증가
- 담기 성공 후 페이지 이동 없음 (사용자 선택)

---

## 3. 기술 스펙 (Technical Specifications)

### 3.1 파일 변경 사항

#### 3.1.1 수정 파일
1. **`src/components/menu/CategoryTabs.tsx`**
   - 아이콘 크기, 패딩 조정
   - 정렬 방식 변경 (center → start)
   - 스크롤 영역 여백 추가

2. **`src/components/menu/MenuCard.tsx`**
   - 담기 버튼 UI 추가 (이미지 오른쪽 하단)
   - 카드 클릭 이벤트를 상세 페이지 이동으로 변경
   - 담기 버튼 이벤트 전파 중단 처리

3. **`src/app/page.tsx`**
   - `handleItemClick` 로직 변경 (장바구니 추가 → 상세 페이지 이동)

#### 3.1.2 신규 파일
1. **`src/app/products/[id]/page.tsx`**
   - 상품 상세 페이지 메인 컴포넌트
   - 동적 라우팅 파라미터 처리
   - SEO 메타데이터 설정

2. **`src/hooks/use-product-query.ts`**
   - 개별 상품 데이터 조회 훅
   - React Query 기반 데이터 페칭
   - 캐싱 및 리페치 전략

3. **`src/components/product/ProductDetail.tsx`** (선택적)
   - 상품 상세 정보 표시 컴포넌트
   - 재사용 가능한 UI 컴포넌트

4. **`src/components/product/QuantityControl.tsx`** (선택적)
   - 수량 조절 컨트롤 컴포넌트

### 3.2 컴포넌트 계층 구조
```
src/app/products/[id]/page.tsx (페이지)
└─ ProductDetail (상품 상세 컴포넌트)
   ├─ Image (상품 이미지)
   ├─ ProductInfo (상품 정보)
   │  ├─ Badge (카테고리, 태그)
   │  ├─ Price (가격 표시)
   │  └─ Description (설명)
   └─ ProductActions (액션 영역)
      ├─ QuantityControl (수량 조절)
      └─ AddToCartButton (담기 버튼)
```

### 3.3 API 엔드포인트

#### 기존 API 활용
```typescript
// GET /api/menu/{id}
// 응답 타입: MenuItemDisplay
interface MenuItemDisplay {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  image: string;
  categoryId: number;
  categoryName: string;
  available: boolean;
  popular: boolean;
  tags: string[];
}
```

### 3.4 상태 관리
- **장바구니 Store**: 기존 `useCartStore` 활용
- **상품 데이터**: React Query로 서버 상태 관리
- **로컬 상태**: 수량 조절, UI 인터랙션 (useState)

### 3.5 라우팅 구조
```
/ (홈페이지)
├─ /products/[id] (상품 상세)
├─ /checkout (결제 페이지)
└─ /orders/[id]/complete (주문 완료)
```

---

## 4. 구현 계획 (Implementation Plan)

### 4.1 Phase 1: 카테고리 탭 UI 개선 (2시간)
**작업 범위**:
- [x] CategoryTabs.tsx 아이콘 크기 및 패딩 조정
- [x] 정렬 방식 변경 (center → start)
- [x] 반응형 레이아웃 검증 및 수정
- [x] 스크롤 영역 여백 추가

**검증 방법**:
- Chrome DevTools 반응형 모드 테스트
- 실제 디바이스 테스트 (iPhone, iPad)

---

### 4.2 Phase 2: 상품 카드 담기 버튼 추가 (3시간)
**작업 범위**:
- [x] MenuCard.tsx에 담기 버튼 UI 추가
- [x] 이벤트 핸들러 분리 (카드 클릭 vs 담기 버튼)
- [x] 시각적 피드백 구현 (애니메이션, 토스트)
- [x] 품절 상품 처리 로직

**검증 방법**:
- 담기 버튼 클릭 시 상세 페이지 이동 안 함 확인
- 장바구니 추가 로직 동작 확인
- 품절 상품 담기 버튼 비활성화 확인

---

### 4.3 Phase 3: 상품 상세 페이지 개발 (5-7시간)

#### 3.1 라우팅 및 데이터 레이어 (2시간)
- [x] `/products/[id]/page.tsx` 파일 생성
- [x] 동적 라우팅 파라미터 처리
- [x] `use-product-query.ts` 훅 개발
- [x] API 연동 및 에러 처리

#### 3.2 UI 컴포넌트 개발 (2-3시간)
- [x] 상품 이미지 섹션 구현
- [x] 상품 정보 섹션 구현 (이름, 가격, 설명)
- [x] 수량 조절 컨트롤 개발
- [x] 담기 버튼 및 액션 영역 구현

#### 3.3 반응형 레이아웃 및 스타일링 (1-2시간)
- [x] 데스크톱/모바일 레이아웃 분기
- [x] Tailwind CSS 스타일링
- [x] 다크 모드 지원 확인

**검증 방법**:
- 상품 상세 페이지 접근 및 데이터 로딩 확인
- 담기 기능 동작 확인
- 장바구니 연동 확인
- 반응형 레이아웃 검증

---

### 4.4 Phase 4: 통합 테스트 및 QA (2시간)
**작업 범위**:
- [x] E2E 사용자 플로우 테스트
  1. 메인 페이지 → 카테고리 선택 → 상품 카드 클릭 → 상세 페이지
  2. 상세 페이지 → 수량 조절 → 담기 → 장바구니 확인
  3. 메인 페이지 → 상품 카드 담기 버튼 → 장바구니 확인
- [x] 크로스 브라우저 테스트 (Chrome, Safari, Firefox)
- [x] 접근성 검증 (키보드 네비게이션, 스크린 리더)
- [x] 성능 측정 (Lighthouse, Core Web Vitals)

**수용 기준**:
- Lighthouse Performance Score ≥ 90
- 접근성 검사 통과 (WCAG 2.1 AA)
- 모든 주요 브라우저에서 동작 확인

---

## 5. 비기능 요구사항 (Non-Functional Requirements)

### 5.1 성능
- **페이지 로딩**: 상품 상세 페이지 초기 로딩 < 1.5초 (3G 환경)
- **이미지 최적화**: Next.js Image 컴포넌트 활용, lazy loading
- **번들 크기**: 추가 번들 크기 < 50KB (gzip 압축 후)

### 5.2 접근성
- **키보드 네비게이션**: Tab, Enter, Space 키로 모든 인터랙션 가능
- **스크린 리더**: 담기 버튼, 수량 조절 등 명확한 레이블 제공
- **색상 대비**: WCAG 2.1 AA 기준 충족 (4.5:1 이상)
- **터치 영역**: 최소 44x44px 확보

### 5.3 SEO
- **메타데이터**: 상품명, 설명, 이미지 OpenGraph 태그 설정
- **구조화 데이터**: Schema.org Product 마크업 (선택적)
- **URL 구조**: `/products/{id}` 형태로 검색엔진 친화적

### 5.4 호환성
- **브라우저**: Chrome, Safari, Firefox, Edge 최신 2버전
- **디바이스**: iOS 14+, Android 10+
- **화면 크기**: 320px ~ 2560px

---

## 6. 테스트 계획 (Testing Plan)

### 6.1 단위 테스트 (선택적)
- `QuantityControl` 컴포넌트 수량 증감 로직
- `use-product-query` 훅 데이터 페칭 및 에러 처리

### 6.2 통합 테스트
- 상품 카드 → 상세 페이지 네비게이션
- 담기 버튼 → 장바구니 추가 → 장바구니 시트 확인
- 수량 조절 → 장바구니 반영

### 6.3 E2E 테스트 (Playwright)
```typescript
// 테스트 시나리오
test('사용자가 상품 상세 페이지에서 장바구니에 담을 수 있다', async ({ page }) => {
  // 1. 메인 페이지 접속
  await page.goto('/');

  // 2. 첫 번째 상품 카드 클릭
  await page.click('[data-testid="menu-card"]:first-child');

  // 3. 상세 페이지 로딩 확인
  await expect(page).toHaveURL(/\/products\/\d+/);

  // 4. 수량을 2로 변경
  await page.click('[data-testid="quantity-increment"]');

  // 5. 담기 버튼 클릭
  await page.click('[data-testid="add-to-cart-button"]');

  // 6. 토스트 메시지 확인
  await expect(page.locator('text=장바구니에 추가되었습니다')).toBeVisible();

  // 7. 장바구니 열기
  await page.click('[data-testid="cart-button"]');

  // 8. 장바구니에 상품 2개 추가 확인
  await expect(page.locator('[data-testid="cart-item-quantity"]')).toHaveText('2');
});
```

### 6.4 시각적 회귀 테스트 (선택적)
- Percy 또는 Chromatic를 활용한 스냅샷 테스트
- 카테고리 탭, 상품 카드, 상세 페이지 스크린샷 비교

---

## 7. 위험 요소 및 대응 방안 (Risks & Mitigation)

### 7.1 기술적 위험

#### 위험 1: 이미지 로딩 성능 저하
- **영향도**: High
- **대응 방안**:
  - Next.js Image 컴포넌트의 `priority` 속성 활용
  - 상세 페이지 메인 이미지는 우선 로딩
  - WebP 포맷 변환 및 CDN 활용 권장

#### 위험 2: 장바구니 상태 동기화 문제
- **영향도**: Medium
- **대응 방안**:
  - Zustand store의 persist 기능 활용
  - 페이지 이동 시 상태 검증 로직 추가
  - 에러 발생 시 사용자에게 명확한 피드백

#### 위험 3: 동적 라우팅 파라미터 검증 누락
- **영향도**: Medium
- **대응 방안**:
  - 숫자가 아닌 ID 접근 시 404 처리
  - 존재하지 않는 상품 ID에 대한 에러 핸들링
  - TypeScript strict mode로 타입 안정성 확보

### 7.2 UX 위험

#### 위험 4: 카테고리 탭 크기 축소로 터치 영역 부족
- **영향도**: High
- **대응 방안**:
  - 최소 터치 영역 44x44px 보장
  - 패딩은 줄이되 클릭 가능 영역은 유지
  - 실제 디바이스 테스트로 검증

#### 위험 5: 담기 버튼과 상세 페이지 진입 혼란
- **영향도**: Medium
- **대응 방안**:
  - 담기 버튼 시각적 강조 (그림자, 색상)
  - 첫 방문 시 간단한 툴팁 표시 (선택적)
  - 사용자 피드백 수집 및 개선

---

## 8. 성공 지표 (Success Metrics)

### 8.1 정량적 지표
- **카테고리 탭 높이 감소**: 기존 대비 30% 이상 축소
- **상세 페이지 진입률**: 전체 상품 카드 클릭의 60% 이상
- **장바구니 추가율**: 상세 페이지에서의 담기 버튼 클릭률 40% 이상
- **페이지 로딩 시간**: 상세 페이지 LCP < 2.5초
- **바운스율 감소**: 상세 페이지 도입 후 5% 이상 감소

### 8.2 정성적 지표
- **사용자 피드백**: "상품 정보 확인이 편리해졌다" 긍정 피드백 80% 이상
- **접근성 개선**: 키보드 사용자 및 스크린 리더 사용자 피드백 수집
- **디자인 일관성**: 기존 디자인 시스템과의 조화 평가

---

## 9. 향후 개선 방안 (Future Enhancements)

### Phase 2 백로그
1. **상품 이미지 갤러리**: 다중 이미지 지원 및 이미지 줌 기능
2. **관련 상품 추천**: 상세 페이지 하단에 유사 상품 표시
3. **리뷰 및 평점**: 상품 리뷰 작성 및 조회 기능
4. **좋아요/찜 기능**: 상품을 찜 목록에 추가
5. **공유 기능**: 상품 링크 복사, SNS 공유
6. **옵션 선택**: 사이즈, 온도, 추가 옵션 선택 UI
7. **재고 알림**: 품절 상품 재입고 알림 신청

### 기술 부채 관리
- shadcn/ui `Dialog` 컴포넌트를 활용한 모달 방식 검토
- 상세 페이지 데이터 prefetching 최적화
- 이미지 CDN 및 최적화 파이프라인 구축

---

## 10. 참고 자료 (References)

### 10.1 디자인 시스템
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS v4**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/

### 10.2 접근성 가이드라인
- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/
- **Touch Target Size**: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

### 10.3 기술 문서
- **Next.js App Router**: https://nextjs.org/docs/app
- **Next.js Image Optimization**: https://nextjs.org/docs/app/building-your-application/optimizing/images
- **React Query**: https://tanstack.com/query/latest
- **Zustand**: https://zustand-demo.pmnd.rs/

---

## 11. 부록 (Appendix)

### 11.1 데이터 모델
```typescript
// MenuItemDisplay (기존)
interface MenuItemDisplay {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  image: string;
  categoryId: number;
  categoryName: string;
  available: boolean;
  popular: boolean;
  tags: string[];
}

// CartItem (기존)
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
```

### 11.2 컴포넌트 Props 인터페이스
```typescript
// MenuCard.tsx (수정)
interface MenuCardProps {
  item: MenuItemDisplay;
  onClick: () => void; // 상세 페이지 이동
  onAddToCart: (item: MenuItemDisplay) => void; // 담기 버튼 전용
}

// ProductDetail.tsx (신규)
interface ProductDetailProps {
  product: MenuItemDisplay;
  onAddToCart: (product: MenuItemDisplay, quantity: number) => void;
}

// QuantityControl.tsx (신규)
interface QuantityControlProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}
```

---

## 12. 승인 및 검토 (Approvals)

| 역할 | 이름 | 승인 상태 | 날짜 |
|------|------|----------|------|
| Product Owner | - | Pending | - |
| Frontend Lead | - | Pending | - |
| UX Designer | - | Pending | - |
| QA Lead | - | Pending | - |

---

**문서 끝**
