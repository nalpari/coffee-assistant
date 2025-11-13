# 매장별 메뉴 기반 주문 프로세스 개선 플랜

## 📋 목표
AI 추천 화면에서 메뉴명으로만 주문 명령이 들어올 때, `store_menu` 테이블을 기준으로 주문 프로세스를 수행하도록 개선

## 🎯 요구사항
정확한 매장 없이 메뉴명으로만 주문 명령이 들어오면:
1. **옵션 1**: 주문 내역에서 같은 메뉴 주문 중 가장 최근 주문과 같게 주문
2. **옵션 2**: `store_menu`에 주문 메뉴가 있는 매장 중 가장 가까운 매장에서 주문
3. 사용자가 두 옵션 중 선택할 수 있도록 가이드 제공

---

## 📐 현재 구조 분석

### 1. 현재 주문 프로세스
- **파일**: `src/app/api/chat/route.ts`
- **로직**: `menu` 테이블만 사용하여 메뉴 검색
- **문제점**: `store_menu` 테이블을 사용하지 않음, 매장 정보 없이 주문 가능

### 2. 관련 파일
- `src/lib/shopping-agent.ts`: AI 응답 생성 및 제품 검색
- `src/app/actions/order.ts`: 주문 생성 로직
- `src/lib/api/menu.ts`: 메뉴 조회 API
- `src/app/api/chat/route.ts`: AI 채팅 API 엔드포인트

---

## 🔧 구현 플랜

### Phase 1: 유틸리티 함수 생성

#### 1.1 메뉴명으로 최근 주문 찾기 함수
**파일**: `src/lib/order-utils.ts` (신규 생성)

```typescript
/**
 * 메뉴명으로 사용자의 가장 최근 주문 찾기
 * @param userId - 사용자 ID
 * @param menuName - 메뉴명 (예: "아메리카노", "카페라떼")
 * @returns 가장 최근 주문 정보 (매장 ID, 메뉴 ID 포함)
 */
export async function findRecentOrderByMenuName(
  userId: string,
  menuName: string
): Promise<{
  storeId: number;
  menuId: number;
  orderNumber: string;
  orderDate: Date;
} | null>
```

**로직**:
1. 사용자의 주문 내역 조회 (`getUserOrders`)
2. `order_items`에서 메뉴명이 일치하는 주문 찾기
3. 가장 최근 주문 반환 (매장 ID, 메뉴 ID 포함)

#### 1.2 메뉴명으로 매장 검색 함수
**파일**: `src/lib/store-menu-utils.ts` (신규 생성)

```typescript
/**
 * 메뉴명으로 해당 메뉴를 판매하는 매장 목록 조회
 * @param menuName - 메뉴명
 * @param userLat - 사용자 위도 (선택적)
 * @param userLon - 사용자 경도 (선택적)
 * @returns 매장 목록 (거리순 정렬, 위치 정보가 있으면)
 */
export async function findStoresByMenuName(
  menuName: string,
  userLat?: number,
  userLon?: number
): Promise<Array<{
  storeId: number;
  storeName: string;
  menuId: number;
  menuName: string;
  distance?: number; // km 단위
  address: string | null;
}>>
```

**로직**:
1. `menu` 테이블에서 메뉴명으로 검색 (LIKE 검색)
2. 찾은 메뉴 ID로 `store_menu` 테이블 조회
3. `is_available = true`인 매장만 필터링
4. 위치 정보가 있으면 거리 계산하여 정렬
5. 위치 정보가 없으면 매장 ID 순으로 정렬

#### 1.3 메뉴명으로 메뉴 검색 함수 (개선)
**파일**: `src/lib/menu-search-utils.ts` (신규 생성)

```typescript
/**
 * 메뉴명으로 메뉴 검색 (store_menu 기준)
 * @param menuName - 메뉴명
 * @returns 메뉴 정보 목록
 */
export async function searchMenuByName(menuName: string): Promise<Array<{
  menuId: number;
  menuName: string;
  price: number;
  hot: boolean;
  cold: boolean;
}>>
```

---

### Phase 2: AI 응답 로직 개선

#### 2.1 ShoppingAgent 개선
**파일**: `src/lib/shopping-agent.ts`

**변경 사항**:
1. 메뉴명 추출 로직 추가
2. 매장 정보 없이 메뉴명만 언급된 경우 감지
3. 새로운 액션 타입 추가: `'select_store'` (매장 선택 필요)

**새로운 액션 타입**:
```typescript
type AIAction = 
  | 'recommend'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout'
  | 'get_orders'
  | 'get_order_status'
  | 'select_store' // 신규: 매장 선택 필요
  | 'chat'
```

#### 2.2 AI 프롬프트 업데이트
**파일**: `src/lib/claude-client.ts`

**변경 사항**:
- `SHOPPING_ASSISTANT_PROMPT`에 매장 선택 로직 추가
- 메뉴명만 언급된 경우 두 가지 옵션 제시하도록 가이드

---

### Phase 3: API 엔드포인트 개선

#### 3.1 Chat API 개선
**파일**: `src/app/api/chat/route.ts`

**변경 사항**:
1. `aiResponse.action === 'select_store'` 처리 추가
2. 메뉴명 추출 및 매장 검색 로직 추가
3. 옵션 1, 옵션 2 데이터 준비

**새로운 응답 형식**:
```typescript
interface StoreSelectionResponse {
  action: 'select_store';
  message: string;
  menuName: string;
  options: {
    option1: {
      type: 'recent_order';
      storeId: number;
      storeName: string;
      menuId: number;
      orderNumber: string;
      orderDate: Date;
    } | null;
    option2: {
      type: 'nearest_store';
      stores: Array<{
        storeId: number;
        storeName: string;
        menuId: number;
        distance?: number;
        address: string | null;
      }>;
    };
  };
}
```

---

### Phase 4: 프론트엔드 UI 개선

#### 4.1 매장 선택 컴포넌트 생성
**파일**: `src/components/ai/StoreSelectionCard.tsx` (신규 생성)

**기능**:
- 옵션 1: 최근 주문과 같게 주문 버튼
- 옵션 2: 가장 가까운 매장 목록 표시 및 선택 버튼
- 각 옵션에 대한 상세 정보 표시

**UI 구성**:
```
┌─────────────────────────────────────┐
│ [메뉴명] 주문을 위해 매장을 선택해주세요 │
├─────────────────────────────────────┤
│ 옵션 1: 최근 주문과 같게 주문         │
│   매장: [매장명]                      │
│   주문번호: [주문번호]                 │
│   날짜: [주문 날짜]                    │
│   [선택하기 버튼]                      │
├─────────────────────────────────────┤
│ 옵션 2: 가까운 매장에서 주문          │
│   • [매장1] (0.5km) [선택]            │
│   • [매장2] (1.2km) [선택]            │
│   • [매장3] (2.1km) [선택]            │
└─────────────────────────────────────┘
```

#### 4.2 AI 추천 페이지 업데이트
**파일**: `src/app/ai-recommendations/page.tsx`

**변경 사항**:
1. `select_store` 액션 처리 추가
2. `StoreSelectionCard` 컴포넌트 렌더링
3. 사용자 선택 후 장바구니 추가 및 주문 진행

---

### Phase 5: 주문 생성 로직 개선

#### 5.1 주문 생성 시 store_menu 검증
**파일**: `src/app/actions/order.ts`

**변경 사항**:
1. `createOrder` 함수에 `storeId` 필수화 (옵션 1, 2에서 선택된 경우)
2. `store_menu` 테이블에서 메뉴 존재 여부 검증
3. `is_available = true` 확인

**검증 로직**:
```typescript
// store_menu에서 메뉴 존재 및 판매 가능 여부 확인
const { data: storeMenu } = await supabase
  .from('store_menu')
  .select('id, is_available')
  .eq('store_id', request.storeId)
  .eq('menu_id', item.menuId)
  .single();

if (!storeMenu || !storeMenu.is_available) {
  return { 
    success: false, 
    error: `해당 매장에서 ${item.menuName}을(를) 판매하지 않습니다.` 
  };
}
```

---

## 📝 구현 순서

### Step 1: 유틸리티 함수 구현
1. `src/lib/order-utils.ts` 생성
   - `findRecentOrderByMenuName` 함수 구현
2. `src/lib/store-menu-utils.ts` 생성
   - `findStoresByMenuName` 함수 구현
3. `src/lib/menu-search-utils.ts` 생성
   - `searchMenuByName` 함수 구현

### Step 2: 타입 정의 추가
1. `src/types/shopping-agent.ts` 업데이트
   - `StoreSelectionResponse` 타입 추가
   - `AIAction` 타입에 `'select_store'` 추가

### Step 3: ShoppingAgent 개선
1. `src/lib/shopping-agent.ts` 수정
   - 메뉴명 추출 로직 추가
   - 매장 선택 필요 감지 로직 추가

### Step 4: AI 프롬프트 업데이트
1. `src/lib/claude-client.ts` 수정
   - `SHOPPING_ASSISTANT_PROMPT`에 매장 선택 가이드 추가

### Step 5: Chat API 개선
1. `src/app/api/chat/route.ts` 수정
   - `select_store` 액션 처리 추가
   - 옵션 1, 옵션 2 데이터 준비 로직 추가

### Step 6: 프론트엔드 컴포넌트 생성
1. `src/components/ai/StoreSelectionCard.tsx` 생성
2. `src/app/ai-recommendations/page.tsx` 수정
   - `select_store` 액션 처리 추가

### Step 7: 주문 생성 로직 개선
1. `src/app/actions/order.ts` 수정
   - `store_menu` 검증 로직 추가

### Step 8: 테스트 및 검증
1. 메뉴명만으로 주문 명령 테스트
2. 옵션 1 선택 테스트
3. 옵션 2 선택 테스트
4. 에러 케이스 테스트 (매장에 메뉴 없는 경우 등)

---

## 🔍 상세 구현 내용

### 1. 메뉴명 추출 로직
- 사용자 메시지에서 메뉴명 추출
- 예: "아메리카노 주문해줘" → "아메리카노"
- 예: "카페라떼 2개 결제해줘" → "카페라떼"

### 2. 옵션 1 로직
- 사용자 주문 내역에서 같은 메뉴명 검색
- 가장 최근 주문의 매장 ID, 메뉴 ID 사용
- 주문 내역이 없으면 옵션 1 제외

### 3. 옵션 2 로직
- `menu` 테이블에서 메뉴명으로 검색 (LIKE)
- 찾은 메뉴 ID로 `store_menu` 조회
- 사용자 위치 정보가 있으면 거리 계산
- 거리순 정렬하여 상위 3개 매장 제시

### 4. 사용자 선택 처리
- 옵션 1 선택: 해당 매장의 해당 메뉴로 장바구니 추가
- 옵션 2 선택: 선택한 매장의 해당 메뉴로 장바구니 추가
- 장바구니 추가 후 자동으로 주문 진행 (기존 로직 활용)

---

## ⚠️ 주의사항

1. **메뉴명 매칭**: 메뉴명 검색 시 대소문자 구분 없이, 부분 일치 지원
2. **거리 계산**: 사용자 위치 정보가 없으면 거리순 정렬 불가
3. **에러 처리**: 매장에 메뉴가 없는 경우, 사용자에게 명확한 에러 메시지 제공
4. **성능**: 메뉴 검색 시 인덱스 활용하여 성능 최적화

---

## 📊 예상 결과

### 사용자 시나리오 1: 최근 주문이 있는 경우
```
사용자: "아메리카노 주문해줘"
AI: "아메리카노 주문을 위해 매장을 선택해주세요."
    [옵션 1: 최근 주문과 같게 주문 - 동대문종합시장 1호점]
    [옵션 2: 가까운 매장에서 주문 - 강남 카페거리점 (0.5km)]
사용자: [옵션 1 선택]
→ 동대문종합시장 1호점의 아메리카노로 주문 진행
```

### 사용자 시나리오 2: 최근 주문이 없는 경우
```
사용자: "카페라떼 주문해줘"
AI: "카페라떼 주문을 위해 매장을 선택해주세요."
    [옵션 2: 가까운 매장에서 주문 - 강남 카페거리점 (0.5km), 홍대 문화점 (1.2km)]
사용자: [강남 카페거리점 선택]
→ 강남 카페거리점의 카페라떼로 주문 진행
```

---

## 🎯 완료 기준

- [ ] 메뉴명만으로 주문 명령 시 매장 선택 옵션 제공
- [ ] 옵션 1 (최근 주문) 정상 동작
- [ ] 옵션 2 (가까운 매장) 정상 동작
- [ ] `store_menu` 테이블 기준으로 주문 검증
- [ ] 사용자 선택 후 주문 정상 진행
- [ ] 에러 케이스 처리 완료

