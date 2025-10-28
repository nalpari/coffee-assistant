# 프로젝트 요구사항 정의서

## 📋 프로젝트 개요

### 프로젝트명
**Coffee Assistant with AI** (FastOrder 스타일 음식 주문 앱)

### 비전
AI 기반 커피 추천 및 관리 시스템을 갖춘 패스트오더 스타일의 빠르고 직관적인 음식 주문 웹 애플리케이션

### 핵심 가치 제안
- ⚡ **10초 이내 주문 완료**: 최소한의 클릭으로 빠른 주문 프로세스
- 🔍 **검색 중심 UX**: 실시간 검색으로 원하는 메뉴 즉시 탐색
- 📱 **모바일 우선 설계**: 터치 제스처 기반 인터랙션
- 🎨 **직관적 UI/UX**: 시각적으로 매력적이고 사용하기 쉬운 인터페이스

---

## 🎯 비즈니스 목표

### 주요 목표
1. **사용자 경험 최적화**: 주문 소요 시간 10초 이내 달성
2. **전환율 향상**: 직관적인 UI/UX를 통한 주문 완료율 증대
3. **모바일 최적화**: 모바일 사용자 경험에 집중한 설계
4. **성능 우선**: 빠른 로딩 및 반응성 보장

### 성공 지표 (KPI)
- 평균 주문 완료 시간: < 10초
- 페이지 로딩 시간: < 1.5초 (FCP)
- Lighthouse Performance Score: 90+
- 모바일 사용성 점수: 95+

---

## 👥 사용자 페르소나

### 주요 타겟 사용자
**페르소나 1: 바쁜 직장인 민수 (28세)**
- 점심시간이 짧아 빠른 주문이 필요
- 모바일 디바이스를 주로 사용
- 간편하고 직관적인 인터페이스 선호

**페르소나 2: 대학생 지영 (22세)**
- 트렌디한 UI/UX에 민감
- 소셜 미디어 공유 기능 선호
- 할인 및 프로모션에 관심

---

## ⚙️ 기능 요구사항

### 1. 필수 기능 (MVP)

#### 1.1 메뉴 탐색 및 검색
**우선순위**: P0 (최우선)

**기능 설명**:
- 실시간 메뉴 검색 (키워드 기반)
- 카테고리별 필터링 (COFFEE, NON-COFFEE, SIGNATURE, SMOOTHIE & FRAPPE, ADE & TEA, COLD BREW)
- 인기 메뉴 표시 (Badge)
- 재고 상태 표시 (품절 등)

**사용자 스토리**:
```
As a 사용자
I want to 검색창에 키워드를 입력하여 메뉴를 찾을 수 있다
So that 원하는 메뉴를 빠르게 찾을 수 있다
```

**수용 기준 (Acceptance Criteria)**:
- [ ] 검색어 입력 시 실시간으로 결과 필터링
- [ ] 카테고리 탭 클릭 시 해당 카테고리 메뉴만 표시
- [ ] 인기 메뉴에 "인기" Badge 표시
- [ ] 품절 메뉴는 시각적으로 구분 (흐림 처리)

---

#### 1.2 메뉴 상세 정보
**우선순위**: P0

**기능 설명**:
- 메뉴 카드 클릭 시 상세 모달 표시
- 고해상도 이미지, 상세 설명, 가격 정보
- 수량 조절 (+ / -)
- 장바구니 담기 버튼

**사용자 스토리**:
```
As a 사용자
I want to 메뉴를 클릭하면 상세 정보를 볼 수 있다
So that 주문 전 메뉴 정보를 확인할 수 있다
```

**수용 기준**:
- [ ] 메뉴 카드 클릭 시 모달 창 표시
- [ ] 이미지, 이름, 설명, 가격, 태그 표시
- [ ] 수량 증감 버튼 동작 (최소 1개)
- [ ] "담기" 버튼 클릭 시 장바구니에 추가

---

#### 1.3 장바구니 관리
**우선순위**: P0

**기능 설명**:
- 우측 하단 플로팅 버튼으로 장바구니 접근
- 사이드바 형태로 장바구니 표시
- 아이템 추가/제거/수량 변경
- 총 금액 실시간 계산

**사용자 스토리**:
```
As a 사용자
I want to 장바구니에서 주문 내역을 확인하고 수정할 수 있다
So that 주문 전 최종 확인이 가능하다
```

**수용 기준**:
- [ ] 장바구니 버튼에 아이템 개수 Badge 표시
- [ ] 사이드바에 장바구니 아이템 목록 표시
- [ ] 수량 변경 및 삭제 가능
- [ ] 총 금액 자동 계산 및 표시

---

#### 1.4 주문 프로세스
**우선순위**: P0

**기능 설명**:
- 스와이프 제스처로 주문 완료
- 주문 확인 애니메이션
- 주문 후 장바구니 초기화

**사용자 스토리**:
```
As a 사용자
I want to 스와이프 동작으로 주문을 완료할 수 있다
So that 빠르고 직관적으로 주문할 수 있다
```

**수용 기준**:
- [ ] 스와이프 버튼 우측으로 드래그 시 주문 완료
- [ ] 임계값 미달 시 자동으로 원위치
- [ ] 주문 완료 시 성공 애니메이션 표시
- [ ] 주문 후 장바구니 자동 비우기

---

### 2. 부가 기능 (Post-MVP)

#### 2.1 사용자 인증
**우선순위**: P1

**기능 설명**:
- 소셜 로그인 (Google, Kakao)
- 게스트 주문 허용
- 주문 내역 저장

---

#### 2.2 주문 내역 조회
**우선순위**: P1

**기능 설명**:
- 과거 주문 내역 확인
- 재주문 기능
- 주문 상태 추적

---

#### 2.3 찜하기 / 즐겨찾기
**우선순위**: P2

**기능 설명**:
- 자주 주문하는 메뉴 즐겨찾기
- 빠른 재주문

---

#### 2.4 리뷰 및 평점
**우선순위**: P2

**기능 설명**:
- 메뉴별 리뷰 작성
- 별점 표시
- 다른 사용자 리뷰 확인

---

## 🎨 UI/UX 요구사항

### 디자인 원칙
1. **모바일 퍼스트**: 모바일 화면을 우선 설계
2. **시각적 위계**: 중요한 정보를 시각적으로 강조
3. **일관성**: 통일된 디자인 시스템 적용
4. **접근성**: WCAG 2.1 AA 준수

### 색상 시스템
- **Primary (주황)**: HSL(25, 95%, 53%) - 식욕 촉진, 브랜드 컬러
- **Accent (빨강)**: HSL(0, 84%, 60%) - CTA, 중요 요소
- **Background**: 화이트 / 다크모드 지원
- **Card**: 약간의 그레이 (HSL(0, 0%, 98%))

### 타이포그래피
- **헤딩 폰트**: Geist Sans (Bold, 2xl - 3xl)
- **본문 폰트**: Geist Sans (Regular, base - lg)
- **코드 폰트**: Geist Mono

### 레이아웃
- **최소 터치 영역**: 44px x 44px
- **버튼 높이**: 56px (btn-large)
- **Border Radius**: 0.75rem (부드러운 모서리)
- **그리드 시스템**: 2열 (모바일), 3열 (태블릿), 4열 (데스크톱)

### 애니메이션
- **전환 속도**: 200-300ms (부드러운 전환)
- **Framer Motion**: 스와이프, 모달 등 인터랙션
- **Spring 애니메이션**: 주문 확인 체크마크

---

## 🛠 기술 요구사항

### 1. 기술 스택

#### 프론트엔드
- **프레임워크**: Next.js 16.0.0 (App Router)
- **라이브러리**: React 19.2.0 (Server Components)
- **언어**: TypeScript 5 (strict mode)
- **스타일링**: Tailwind CSS v4 (CSS 변수 기반)
- **UI 컴포넌트**: shadcn/ui (Radix UI 기반)
- **상태 관리**: Zustand
- **애니메이션**: Framer Motion
- **폰트**: Geist Sans + Geist Mono

#### 개발 도구
- **패키지 매니저**: pnpm
- **린터**: ESLint 9 (Next.js TypeScript)
- **코드 포맷터**: Prettier (선택)
- **버전 관리**: Git

---

### 2. 성능 요구사항

#### Lighthouse 목표
- **Performance**: 90+ (데스크톱), 85+ (모바일)
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

#### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5초
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.5초

#### 최적화 전략
- Next.js Image 컴포넌트 사용 (AVIF, WebP)
- Server Components 활용 (정적 콘텐츠)
- Client Components 최소화 (인터랙티브 부분만)
- Lazy Loading (이미지, 컴포넌트)
- React Compiler 활성화

---

### 3. 접근성 요구사항
- **WCAG 2.1 AA 준수**
- **키보드 네비게이션**: 모든 인터랙티브 요소 접근 가능
- **스크린 리더 지원**: ARIA 레이블 적용
- **색상 대비**: 최소 4.5:1 (일반 텍스트), 3:1 (대형 텍스트)
- **포커스 표시**: 포커스된 요소 시각적 표시

---

### 4. 반응형 디자인
**브레이크포인트**:
- 모바일: 320px - 768px
- 태블릿: 768px - 1024px
- 데스크톱: 1024px 이상

**그리드 시스템**:
- 모바일: 2열 (grid-cols-2)
- 태블릿: 3열 (md:grid-cols-3)
- 데스크톱: 4열 (lg:grid-cols-4)

---

## 📊 데이터 모델

### 데이터베이스 스키마 참고
실제 데이터베이스 스키마는 `docs/ddl.md` 참고

### 타입 정의

#### BaseEntity (공통 감사 필드)
```typescript
interface BaseEntity {
  createdBy: string;       // 생성자 (varchar(255))
  createdDate: Date;       // 생성일시 (timestamp)
  updatedBy?: string;      // 수정자 (varchar(255), nullable)
  updatedDate?: Date;      // 수정일시 (timestamp, nullable)
}
```

#### MenuItem (DB 엔티티)
```typescript
interface MenuItem extends BaseEntity {
  id: number;              // 고유 식별자 (bigint, auto increment)
  name: string;            // 메뉴 이름 (varchar(255))
  description: string;     // 상세 설명 (varchar(500))
  price: number;           // 기본 가격 (int4, 원 단위)
  discountPrice?: number;  // 할인 가격 (int4, nullable)
  cold: boolean;           // 차가운 음료 제공 여부
  hot: boolean;            // 따뜻한 음료 제공 여부
  categoryId?: number;     // 카테고리 FK (bigint)
  status: string;          // 메뉴 상태 (common_code.id 참조)
  marketing: string[];     // 마케팅 태그 (_text, common_code.id 참조)
  orderNo: number;         // 정렬 순서 (int4)
}
```

#### MenuItemDisplay (프론트엔드 전용)
```typescript
interface MenuItemDisplay {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;           // 첫 번째 이미지 URL
  images: MenuImage[];     // 전체 이미지 목록
  category: string;        // 카테고리명 (조인 후)
  categoryId?: number;
  tags: string[];          // 마케팅 태그 (조인 후 이름 배열)
  available: boolean;      // status 기반 계산
  popular: boolean;        // marketing에서 "인기" 태그 포함 여부
  cold: boolean;
  hot: boolean;
  orderNo: number;
}
```

#### CategoryInfo (카테고리)
```typescript
interface CategoryInfo extends BaseEntity {
  id: number;              // 고유 식별자 (bigint)
  name: string;            // 카테고리 이름 (varchar(255))
  orderNo: number;         // 정렬 순서 (int4)
  status: string;          // 상태 (common_code.id 참조)
}
```

#### MenuImage (이미지)
```typescript
interface MenuImage {
  fileUuid: string;        // 파일 UUID (varchar(255), PK)
  fileName: string;        // 파일명 (varchar(255))
  menuId: number;          // 메뉴 FK (bigint)
  menuType: string;        // 메뉴 타입 구분자 (varchar(255))
  ordering: number;        // 이미지 정렬 순서 (int4)
  createdBy: string;
  createdDate: Date;
}
```

#### CommonCode (공통코드)
```typescript
interface CommonCode extends BaseEntity {
  id: string;              // 코드 ID (varchar(50), PK)
  name: string;            // 코드 이름 (varchar(100))
  value: string;           // 코드 값 (varchar(100), unique)
  description?: string;    // 코드 설명 (text)
  extraValue?: string;     // 추가 값 (text)
  parentId?: string;       // 부모 코드 ID (varchar(50), self FK)
  sortOrder: number;       // 정렬 순서 (int4)
  delYn: string;           // 삭제 여부 (varchar(1), 'Y' | 'N')
}
```

#### CartItem
```typescript
interface CartItem extends MenuItemDisplay {
  quantity: number;        // 수량 (최소 1)
}
```

#### Order (향후 DB 연동)
```typescript
interface Order {
  id: string;              // 주문 UUID
  items: CartItem[];       // 주문 아이템 목록
  totalPrice: number;      // 총 금액 (할인가 우선)
  timestamp: Date;         // 주문 시간
  status: 'pending' | 'confirmed' | 'completed';
}
```

#### CartStore (Zustand)
```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItemDisplay) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;  // 할인가 우선 적용
  getTotalItems: () => number;
}
```

---

## 🔒 보안 및 규정 준수

### 보안 요구사항
1. **XSS 방지**: 사용자 입력 검증 및 이스케이프
2. **CSRF 방지**: Next.js 기본 보안 기능 활용
3. **HTTPS 적용**: 프로덕션 환경 SSL 인증서
4. **환경 변수 관리**: `.env.local` 사용, Git 제외

### 개인정보 보호
- 사용자 데이터 최소 수집
- GDPR, 개인정보보호법 준수 (향후 인증 추가 시)

---

## 🚀 배포 및 운영

### 호스팅
- **플랫폼**: Vercel (Next.js 최적화)
- **CDN**: Vercel Edge Network
- **도메인**: 커스텀 도메인 연결 (추후)

### 모니터링
- **성능 모니터링**: Vercel Analytics
- **에러 추적**: Sentry (선택)
- **사용자 분석**: Google Analytics (선택)

---

## 📅 개발 일정

### Phase별 타임라인

| Phase | 작업 내용 | 예상 시간 | 누적 시간 |
|-------|----------|----------|----------|
| **Phase 1** | 기반 설정 (shadcn/ui, 타입, 색상 테마) | 1-2시간 | 1-2시간 |
| **Phase 2** | 메인 UI 구조 (헤더, 카테고리, 메뉴 그리드) | 2-3시간 | 3-5시간 |
| **Phase 3** | 인터랙션 구현 (상세 모달, 장바구니, 상태 관리) | 2-3시간 | 5-8시간 |
| **Phase 4** | 주문 플로우 (스와이프, 주문 확인 애니메이션) | 2-3시간 | 7-11시간 |
| **Phase 5** | 최적화 및 마무리 (이미지, 검색, 성능) | 1-2시간 | 8-13시간 |

**총 예상 개발 시간**: 8-13시간

---

## ✅ 검증 기준

### Phase 1 검증
- [ ] shadcn/ui 컴포넌트 정상 설치 확인
- [ ] TypeScript 타입 에러 없음
- [ ] 모크 데이터 타입 일치
- [ ] 브라우저에서 커스텀 색상 적용 확인

### Phase 2 검증
- [ ] 헤더 상단 고정 동작
- [ ] 검색창 키보드 입력 가능
- [ ] 카테고리 탭 클릭 시 선택 상태 변경
- [ ] 메뉴 카드 그리드 올바르게 표시
- [ ] 반응형 레이아웃 동작 (모바일/태블릿/데스크톱)

### Phase 3 검증
- [ ] 메뉴 카드 클릭 시 상세 모달 열림
- [ ] 수량 증감 버튼 동작
- [ ] 장바구니 버튼 클릭 시 사이드바 열림
- [ ] 장바구니 아이템 추가/제거 동작
- [ ] 총 금액 계산 정확성

### Phase 4 검증
- [ ] 스와이프 동작 부드러운 작동
- [ ] 임계값 도달 시 주문 완료 처리
- [ ] 주문 확인 애니메이션 표시
- [ ] 주문 후 장바구니 초기화

### Phase 5 검증
- [ ] 모든 이미지 최적화 적용
- [ ] 검색 기능 정상 동작
- [ ] 반응형 레이아웃 완벽 동작
- [ ] Lighthouse Performance 90+ 달성
- [ ] 접근성 검사 통과 (95+)

---

## 📚 참고 자료

### 기술 문서
- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [React 19 Documentation](https://react.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

### 디자인 참고
- [FastOrder.my](https://fastorder.my/)
- [음식 주문 앱 UI/UX 베스트 프랙티스](https://www.linkedin.com/advice/0/how-can-you-design-mobile-app-ui-quick-easy-vchqf)

---

## ⚠️ 제약사항 및 가정

### 제약사항
1. **이미지 저작권**: Unsplash API 사용 (무료 이미지 제공)
2. **결제 시스템**: MVP에서는 결제 기능 제외 (주문 프로세스만)
3. **데이터베이스**: 초기에는 모크 데이터 사용 (향후 Supabase 연동)
4. **인증**: MVP에서는 게스트 주문만 지원
5. **주문 관리**: 백엔드 API 없이 프론트엔드만 구현

### 가정
1. 사용자는 모바일 디바이스에서 주로 접속
2. 인터넷 연결 상태는 양호
3. 브라우저는 최신 버전 (Chrome, Safari, Edge)
4. 터치 제스처 지원 디바이스 사용

---

## 🔄 향후 개선 계획 (Post-MVP)

### Phase 2 (백엔드 연동)
1. **Supabase 통합**
   - PostgreSQL 데이터베이스
   - RESTful API 설계
   - 실시간 주문 상태 업데이트

2. **인증 시스템**
   - 소셜 로그인 (Google, Kakao)
   - 사용자 프로필 관리

### Phase 3 (추가 기능)
1. **주문 내역 조회**
2. **찜하기/즐겨찾기**
3. **리뷰 및 평점 시스템**
4. **푸시 알림** (PWA)

### Phase 4 (분석 및 최적화)
1. **사용자 행동 분석** (Google Analytics, Vercel Analytics)
2. **A/B 테스팅**
3. **성능 모니터링 및 최적화**

---

## 📝 문서 히스토리

- **작성일**: 2025-10-27
- **작성자**: Coffee Assistant Team
- **버전**: 1.0
- **기반 문서**: `IMPLEMENTATION_WORKFLOW.md`

---

## 📞 문의 및 지원

프로젝트 관련 문의:
- **GitHub Issues**: 프로젝트 이슈 페이지
- **Technical Lead**: [담당자 정보 추가 예정]
