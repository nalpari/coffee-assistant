# PRD: CartItem 및 추가 Image URL 에러 완전 해결

## 1. 개요

### 1.1 문서 정보
- **작성일**: 2025-10-31
- **버전**: 2.0.0 (기존 PRD-Product-Image-Error-Fix.md의 확장판)
- **작성자**: Development Team
- **상태**: Ready for Implementation
- **관련 PRD**: [PRD-Product-Image-Error-Fix.md](PRD-Product-Image-Error-Fix.md)

### 1.2 문제 요약
이전 수정(ProductDetailPage, MenuCard)에도 불구하고 다음 상황에서 여전히 에러가 발생합니다:

1. **상품 상세 페이지에서 스크롤**
2. **상품 상세 페이지에서 뒤로가기 버튼 클릭**

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

## 2. 근본 원인 재분석

### 2.1 기존 수정 사항 검토

#### 이미 수정된 컴포넌트
1. ✅ **ProductDetailPage** ([src/app/products/[id]/page.tsx:66,93](src/app/products/[id]/page.tsx))
   - `hasValidImage = product.image !== null && product.image.trim() !== ''`
   - Image 컴포넌트에 non-null assertion 적용

2. ✅ **MenuCard** ([src/components/menu/MenuCard.tsx:19,34](src/components/menu/MenuCard.tsx))
   - 동일한 null-safe 패턴 적용
   - 메뉴 목록 렌더링 시 정상 작동

3. ✅ **API 레벨** ([src/lib/api/menu.ts:304](src/lib/api/menu.ts))
   - `imageUrl = null` 반환 (빈 문자열 대신)

4. ✅ **타입 정의** ([src/types/menu.ts:219](src/types/menu.ts))
   - `image: string | null`

### 2.2 새로 발견된 문제: CartItem 컴포넌트

**위치**: [src/components/cart/CartItem.tsx:23-29](src/components/cart/CartItem.tsx#L23)

```typescript
{item.image ? (  // ❌ 문제: null 체크가 불완전
  <Image
    src={item.image}
    alt={item.name}
    fill
    className="object-cover"
  />
) : (
  <div>No Image</div>
)}
```

**문제점**:
1. `item.image`가 `null`일 때는 fallback이 작동하지만
2. `item.image`가 **빈 문자열** `''`일 경우 truthy로 평가
3. Image 컴포넌트가 `src=""`로 렌더링 시도
4. Next.js가 빈 문자열로 URL 생성 시도 → 에러 발생

### 2.3 에러 발생 시나리오

#### 시나리오 1: 장바구니에 이미지 없는 상품 추가
1. 사용자가 이미지 없는 상품을 장바구니에 추가
2. CartSheet 열 때 CartItem 컴포넌트 렌더링
3. `item.image`가 빈 문자열이면 Image 컴포넌트 렌더링
4. **에러 발생**

#### 시나리오 2: 상세 페이지에서 뒤로가기
1. 상품 상세 페이지 → 장바구니 추가
2. 뒤로가기 버튼 클릭 → 홈 페이지로 이동
3. 홈 페이지 로딩 중 CartSheet가 열려 있음
4. CartItem 렌더링 시 **에러 발생**

#### 시나리오 3: 스크롤 시
1. 장바구니에 여러 상품 존재
2. 스크롤하면서 CartItem들이 lazy loading
3. 이미지 없는 상품의 CartItem 렌더링 시도
4. Next.js Image lazy loading이 URL 검증 → **에러 발생**

### 2.4 영향 범위

- **직접 영향**: CartItem, CartSheet
- **간접 영향**:
  - 홈 페이지 (뒤로가기 시)
  - 상품 상세 페이지 (장바구니 열 때)
  - 결제 페이지 (장바구니 아이템 표시)
- **사용자 경험**:
  - 장바구니 사용 불가
  - 콘솔 에러 누적
  - 잠재적 렌더링 중단

## 3. 해결 방안

### 3.1 우선순위 및 전략

#### 해결 우선순위
1. **P0 (Critical)**: CartItem 컴포넌트 null-safe 수정
2. **P1 (High)**: 브라우저 캐시 초기화 가이드
3. **P2 (Medium)**: React Query 캐시 관리
4. **P3 (Low)**: 추가 테스트 케이스

#### 구현 전략
- **Immediate Fix**: CartItem null-safe 패턴 적용
- **Complete Coverage**: 모든 Image 사용처 검증 완료
- **Cache Management**: 캐시 문제 해결 가이드 제공

### 3.2 Solution 1: CartItem null-safe 수정 (P0)

#### 3.2.1 목표
- ProductDetailPage, MenuCard와 동일한 null-safe 패턴 적용
- `image: null` 및 빈 문자열 모두 처리

#### 3.2.2 구현 내용

**파일**: `src/components/cart/CartItem.tsx`

**수정 전**:
```typescript
{item.image ? (
  <Image src={item.image} alt={item.name} fill className="object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
    <span className="text-xs">No Image</span>
  </div>
)}
```

**수정 후**:
```typescript
{item.image !== null && item.image.trim() !== '' ? (
  <Image src={item.image!} alt={item.name} fill className="object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
    <span className="text-xs">No Image</span>
  </div>
)}
```

#### 3.2.3 개선 사항
- `item.image !== null` 명시적 null 체크
- `item.image.trim() !== ''` 빈 문자열 체크
- `item.image!` non-null assertion으로 TypeScript 안전성 보장

### 3.3 Solution 2: 브라우저 캐시 초기화 (P1)

#### 3.3.1 목표
- 이전 빌드의 캐시된 코드 제거
- 최신 수정사항 적용 보장

#### 3.3.2 사용자 가이드

**개발 환경**:
1. **Hard Refresh**: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
2. **캐시 삭제 후 새로고침**:
   - Chrome DevTools → Network 탭 → "Disable cache" 체크
   - 또는 Application 탭 → Clear storage
3. **개발 서버 재시작**:
   ```bash
   pnpm dev
   ```

**프로덕션 환경**:
1. **Next.js 빌드 재실행**:
   ```bash
   rm -rf .next
   pnpm build
   ```
2. **브라우저 캐시 강제 갱신**: Hard refresh

### 3.4 Solution 3: React Query 캐시 관리 (P2)

#### 3.4.1 목표
- 이전 데이터 캐시로 인한 에러 방지
- 타입 변경 반영 보장

#### 3.4.2 개발자 가이드

**로컬 스토리지 초기화**:
```typescript
// DevTools Console에서 실행
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**React Query DevTools 사용**:
```typescript
// src/app/layout.tsx 또는 providers.tsx에 추가 (개발 모드만)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// QueryClientProvider 내부에 추가
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

**캐시 무효화**:
```typescript
// 필요 시 수동으로 캐시 무효화
queryClient.invalidateQueries({ queryKey: ['product'] });
queryClient.invalidateQueries({ queryKey: ['menu'] });
```

### 3.5 Solution 4: 추가 테스트 케이스 (P3)

#### 3.5.1 CartItem Component Test

**파일**: `__tests__/components/cart/CartItem.test.tsx` (신규 생성)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartItem } from '@/components/cart/CartItem';
import type { CartItem as CartItemType } from '@/types/cart';

describe('CartItem', () => {
  const mockOnUpdateQuantity = vi.fn();
  const mockOnRemove = vi.fn();

  it('should show fallback when image is null', () => {
    const mockItem: CartItemType = {
      id: 1,
      name: 'Test Product',
      description: 'Test',
      price: 5000,
      discountPrice: undefined,
      image: null, // ✅ null 테스트
      images: [],
      category: 'COFFEE',
      categoryId: 1,
      tags: [],
      available: true,
      popular: false,
      cold: true,
      hot: false,
      orderNo: 1,
      quantity: 1,
    };

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('No Image')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should show fallback when image is empty string', () => {
    const mockItem: CartItemType = {
      id: 1,
      name: 'Test Product',
      image: '', // ✅ 빈 문자열 테스트
      // ... other fields
    };

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('should render image when valid URL exists', () => {
    const mockItem: CartItemType = {
      id: 1,
      name: 'Product with Image',
      image: 'http://3.35.189.180/minio/images/menu/test.jpg',
      // ... other fields
    };

    render(
      <CartItem
        item={mockItem}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    const img = screen.getByAltText('Product with Image');
    expect(img).toBeInTheDocument();
  });
});
```

#### 3.5.2 Integration Test: CartSheet with CartItem

**파일**: `__tests__/components/cart/CartSheet.test.tsx` (신규 생성)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartSheet } from '@/components/cart/CartSheet';

vi.mock('@/store/cart-store', () => ({
  useCartStore: vi.fn(() => ({
    items: [
      {
        id: 1,
        name: 'Product without Image',
        image: null, // ✅ null 이미지
        price: 5000,
        quantity: 1,
        // ... other fields
      },
    ],
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getTotalPrice: () => 5000,
  })),
}));

describe('CartSheet with null image items', () => {
  it('should not throw URL error when rendering items with null images', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<CartSheet open={true} onOpenChange={() => {}} />);

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Failed to construct \'URL\'')
    );

    consoleErrorSpy.mockRestore();
  });
});
```

## 4. 구현 계획

### 4.1 Phase 1: 긴급 수정 (P0)
**목표**: CartItem 에러 즉시 해결

#### Task 1.1: CartItem 수정
- **담당**: Frontend Developer
- **예상 시간**: 15분
- **파일**: `src/components/cart/CartItem.tsx`
- **작업**:
  1. 23번 라인 조건부 렌더링 로직 수정
  2. null-safe 패턴 적용
  3. TypeScript 컴파일 확인

#### Task 1.2: 즉시 검증
- **담당**: QA / Developer
- **예상 시간**: 15분
- **작업**:
  1. 개발 서버 재시작
  2. 장바구니에 이미지 없는 상품 추가
  3. 스크롤, 뒤로가기 테스트
  4. 콘솔 에러 확인

**Total Time**: 30분

### 4.2 Phase 2: 캐시 초기화 (P1)
**목표**: 기존 사용자 환경 정상화

#### Task 2.1: 개발 환경 캐시 초기화
- **담당**: Developer
- **예상 시간**: 10분
- **작업**:
  1. `.next` 디렉토리 삭제
  2. 브라우저 캐시 삭제
  3. 개발 서버 재시작
  4. Hard refresh

#### Task 2.2: 사용자 가이드 문서화
- **담당**: Developer / Tech Writer
- **예상 시간**: 20분
- **작업**:
  1. 캐시 초기화 가이드 작성
  2. 문제 해결 FAQ 추가
  3. README 업데이트

**Total Time**: 30분

### 4.3 Phase 3: 테스트 추가 (P2-P3)
**목표**: 회귀 방지 및 품질 보증

#### Task 3.1: CartItem Unit Test
- **담당**: Developer
- **예상 시간**: 1시간
- **파일**: `__tests__/components/cart/CartItem.test.tsx`
- **작업**:
  1. null 이미지 테스트
  2. 빈 문자열 테스트
  3. 유효한 이미지 테스트

#### Task 3.2: CartSheet Integration Test
- **담당**: Developer
- **예상 시간**: 1시간
- **파일**: `__tests__/components/cart/CartSheet.test.tsx`
- **작업**:
  1. null 이미지 아이템 렌더링 테스트
  2. 에러 미발생 검증

**Total Time**: 2시간

### 4.4 Phase 4: 최종 검증 및 배포
**목표**: 완전한 에러 해결 확인

#### Task 4.1: 통합 QA
- **담당**: QA Team
- **예상 시간**: 1시간
- **작업**:
  1. 전체 시나리오 테스트
  2. 크로스 브라우저 테스트
  3. 모바일 디바이스 테스트

#### Task 4.2: 배포
- **담당**: DevOps / Developer
- **예상 시간**: 30분
- **작업**:
  1. PR 생성 및 코드 리뷰
  2. CI/CD 파이프라인 통과 확인
  3. 프로덕션 배포

**Total Time**: 1.5시간

### 4.5 전체 일정
- **Phase 1 (긴급)**: 30분 → 즉시 진행
- **Phase 2 (캐시)**: 30분 → Phase 1 완료 후
- **Phase 3 (테스트)**: 2시간 → Phase 2와 병행 가능
- **Phase 4 (배포)**: 1.5시간 → 모든 Phase 완료 후

**총 예상 시간**: 4.5시간 (반나절 이내 완료 가능)

## 5. 검증 기준 (Acceptance Criteria)

### 5.1 기능 검증
- [ ] 장바구니에 이미지 없는 상품 추가 시 에러 없음
- [ ] CartItem에서 "No Image" fallback이 정상 표시됨
- [ ] 상세 페이지에서 뒤로가기 시 에러 없음
- [ ] 장바구니 스크롤 시 에러 없음
- [ ] 모든 Image 컴포넌트가 null-safe 패턴 적용됨

### 5.2 기술 검증
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 없음
- [ ] 콘솔 에러 없음
- [ ] Next.js 빌드 성공

### 5.3 성능 검증
- [ ] 이미지 lazy loading 정상 작동
- [ ] CartSheet 열기/닫기 성능 저하 없음
- [ ] 메모리 누수 없음

### 5.4 테스트 검증
- [ ] CartItem unit test 통과
- [ ] CartSheet integration test 통과
- [ ] 기존 모든 테스트 통과

## 6. 위험 관리

### 6.1 잠재적 위험

#### 위험 1: 캐시 문제로 에러 지속
- **가능성**: Medium
- **영향도**: Low
- **대응 방안**:
  - Hard refresh 가이드 제공
  - 브라우저 캐시 삭제 스크립트 제공
  - React Query 캐시 무효화

#### 위험 2: 다른 컴포넌트에서 유사 에러
- **가능성**: Low (전체 검증 완료)
- **영향도**: Low
- **대응 방안**:
  - 모든 Image 사용처 검증 완료
  - 일관된 패턴 적용

#### 위험 3: 타입 변경으로 인한 호환성 문제
- **가능성**: Very Low (이미 적용됨)
- **영향도**: Low
- **대응 방안**:
  - 기존 수정사항 재확인
  - TypeScript strict mode 활용

### 6.2 롤백 계획
- Git을 통한 즉시 롤백 가능
- 단일 파일 수정으로 롤백 리스크 최소
- 테스트 커버리지로 안전성 확보

## 7. 성공 지표

### 7.1 정량적 지표
- **에러 발생률**: 0% (현재: 스크롤/뒤로가기 시 100%)
- **콘솔 에러 수**: 0개
- **장바구니 사용 성공률**: 100%
- **테스트 커버리지**: CartItem 100%

### 7.2 정성적 지표
- 사용자 경험: 장바구니 정상 작동
- 개발자 경험: 일관된 null-safe 패턴
- 유지보수성: 모든 컴포넌트 동일 패턴 적용

## 8. 참고 자료

### 8.1 관련 파일
- `src/components/cart/CartItem.tsx` - **수정 대상**
- `src/components/cart/CartSheet.tsx` - CartItem 사용처
- `src/app/products/[id]/page.tsx` - 이미 수정됨
- `src/components/menu/MenuCard.tsx` - 이미 수정됨
- `src/lib/api/menu.ts` - 이미 수정됨
- `src/types/menu.ts` - 이미 수정됨

### 8.2 기존 PRD
- [PRD-Product-Image-Error-Fix.md](PRD-Product-Image-Error-Fix.md) - Phase 1 수정 내용

### 8.3 검증된 패턴
```typescript
// ✅ 올바른 패턴
const hasValidImage = item.image !== null && item.image.trim() !== '';

{hasValidImage ? (
  <Image src={item.image!} alt="..." />
) : (
  <div>Fallback UI</div>
)}
```

## 9. 체크리스트

### Phase 1 체크리스트 (긴급)
- [ ] `src/components/cart/CartItem.tsx` 수정
- [ ] 로컬 테스트 완료
- [ ] 장바구니 시나리오 검증
- [ ] 스크롤/뒤로가기 에러 재현 안 됨

### Phase 2 체크리스트 (캐시)
- [ ] `.next` 디렉토리 삭제
- [ ] 브라우저 캐시 초기화
- [ ] 개발 서버 재시작
- [ ] Hard refresh 테스트

### Phase 3 체크리스트 (테스트)
- [ ] CartItem unit test 작성
- [ ] CartSheet integration test 작성
- [ ] 모든 테스트 통과

### Phase 4 체크리스트 (배포)
- [ ] QA 완료
- [ ] PR 생성 및 리뷰
- [ ] CI/CD 통과
- [ ] 프로덕션 배포
- [ ] 배포 후 모니터링

---

**문서 버전**: 2.0.0
**최종 수정일**: 2025-10-31
**다음 리뷰일**: 구현 완료 후
