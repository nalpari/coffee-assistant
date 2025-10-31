# PRD: React DOM Click Event 에러 수정

## 📋 문서 정보

- **작성일**: 2025-10-31
- **우선순위**: P0 (Critical)
- **영향 범위**: MenuCard 컴포넌트, CartItem 컴포넌트
- **예상 소요 시간**: 1-2 hours

---

## 🎯 문제 정의 (Problem Statement)

### 현재 상황

**에러 메시지**:
```
Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node':
The node to be removed is not a child of this node.
```

**발생 시점**:
- 화면의 클릭 가능한 요소(카드, 버튼 등)를 클릭할 때
- React DOM이 노드를 제거하려고 할 때 발생

**에러 스택 트레이스**:
- `react-dom-client.production.js:9977`
- React의 내부 DOM 조작 함수들 (l4, l2, l9, l7, ch 등)

### 근본 원인 분석

#### 1️⃣ **이벤트 버블링 문제** ([MenuCard.tsx](src/components/menu/MenuCard.tsx))

**현재 구조**:
```tsx
<Card onClick={onClick}>  {/* 부모 클릭 이벤트 */}
  <CardContent>
    <Button onClick={onAddToCart}>  {/* 자식 클릭 이벤트 */}
      <ShoppingCart />
    </Button>
  </CardContent>
</Card>
```

**문제점**:
1. 버튼 클릭 시 `onAddToCart` 실행
2. 이벤트가 부모 Card로 버블링
3. `onClick` (상세 페이지 이동) 실행
4. **동시에 두 개의 상태 변경 발생** → 장바구니 추가 + 페이지 라우팅
5. React가 DOM 트리를 업데이트하는 도중 라우팅으로 인해 컴포넌트가 언마운트
6. **제거된 노드를 다시 제거하려고 시도** → `NotFoundError`

#### 2️⃣ **이미지 로딩 에러 핸들링** ([MenuCard.tsx:39](src/components/menu/MenuCard.tsx#L39))

**현재 코드**:
```tsx
const [imageError, setImageError] = useState(false);

<Image
  onError={() => setImageError(true)}  // ⚠️ 언마운트 중 setState 호출 가능
/>
```

**문제점**:
- 이미지 로딩 실패 시 `setImageError` 호출
- 컴포넌트가 이미 언마운트된 상태에서 setState 호출 가능
- React 경고 발생 및 메모리 누수 가능성

#### 3️⃣ **CartItem 컴포넌트의 유사 문제** ([CartItem.tsx](src/components/cart/CartItem.tsx))

**현재 코드**:
```tsx
<Image
  src={item.image!}
  alt={item.name}
  fill
  className="object-cover"
  // ❌ onError 핸들러 없음 → 이미지 로딩 실패 시 문제 발생 가능
/>
```

**문제점**:
- 이미지 로딩 실패에 대한 fallback 없음
- 에러 발생 시 빈 공간만 표시

---

## 🎯 목표 (Objectives)

### 비즈니스 목표
- [ ] 사용자 클릭 시 발생하는 모든 에러 제거
- [ ] 안정적인 UI/UX 제공
- [ ] 이미지 로딩 실패에 대한 적절한 fallback

### 기술적 목표
- [ ] 이벤트 버블링으로 인한 충돌 방지
- [ ] 이미지 에러 핸들링 개선
- [ ] 컴포넌트 언마운트 시 메모리 누수 방지

### UX 목표
- [ ] 버튼 클릭 시 의도된 동작만 실행 (상세 페이지 이동 X)
- [ ] 이미지 로딩 실패 시 명확한 fallback UI

---

## 🔧 해결 방안 (Solution)

### Solution 1: MenuCard 이벤트 버블링 방지 (필수)

**문제**:
- 버튼 클릭 시 부모 Card의 onClick도 실행됨

**해결책**:
```tsx
// src/components/menu/MenuCard.tsx

const handleAddToCart = (e: React.MouseEvent) => {
  e.stopPropagation();  // ✅ 이벤트 버블링 차단
  onAddToCart(e);
};

<Card onClick={onClick}>
  <Button onClick={handleAddToCart}>
    <ShoppingCart />
  </Button>
</Card>
```

**효과**:
- 버튼 클릭 시 부모 Card의 onClick 실행 방지
- 장바구니 추가만 실행, 상세 페이지 이동 방지

---

### Solution 2: 이미지 에러 핸들링 개선 (필수)

#### MenuCard 컴포넌트

**현재 문제**:
```tsx
const [imageError, setImageError] = useState(false);

<Image onError={() => setImageError(true)} />
```

**해결책**:
```tsx
// src/components/menu/MenuCard.tsx

const [imageError, setImageError] = useState(false);

const handleImageError = () => {
  // 이미지 로딩 실패 시 상태 변경
  setImageError(true);
};

<Image
  src={item.image!}
  alt={item.name}
  fill
  className="object-cover"
  onError={handleImageError}
  unoptimized={true}  // ✅ Next.js 이미지 최적화 비활성화 (외부 URL 대응)
/>
```

**추가 개선**:
```tsx
// useEffect로 언마운트 시 cleanup
useEffect(() => {
  return () => {
    // 컴포넌트 언마운트 시 이미지 에러 상태 초기화
    setImageError(false);
  };
}, []);
```

#### CartItem 컴포넌트

**현재 문제**:
```tsx
<Image
  src={item.image!}
  alt={item.name}
  fill
  className="object-cover"
  // ❌ onError 핸들러 없음
/>
```

**해결책**:
```tsx
// src/components/cart/CartItem.tsx

const [imageError, setImageError] = useState(false);

<div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
  {item.image !== null && item.image.trim() !== '' && !imageError ? (
    <Image
      src={item.image!}
      alt={item.name}
      fill
      className="object-cover"
      onError={() => setImageError(true)}
      unoptimized={true}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
      <span className="text-2xl">☕</span>
    </div>
  )}
</div>
```

---

### Solution 3: next.config.js 이미지 도메인 설정 (선택적)

**외부 이미지 URL 사용 시**:

```js
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // 모든 도메인 허용 (개발 환경)
      },
    ],
  },
};

export default nextConfig;
```

**또는 특정 도메인만 허용**:
```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-cdn-domain.com',
    },
    {
      protocol: 'https',
      hostname: 'another-allowed-domain.com',
    },
  ],
},
```

---

## 📐 기술 스펙 (Technical Specifications)

### 파일 변경 사항

#### 1. src/components/menu/MenuCard.tsx

**변경 전** (Line 17-28):
```tsx
export function MenuCard({ item, onClick, onAddToCart }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = item.image !== null && item.image.trim() !== '';

  return (
    <Card
      onClick={onClick}
      className={`
        cursor-pointer transition-all hover:shadow-lg
        ${!item.available && 'opacity-50'}
      `}
    >
```

**변경 후**:
```tsx
export function MenuCard({ item, onClick, onAddToCart }: MenuCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = item.image !== null && item.image.trim() !== '';

  // ✅ 이벤트 버블링 방지
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(e);
  };

  // ✅ 이미지 에러 핸들링
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      onClick={onClick}
      className={`
        cursor-pointer transition-all hover:shadow-lg
        ${!item.available && 'opacity-50'}
      `}
    >
```

**변경 전** (Line 32-40):
```tsx
{hasValidImage && !imageError ? (
  <Image
    src={item.image!}
    alt={item.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    onError={() => setImageError(true)}
  />
```

**변경 후**:
```tsx
{hasValidImage && !imageError ? (
  <Image
    src={item.image!}
    alt={item.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    onError={handleImageError}
    unoptimized={true}
    priority={false}
  />
```

**변경 전** (Line 60-63):
```tsx
<Button
  size="icon"
  onClick={onAddToCart}
  className="absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
```

**변경 후**:
```tsx
<Button
  size="icon"
  onClick={handleAddToCart}  // ✅ 변경됨
  className="absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
```

---

#### 2. src/components/cart/CartItem.tsx

**변경 전** (Line 15-34):
```tsx
export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const displayPrice = item.discountPrice ?? item.price;
  const hasDiscount = item.discountPrice !== null && item.discountPrice !== undefined;

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {/* 이미지 */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {item.image !== null && item.image.trim() !== '' ? (
          <Image
            src={item.image!}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-xs">No Image</span>
          </div>
        )}
      </div>
```

**변경 후**:
```tsx
export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [imageError, setImageError] = useState(false);  // ✅ 추가
  const displayPrice = item.discountPrice ?? item.price;
  const hasDiscount = item.discountPrice !== null && item.discountPrice !== undefined;

  // ✅ 이미지 에러 핸들링
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {/* 이미지 */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {item.image !== null && item.image.trim() !== '' && !imageError ? (
          <Image
            src={item.image!}
            alt={item.name}
            fill
            className="object-cover"
            onError={handleImageError}  // ✅ 추가
            unoptimized={true}  // ✅ 추가
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-2xl">☕</span>  {/* ✅ 변경: 더 명확한 fallback */}
          </div>
        )}
      </div>
```

**useState import 추가** (Line 1):
```tsx
import { useState } from 'react';  // ✅ 추가
```

---

## 🚀 구현 단계 (Implementation Steps)

### Step 1: MenuCard.tsx 수정 (30분)

1. **이벤트 핸들러 추가**
   ```tsx
   const handleAddToCart = (e: React.MouseEvent) => {
     e.stopPropagation();
     onAddToCart(e);
   };

   const handleImageError = () => {
     setImageError(true);
   };
   ```

2. **Button onClick 수정**
   ```tsx
   <Button onClick={handleAddToCart}>
   ```

3. **Image 속성 수정**
   ```tsx
   <Image
     onError={handleImageError}
     unoptimized={true}
   />
   ```

**검증**:
```bash
pnpm tsc --noEmit
pnpm lint
```

---

### Step 2: CartItem.tsx 수정 (20분)

1. **useState import 추가**
   ```tsx
   import { useState } from 'react';
   ```

2. **imageError 상태 추가**
   ```tsx
   const [imageError, setImageError] = useState(false);
   ```

3. **이미지 에러 핸들러 추가**
   ```tsx
   const handleImageError = () => {
     setImageError(true);
   };
   ```

4. **Image 조건부 렌더링 수정**
   ```tsx
   {item.image !== null && item.image.trim() !== '' && !imageError ? (
     <Image
       onError={handleImageError}
       unoptimized={true}
     />
   ) : (
     <div>☕</div>
   )}
   ```

**검증**:
```bash
pnpm tsc --noEmit
pnpm lint
```

---

### Step 3: 로컬 테스트 (30분)

```bash
pnpm dev
```

**브라우저 테스트**:

```
✅ TC-001: MenuCard 클릭
  Given: 메인 페이지 접속
  When: 메뉴 카드 클릭
  Then:
    - 상세 페이지로 이동
    - 에러 없음

✅ TC-002: 장바구니 버튼 클릭
  Given: 메인 페이지
  When: 메뉴 카드의 장바구니 버튼 클릭
  Then:
    - 장바구니에 아이템 추가
    - 상세 페이지로 이동하지 않음 ✅
    - 에러 없음 ✅

✅ TC-003: 이미지 로딩 실패
  Given: 잘못된 이미지 URL
  When: 메뉴 카드 렌더링
  Then:
    - fallback UI (☕ 이미지 준비중) 표시
    - 에러 없음

✅ TC-004: CartItem 이미지 로딩 실패
  Given: 장바구니에 잘못된 이미지 URL 아이템
  When: CartSheet 열기
  Then:
    - fallback UI (☕) 표시
    - 에러 없음

✅ TC-005: 연속 클릭
  Given: 메인 페이지
  When: 버튼 여러 번 빠르게 클릭
  Then:
    - DOM 에러 없음
    - 의도된 동작만 실행
```

---

### Step 4: 브라우저 콘솔 확인 (10분)

**확인 사항**:
- [ ] `NotFoundError` 사라짐
- [ ] React 경고 메시지 없음
- [ ] 이미지 로딩 에러 핸들링 정상 작동

---

### Step 5: 커밋 (5분)

```bash
git add src/components/menu/MenuCard.tsx src/components/cart/CartItem.tsx
git commit -m "fix: React DOM removeChild 에러 수정

- MenuCard: 이벤트 버블링 방지 (stopPropagation)
- MenuCard: 이미지 에러 핸들링 개선
- CartItem: 이미지 로딩 실패 fallback 추가
- Image 컴포넌트에 unoptimized 속성 추가

Fixes: NotFoundError - Failed to execute 'removeChild' on 'Node'
"
```

---

## ✅ 완료 기준 (Definition of Done)

### 필수 요구사항
- [ ] `NotFoundError` 에러 완전히 제거
- [ ] 장바구니 버튼 클릭 시 상세 페이지로 이동하지 않음
- [ ] 이미지 로딩 실패 시 적절한 fallback UI 표시
- [ ] TypeScript 컴파일 에러 없음

### 코드 품질
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 이벤트 핸들러 명확한 네이밍

### UX 품질
- [ ] 버튼 클릭 시 의도된 동작만 실행
- [ ] 이미지 fallback UI 명확함
- [ ] 연속 클릭 시에도 에러 없음

### 성능
- [ ] 불필요한 리렌더링 없음
- [ ] 메모리 누수 없음

---

## 🧪 테스트 계획 (Test Plan)

### 수동 테스트 시나리오

#### 시나리오 1: 기본 클릭 동작
```
Given: 메인 페이지 접속
When: 메뉴 카드의 빈 공간 클릭
Then:
  1. 상세 페이지로 이동
  2. 에러 없음
```

#### 시나리오 2: 장바구니 버튼 클릭
```
Given: 메인 페이지
When: 메뉴 카드의 장바구니 버튼 클릭
Then:
  1. 장바구니에 아이템 추가
  2. 상세 페이지로 이동하지 않음
  3. 브라우저 콘솔에 에러 없음
```

#### 시나리오 3: 이미지 로딩 실패
```
Given: 잘못된 이미지 URL이 포함된 메뉴
When: 메뉴 카드 렌더링
Then:
  1. "이미지 준비중" fallback UI 표시
  2. 에러 없음
```

#### 시나리오 4: CartItem 이미지 로딩 실패
```
Given: 장바구니에 잘못된 이미지 URL 아이템
When: CartSheet 열기
Then:
  1. ☕ fallback UI 표시
  2. 에러 없음
```

#### 시나리오 5: 연속 클릭 스트레스 테스트
```
Given: 메인 페이지
When: 장바구니 버튼 10번 빠르게 연속 클릭
Then:
  1. DOM 에러 없음
  2. 장바구니에 10개 아이템 추가
  3. 상세 페이지로 이동하지 않음
```

---

## 📊 성공 지표 (Success Metrics)

### 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| `NotFoundError` 발생 빈도 | 클릭 시 100% | 0% | 브라우저 콘솔 |
| 이미지 로딩 실패 처리 | 빈 공간 | fallback UI | 시각적 검증 |
| 이벤트 버블링 발생 | 100% | 0% | 동작 검증 |

### 정성적 지표

- ✅ **안정성**: 클릭 시 에러 없음
- ✅ **명확성**: 버튼 클릭 시 의도된 동작만 실행
- ✅ **견고성**: 이미지 로딩 실패에도 안정적 UI

---

## 🚨 위험 요소 및 대응 (Risks & Mitigation)

### 위험 요소 1: stopPropagation으로 인한 의도치 않은 동작 차단

**위험**:
- 다른 이벤트 리스너가 이벤트를 받지 못할 수 있음
- 분석 도구 (Google Analytics 등) 클릭 추적 실패

**대응책**:
1. **최소 범위 적용**: 장바구니 버튼에만 stopPropagation 적용
2. **분석 도구 테스트**: GA, Mixpanel 등 이벤트 추적 정상 작동 확인
3. **대안**: 필요 시 커스텀 이벤트 발송

### 위험 요소 2: unoptimized 속성으로 인한 성능 저하

**위험**:
- Next.js 이미지 최적화 비활성화
- 이미지 로딩 속도 저하 가능성

**대응책**:
1. **CDN 사용**: 외부 이미지는 CDN을 통해 제공
2. **이미지 크기 최적화**: 서버에서 적절한 크기로 제공
3. **모니터링**: Core Web Vitals (LCP, CLS) 모니터링
4. **대안**: `next.config.js`에서 `remotePatterns` 설정 후 최적화 활성화

### 위험 요소 3: 이미지 에러 상태 관리

**위험**:
- 컴포넌트가 빠르게 언마운트/마운트되는 경우 메모리 누수

**대응책**:
1. **useEffect cleanup**: 언마운트 시 상태 초기화
2. **React DevTools Profiler**: 메모리 누수 모니터링
3. **대안**: `useRef`를 사용한 마운트 상태 추적

---

## 📚 참고 자료 (References)

### React 이벤트 처리
- [React - Handling Events](https://react.dev/learn/responding-to-events)
- [Event Bubbling and Capturing](https://javascript.info/bubbling-and-capturing)
- [stopPropagation() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)

### Next.js Image 최적화
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Remote Patterns Configuration](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)

### React DOM 에러
- [React - Common Errors](https://react.dev/learn/troubleshooting)
- [Understanding React's reconciliation](https://react.dev/learn/preserving-and-resetting-state)

### 내부 문서
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - 프로젝트 구현 가이드
- [REQUIREMENTS.md](REQUIREMENTS.md) - 요구사항 문서

---

## 🔄 변경 이력 (Changelog)

### 2025-10-31 - 초안 작성
- **작성자**: Claude Code
- **문제**: 클릭 시 `NotFoundError: Failed to execute 'removeChild'` 발생
- **근본 원인**: 이벤트 버블링으로 인한 동시 상태 변경 + 이미지 에러 핸들링 부재
- **해결 방안**:
  1. MenuCard: `stopPropagation()` 적용
  2. MenuCard/CartItem: 이미지 에러 핸들링 추가
  3. Image 컴포넌트: `unoptimized` 속성 추가
- **예상 소요**: 1-2시간

---

## 🎓 학습 내용 (Lessons Learned)

### React 이벤트 처리 원칙
1. **이벤트 버블링 이해**: 자식 요소의 이벤트가 부모로 전파됨
2. **stopPropagation 사용**: 불필요한 부모 이벤트 실행 차단
3. **DOM 조작 타이밍**: React가 DOM을 업데이트하는 도중 외부 변경 금지

### Next.js Image 최적화
1. **외부 이미지 URL**: `remotePatterns` 설정 또는 `unoptimized` 사용
2. **에러 핸들링**: `onError` 핸들러로 fallback UI 제공
3. **성능 고려**: CDN + 적절한 이미지 크기 제공

### 컴포넌트 설계
1. **단일 책임**: 버튼은 하나의 동작만 실행
2. **명확한 경계**: 클릭 영역과 이벤트 핸들러 명확히 분리
3. **견고성**: 외부 리소스 (이미지) 로딩 실패에 대비

---

## 🏁 최종 정리

### 핵심 요약
- **문제**: 클릭 시 React DOM `NotFoundError` 발생
- **원인**: 이벤트 버블링 + 동시 상태 변경 + 이미지 에러 미처리
- **해결**:
  1. `stopPropagation()` 적용
  2. 이미지 에러 핸들링 추가
  3. `unoptimized` 속성 추가
- **예상 소요**: 1-2시간
- **위험도**: P0 (Critical)

### 다음 단계
1. ✅ PRD 검토 및 승인
2. ⏳ MenuCard.tsx 수정
3. ⏳ CartItem.tsx 수정
4. ⏳ 로컬 테스트 (브라우저 콘솔 확인)
5. ⏳ 커밋 및 배포

**성공을 기원합니다! 🚀**
