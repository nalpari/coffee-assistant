/**
 * 메뉴 관련 타입 정의
 *
 * 이 파일은 실제 데이터베이스 스키마(docs/ddl.md)를 기반으로 정의되었습니다.
 * DB 스키마와의 호환성을 유지하기 위해 주석에 DB 테이블 및 컬럼 정보를 명시합니다.
 *
 * @see docs/ddl.md - 실제 데이터베이스 스키마
 */

/**
 * 공통 감사 필드 (BaseEntity)
 *
 * 모든 엔티티에서 상속받는 공통 필드입니다.
 *
 * @dbUsage 모든 테이블에 공통으로 적용
 */
export interface BaseEntity {
  /** @dbColumn created_by varchar(255) NOT NULL */
  createdBy: string;

  /** @dbColumn created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP */
  createdDate: Date;

  /** @dbColumn updated_by varchar(255) NULL */
  updatedBy?: string;

  /** @dbColumn updated_date timestamp NULL */
  updatedDate?: Date;
}

/**
 * 메뉴 카테고리 타입
 *
 * @dbTable category
 * @dbMapping 1=COFFEE, 2=NON-COFFEE, 3=SIGNATURE, 4=SMOOTHIE & FRAPPE, 5=ADE & TEA, 6=COLD BREW
 */
export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6;
export type CategoryName = 'COFFEE' | 'NON-COFFEE' | 'SIGNATURE' | 'SMOOTHIE & FRAPPE' | 'ADE & TEA' | 'COLD BREW';

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

  /** @dbColumn description varchar(500) NOT NULL */
  description: string;

  /** @dbColumn price int4 NOT NULL CHECK (price > 0) */
  price: number;

  /** @dbColumn discount_price int4 NULL CHECK (discount_price > 0 AND discount_price < price) */
  discountPrice?: number;

  /** @dbColumn cold boolean NOT NULL DEFAULT false */
  cold: boolean;

  /** @dbColumn hot boolean NOT NULL DEFAULT false */
  hot: boolean;

  /** @dbColumn category_id bigint NULL FOREIGN KEY REFERENCES category(id) */
  categoryId?: number;

  /**
   * @dbColumn status varchar(255) NOT NULL DEFAULT 'E0101'
   * @dbCodeRef common_code.id
   * @dbValues E0101=사용(MENU_ACTIVE), E0102=미사용(MENU_INACTIVE)
   */
  status: string;

  /**
   * @dbColumn marketing _text NULL
   * @dbCodeRef common_code.id[]
   * @dbValues E0201=New(MENU_TYPE_NEW), E0202=Best(MENU_TYPE_BEST), E0203=Event(MENU_TYPE_EVENT)
   */
  marketing: string[];

  /** @dbColumn order_no int4 NOT NULL DEFAULT 0 */
  orderNo: number;
}

/**
 * 카테고리 정보 인터페이스 (DB 엔티티)
 *
 * @dbTable category
 * @dbPrimaryKey id (bigint, auto_increment)
 */
export interface CategoryInfo extends BaseEntity {
  /** @dbColumn id bigint PRIMARY KEY AUTO_INCREMENT */
  id: number;

  /** @dbColumn name varchar(255) NOT NULL UNIQUE */
  name: string;

  /** @dbColumn order_no int4 NOT NULL DEFAULT 0 */
  orderNo: number;

  /**
   * @dbColumn status varchar(255) NOT NULL DEFAULT 'D0101'
   * @dbCodeRef common_code.id
   * @dbValues D0101=사용(CATEGORY_ACTIVE), D0102=미사용(CATEGORY_INACTIVE)
   */
  status: string;

  /** @frontendOnly 프론트엔드에서 사용할 아이콘 이름 (lucide-react) */
  icon?: string;
}

/**
 * 이미지 정보 인터페이스 (DB 엔티티)
 *
 * @dbTable image
 * @dbPrimaryKey file_uuid (varchar(255))
 */
export interface MenuImage {
  /** @dbColumn file_uuid varchar(255) PRIMARY KEY */
  fileUuid: string;

  /** @dbColumn file_name varchar(255) NOT NULL */
  fileName: string;

  /** @dbColumn menu_id bigint NOT NULL FOREIGN KEY REFERENCES menu(id) ON DELETE CASCADE */
  menuId: number;

  /** @dbColumn menu_type varchar(255) NOT NULL */
  menuType: string;

  /** @dbColumn ordering int4 NOT NULL DEFAULT 0 */
  ordering: number;

  /** @dbColumn created_by varchar(255) NOT NULL */
  createdBy: string;

  /** @dbColumn created_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP */
  createdDate: Date;
}

/**
 * 공통코드 인터페이스 (DB 엔티티)
 *
 * 계층형 구조로 parent_id를 통해 자기 참조
 *
 * @dbTable common_code
 * @dbPrimaryKey id (varchar(50))
 * @dbHierarchy parent_id → id (self FK)
 *
 * @example
 * // 메뉴 관련 공통코드 구조
 * E (parent) - 메뉴 관련
 *   ├─ E01 (parent) - 메뉴 상태
 *   │   ├─ E0101 (child): "사용" (MENU_ACTIVE)
 *   │   └─ E0102 (child): "미사용" (MENU_INACTIVE)
 *   └─ E02 (parent) - 메뉴 마케팅 유형
 *       ├─ E0201 (child): "New" (MENU_TYPE_NEW)
 *       ├─ E0202 (child): "Best" (MENU_TYPE_BEST)
 *       └─ E0203 (child): "Event" (MENU_TYPE_EVENT)
 */
export interface CommonCode extends BaseEntity {
  /** @dbColumn id varchar(50) PRIMARY KEY */
  id: string;

  /** @dbColumn name varchar(100) NOT NULL */
  name: string;

  /** @dbColumn value varchar(100) NOT NULL UNIQUE */
  value: string;

  /** @dbColumn description text NULL */
  description?: string;

  /** @dbColumn extra_value text NULL */
  extraValue?: string;

  /** @dbColumn parent_id varchar(50) NULL FOREIGN KEY REFERENCES common_code(id) */
  parentId?: string;

  /** @dbColumn sort_order int4 NOT NULL DEFAULT 0 */
  sortOrder: number;

  /** @dbColumn del_yn varchar(1) NOT NULL DEFAULT 'N' CHECK (del_yn IN ('Y', 'N')) */
  delYn: string;
}

/**
 * 프론트엔드 전용 - 간소화된 메뉴 아이템
 *
 * API 응답에서 사용되며, DB 조인 결과를 포함합니다.
 * MenuItem에서 파생되지만 추가 계산 필드를 포함합니다.
 *
 * @apiResponse GET /api/menu
 * @dbJoin menu LEFT JOIN category ON menu.category_id = category.id
 * @dbJoin menu LEFT JOIN image ON menu.id = image.menu_id
 * @dbJoin menu LEFT JOIN common_code ON menu.marketing @> ARRAY[common_code.id]
 */
export interface MenuItemDisplay {
  /** @dbColumn menu.id */
  id: number;

  /** @dbColumn menu.name */
  name: string;

  /** @dbColumn menu.description */
  description: string;

  /** @dbColumn menu.price */
  price: number;

  /** @dbColumn menu.discount_price */
  discountPrice?: number;

  /** @computed 첫 번째 image.file_name (ordering ASC LIMIT 1) | null if no image */
  image: string | null;

  /** @computed 전체 image 목록 (ordering ASC) */
  images: MenuImage[];

  /** @computed category.name (조인 후) */
  category: string;

  /** @dbColumn menu.category_id */
  categoryId?: number;

  /** @computed common_code.name[] WHERE common_code.id IN (menu.marketing) */
  tags: string[];

  /** @computed menu.status = 'E0101' */
  available: boolean;

  /** @computed 'E0202' IN menu.marketing (Best 태그 포함 여부) */
  popular: boolean;

  /** @dbColumn menu.cold */
  cold: boolean;

  /** @dbColumn menu.hot */
  hot: boolean;

  /** @dbColumn menu.order_no */
  orderNo: number;
}

/**
 * 장바구니 아이템
 *
 * MenuItemDisplay에 수량 정보를 추가한 타입
 *
 * @frontendOnly 클라이언트 상태 관리 전용
 */
export interface CartItem extends MenuItemDisplay {
  /** 수량 (최소 1, 최대 99 권장) */
  quantity: number;
}

/**
 * 주문 정보
 *
 * 향후 DB 연동 시 order 테이블 생성 예정
 *
 * @dbTable order (향후 생성 예정)
 * @futureImplementation Phase 6 - 백엔드 연동
 */
export interface Order {
  /** @dbColumn id varchar(255) PRIMARY KEY (UUID) */
  id: string;

  /** @dbRelation order_item 테이블로 분리 예정 */
  items: CartItem[];

  /** @computed SUM(items.price * items.quantity) */
  totalPrice: number;

  /** @dbColumn created_date timestamp NOT NULL */
  timestamp: Date;

  /** @dbColumn status varchar(50) NOT NULL */
  status: 'pending' | 'confirmed' | 'completed';
}

/**
 * 장바구니 스토어 인터페이스 (Zustand)
 *
 * @stateManagement Zustand
 * @frontendOnly 클라이언트 상태 관리 전용
 */
export interface CartStore {
  items: CartItem[];
  addItem: (item: MenuItemDisplay) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
