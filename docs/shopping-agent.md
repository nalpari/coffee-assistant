# Shopping Agent 이식 가이드

AI 쇼핑 어시스턴트 기능을 다른 프로젝트로 이식하기 위한 완전한 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [핵심 컴포넌트](#핵심-컴포넌트)
4. [의존성 및 요구사항](#의존성-및-요구사항)
5. [이식 절차](#이식-절차)
6. [커스터마이징 가이드](#커스터마이징-가이드)
7. [API 레퍼런스](#api-레퍼런스)
8. [트러블슈팅](#트러블슈팅)

---

## 개요

### 기능 요약

Shopping Agent는 Claude AI를 활용한 대화형 쇼핑 어시스턴트로, 다음 기능을 제공합니다:

- **자연어 대화**: 사용자와 자연스러운 한국어 대화
- **제품 추천**: 구매 이력 기반 개인화된 추천
- **장바구니 관리**: AI를 통한 장바구니 추가/제거
- **주문 안내**: 결제 프로세스 가이드
- **컨텍스트 유지**: 대화 히스토리 및 상태 관리

### 주요 특징

- ✅ **모듈화**: 독립적인 3개 모듈로 구성
- ✅ **타입 안정성**: TypeScript 완전 지원
- ✅ **확장성**: 쉬운 프롬프트 및 액션 커스터마이징
- ✅ **성능**: 인메모리 컨텍스트 관리로 빠른 응답
- ✅ **유연성**: 데이터베이스 독립적 설계

---

## 아키텍처

### 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  - ChatInterface.tsx (UI Component)                      │
│  - API Client (fetch /api/chat)                          │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP POST
                 ↓
┌─────────────────────────────────────────────────────────┐
│                     API Layer                            │
│  - /api/chat/route.ts (Next.js API Route)               │
│  - Authentication Middleware                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  Core Business Logic                     │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ShoppingAgent (shopping-agent.ts)                │  │
│  │  - AI 메시지 처리                                   │  │
│  │  - 컨텍스트 준비                                    │  │
│  │  - 응답 파싱                                        │  │
│  └────────────────┬──────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────┴──────────────────────────────────┐  │
│  │  ConversationManager (conversation-manager.ts)    │  │
│  │  - 대화 히스토리 관리                               │  │
│  │  - 장바구니 상태 관리                               │  │
│  │  - 컨텍스트 캐싱                                    │  │
│  └────────────────┬──────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────┴──────────────────────────────────┐  │
│  │  ClaudeClient (claude-client.ts)                  │  │
│  │  - Anthropic SDK 초기화                            │  │
│  │  - 시스템 프롬프트 정의                             │  │
│  │  - 메시지 포맷팅                                    │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  External Services                       │
│  - Anthropic Claude API (AI 응답)                       │
│  - Supabase (제품 데이터, 구매 이력)                     │
└─────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
1. 사용자 입력
   ↓
2. API 라우트 (/api/chat)
   ↓
3. ConversationManager (컨텍스트 로드)
   ↓
4. ShoppingAgent.processMessage()
   ├─ prepareContextInfo() → 데이터베이스 조회
   ├─ createFullPrompt() → 프롬프트 생성
   ├─ Claude API 호출 → AI 응답
   └─ parseClaudeResponse() → 구조화된 응답
   ↓
5. 액션 처리 (장바구니 업데이트 등)
   ↓
6. 응답 반환 (메시지 + 업데이트된 상태)
   ↓
7. Frontend 업데이트
```

---

## 핵심 컴포넌트

### 1. ClaudeClient (`src/lib/claude-client.ts`)

**역할**: Anthropic Claude AI SDK 초기화 및 설정 관리

**주요 기능**:
- Claude API 클라이언트 인스턴스 생성
- 모델 설정 (모델명, max_tokens, temperature)
- 시스템 프롬프트 정의
- 메시지 히스토리 포맷팅

**코드 구조**:
```typescript
// Claude API 클라이언트
export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// 모델 설정
export const CLAUDE_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  temperature: 0.7,
};

// 시스템 프롬프트
export const SHOPPING_ASSISTANT_PROMPT = `...`;

// 유틸리티 함수
export function formatConversationHistory(...);
```

**의존성**:
- `@anthropic-ai/sdk`: Claude AI SDK
- 환경 변수: `ANTHROPIC_API_KEY`

---

### 2. ConversationManager (`src/lib/conversation-manager.ts`)

**역할**: 사용자별 대화 컨텍스트 및 상태 관리

**주요 기능**:
- 대화 히스토리 저장 (최근 20개 메시지)
- 장바구니 상태 관리 (추가/제거/업데이트)
- 자주 구매하는 제품 캐싱
- 세션 타임아웃 관리 (1시간)
- 컨텍스트 Import/Export (영속성 지원)

**코드 구조**:
```typescript
export class ConversationManager {
  private contexts: Map<string, ConversationContext>;

  // 컨텍스트 관리
  getContext(userId: string): ConversationContext;
  exportContext(userId: string): ConversationContext | null;
  importContext(userId: string, context: ConversationContext): void;

  // 대화 관리
  addMessage(userId: string, message: ChatMessage): void;
  resetConversation(userId: string): void;

  // 장바구니 관리
  updateCart(userId: string, cart: CartItem[]): void;
  addToCart(userId: string, item: CartItem): CartItem[];
  removeFromCart(userId: string, productId: string, quantity?: number): CartItem[];
  clearCart(userId: string): void;

  // 자주 구매 제품 관리
  updateFrequentProducts(userId: string, products: UserPurchaseFrequency[]): void;
  clearFrequentProducts(userId: string): void;

  // 유틸리티
  getCartTotal(userId: string): number;
  getCartItemCount(userId: string): number;
  getContextSummary(userId: string): object;
  cleanupOldContexts(): void;
}

// 글로벌 인스턴스
export const conversationManager = new ConversationManager();
```

**의존성**:
- TypeScript Types: `ConversationContext`, `ChatMessage`, `CartItem`
- 없음 (순수 인메모리 관리)

**특징**:
- 인메모리 저장소 (빠른 성능)
- 자동 세션 정리 (30분마다)
- 대화 히스토리 제한 (20개 메시지)

---

### 3. ShoppingAgent (`src/lib/shopping-agent.ts`)

**역할**: AI 쇼핑 어시스턴트 핵심 로직

**주요 기능**:
- 사용자 메시지 처리 및 AI 응답 생성
- 컨텍스트 정보 준비 (장바구니, 구매 이력, 제품 목록)
- Claude 응답 파싱 및 구조화
- 제품 데이터 조회
- 장바구니 유효성 검증

**코드 구조**:
```typescript
export class ShoppingAgent {
  // 메인 처리 함수
  async processMessage(
    context: ConversationContext,
    userMessage: string
  ): Promise<AIResponse>;

  // 내부 함수
  private async prepareContextInfo(context: ConversationContext): Promise<string>;
  private createFullPrompt(contextInfo: string, userMessage: string): string;
  private parseClaudeResponse(content: unknown): AIResponse;

  // 유틸리티 함수
  async getUserFrequentProducts(userId: string): Promise<UserPurchaseFrequency[]>;
  async getProductsByIds(productIds: string[]): Promise<Product[]>;
  async validateCartItems(cartItems: CartItem[]): Promise<CartItem[]>;
}
```

**의존성**:
- `claude-client.ts`: Claude API 클라이언트 및 설정
- `supabase.ts`: 데이터베이스 접근 (제품, 주문 이력)
- TypeScript Types: `ConversationContext`, `AIResponse`, `Product`

**AI 응답 구조**:
```typescript
interface AIResponse {
  action: 'recommend' | 'add_to_cart' | 'remove_from_cart' | 'checkout' | 'chat';
  message: string;
  products?: Array<{ id: string; quantity: number }>;
}
```

---

## 의존성 및 요구사항

### npm 패키지

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.67.0",       // Claude AI SDK (필수)
    "@supabase/supabase-js": "^2.76.1",   // Supabase 클라이언트 (선택)
    "typescript": "^5",                    // TypeScript (필수)
    "zod": "^4.1.12"                      // 데이터 검증 (선택)
  }
}
```

### 환경 변수

```env
# 필수
ANTHROPIC_API_KEY=sk-ant-...           # Anthropic API 키

# 선택 (데이터베이스 사용 시)
NEXT_PUBLIC_SUPABASE_URL=https://...   # Supabase URL
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Supabase Service Role Key
```

### TypeScript 타입 정의

다음 타입들이 필요합니다 (`src/types/app.ts`):

```typescript
// 장바구니 아이템
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

// 채팅 메시지
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// AI 액션 타입
export type AIAction =
  | 'recommend'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout'
  | 'chat';

// AI 응답
export interface AIResponse {
  action: AIAction;
  message: string;
  products?: Array<{
    id: string;
    quantity: number;
  }>;
}

// 대화 컨텍스트
export interface ConversationContext {
  userId: string;
  conversationHistory: ChatMessage[];
  cart: CartItem[];
  frequentProducts: UserPurchaseFrequency[];
  lastActivity: Date;
}

// 구매 빈도 정보
export interface UserPurchaseFrequency {
  user_id: string;
  product_id: string;
  product_name: string;
  price: number;
  purchase_count: number;
  last_purchased: string;
}

// 제품 정보
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  created_at: string;
}
```

### 데이터베이스 스키마 (선택)

Supabase 또는 PostgreSQL 사용 시 필요:

```sql
-- 제품 테이블
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 테이블
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주문 아이템 테이블
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

---

## 이식 절차

### Step 1: 파일 복사

다음 파일들을 복사합니다:

```bash
# 핵심 라이브러리
src/lib/claude-client.ts          → your-project/lib/claude-client.ts
src/lib/conversation-manager.ts   → your-project/lib/conversation-manager.ts
src/lib/shopping-agent.ts         → your-project/lib/shopping-agent.ts

# 타입 정의
src/types/app.ts                  → your-project/types/app.ts

# API 라우트 (Next.js 사용 시)
src/app/api/chat/route.ts         → your-project/app/api/chat/route.ts
```

---

### Step 2: 패키지 설치

```bash
# npm
npm install @anthropic-ai/sdk

# yarn
yarn add @anthropic-ai/sdk

# pnpm
pnpm add @anthropic-ai/sdk
```

---

### Step 3: 환경 변수 설정

`.env.local` 파일 생성:

```env
# Anthropic API 키 (필수)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Supabase 설정 (데이터베이스 사용 시)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Anthropic API 키 발급 방법**:
1. https://console.anthropic.com 접속
2. 회원가입 또는 로그인
3. API Keys → Create Key
4. 생성된 키를 복사하여 환경 변수에 설정

---

### Step 4: 데이터베이스 어댑터 작성 (선택)

데이터베이스가 Supabase가 아닌 경우, 어댑터를 작성해야 합니다.

**src/lib/database-adapter.ts** (예시):

```typescript
import type { Product, UserPurchaseFrequency } from '@/types';

export interface DatabaseAdapter {
  // 제품 조회
  getProducts(limit?: number): Promise<Product[]>;
  getProductsByIds(productIds: string[]): Promise<Product[]>;

  // 구매 이력 조회
  getUserFrequentProducts(userId: string): Promise<UserPurchaseFrequency[]>;

  // 재고 확인
  validateStock(productId: string, quantity: number): Promise<boolean>;
}

// MongoDB 어댑터 예시
export class MongoDBAdapter implements DatabaseAdapter {
  async getProducts(limit = 20): Promise<Product[]> {
    // MongoDB 쿼리 구현
    const products = await db.collection('products')
      .find({ stock: { $gt: 0 } })
      .limit(limit)
      .toArray();

    return products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      stock: p.stock,
      // ... 기타 필드
    }));
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    // 구현
  }

  async getUserFrequentProducts(userId: string): Promise<UserPurchaseFrequency[]> {
    // 주문 이력 집계 쿼리
    const result = await db.collection('orders').aggregate([
      { $match: { userId, status: 'completed' } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          count: { $sum: 1 },
          lastPurchased: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    return result.map(r => ({
      user_id: userId,
      product_id: r._id.toString(),
      purchase_count: r.count,
      last_purchased: r.lastPurchased.toISOString(),
      // 제품 정보는 별도 조회 필요
    }));
  }

  async validateStock(productId: string, quantity: number): Promise<boolean> {
    const product = await db.collection('products').findOne({ _id: productId });
    return product ? product.stock >= quantity : false;
  }
}
```

**shopping-agent.ts 수정**:

```typescript
import { DatabaseAdapter } from './database-adapter';

export class ShoppingAgent {
  constructor(private dbAdapter: DatabaseAdapter) {}

  // supabaseAdmin.from('products') 대신 this.dbAdapter.getProducts() 사용
  private async prepareContextInfo(context: ConversationContext): Promise<string> {
    const products = await this.dbAdapter.getProducts(20);
    // ... 나머지 로직
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    return this.dbAdapter.getProductsByIds(productIds);
  }

  async getUserFrequentProducts(userId: string): Promise<UserPurchaseFrequency[]> {
    return this.dbAdapter.getUserFrequentProducts(userId);
  }
}
```

---

### Step 5: API 라우트 설정

#### Next.js App Router 사용 시

**src/app/api/chat/route.ts**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ShoppingAgent } from '@/lib/shopping-agent';
import { conversationManager } from '@/lib/conversation-manager';
import type { ChatRequest, ChatResponse, ChatMessage } from '@/types';

const shoppingAgent = new ShoppingAgent();

export async function POST(req: NextRequest) {
  try {
    // 인증 확인 (본인의 인증 시스템에 맞게 수정)
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await req.json();
    const { message, cart } = body;

    // 검증
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 컨텍스트 가져오기
    const context = conversationManager.getContext(user.id);

    // 장바구니 업데이트
    if (cart) {
      conversationManager.updateCart(user.id, cart);
    }

    // 자주 구매 제품 로드
    if (context.frequentProducts.length === 0) {
      const frequentProducts = await shoppingAgent.getUserFrequentProducts(user.id);
      conversationManager.updateFrequentProducts(user.id, frequentProducts);
    }

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    conversationManager.addMessage(user.id, userMessage);

    // AI 응답 생성
    const aiResponse = await shoppingAgent.processMessage(context, message);

    // AI 메시지 추가
    const aiMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date(),
    };
    conversationManager.addMessage(user.id, aiMessage);

    // 액션 처리 (장바구니 업데이트)
    let updatedCart = context.cart;

    if (aiResponse.action === 'add_to_cart' && aiResponse.products) {
      const productIds = aiResponse.products.map(p => p.id);
      const products = await shoppingAgent.getProductsByIds(productIds);

      for (const productAction of aiResponse.products) {
        const product = products.find(p => p.id === productAction.id);
        if (product && product.stock >= productAction.quantity) {
          updatedCart = conversationManager.addToCart(user.id, {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: productAction.quantity,
            image_url: product.image_url || undefined,
          });
        }
      }
    } else if (aiResponse.action === 'remove_from_cart' && aiResponse.products) {
      for (const productAction of aiResponse.products) {
        updatedCart = conversationManager.removeFromCart(
          user.id,
          productAction.id,
          productAction.quantity
        );
      }
    }

    // 장바구니 유효성 검증
    updatedCart = await shoppingAgent.validateCartItems(updatedCart);
    conversationManager.updateCart(user.id, updatedCart);

    const response: ChatResponse = {
      message: aiResponse.message,
      action: aiResponse.action,
      cart: updatedCart,
      products: aiResponse.products,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### Express.js 사용 시

**routes/chat.ts**:

```typescript
import express from 'express';
import { ShoppingAgent } from '../lib/shopping-agent';
import { conversationManager } from '../lib/conversation-manager';
import type { ChatRequest, ChatResponse } from '../types';

const router = express.Router();
const shoppingAgent = new ShoppingAgent();

router.post('/chat', async (req, res) => {
  try {
    // 인증 확인
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message, cart }: ChatRequest = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const context = conversationManager.getContext(req.user.id);

    if (cart) {
      conversationManager.updateCart(req.user.id, cart);
    }

    if (context.frequentProducts.length === 0) {
      const frequentProducts = await shoppingAgent.getUserFrequentProducts(req.user.id);
      conversationManager.updateFrequentProducts(req.user.id, frequentProducts);
    }

    conversationManager.addMessage(req.user.id, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const aiResponse = await shoppingAgent.processMessage(context, message);

    conversationManager.addMessage(req.user.id, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date(),
    });

    // 장바구니 액션 처리 (위와 동일)
    let updatedCart = context.cart;
    // ... (액션 처리 로직)

    const response: ChatResponse = {
      message: aiResponse.message,
      action: aiResponse.action,
      cart: updatedCart,
      products: aiResponse.products,
    };

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

### Step 6: 프론트엔드 통합

#### React/Next.js 예시

```typescript
'use client';

import { useState } from 'react';
import type { CartItem, ChatMessage, AIAction } from '@/types';

export default function ChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          cart,
        }),
      });

      const data = await response.json();

      // AI 메시지 추가
      const aiMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // 장바구니 업데이트
      if (data.cart) {
        setCart(data.cart);
      }

      // 특정 액션 처리
      if (data.action === 'checkout') {
        // 결제 페이지로 이동
        window.location.href = '/checkout';
      }
    } catch (error) {
      console.error('Chat error:', error);
      // 에러 메시지 표시
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* 메시지 리스트 */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading}>
          전송
        </button>
      </div>
    </div>
  );
}
```

---

## 커스터마이징 가이드

### 1. AI 프롬프트 커스터마이징

**파일**: `src/lib/claude-client.ts`

```typescript
export const SHOPPING_ASSISTANT_PROMPT = `당신은 AI 쇼핑 어시스턴트입니다.

주요 기능:
1. 제품 추천 - 사용자의 구매 이력과 선호도를 분석하여 적절한 제품을 추천
2. 장바구니 관리 - 제품을 장바구니에 추가하거나 제거
3. 주문 확인 - 결제 전 주문 내용을 확인하고 결제 프로세스 안내
4. 자연스러운 대화 - 친근하고 도움이 되는 톤으로 대화

응답 형식:
모든 응답은 다음 JSON 형식으로 제공해야 합니다:
{
  "action": "recommend" | "add_to_cart" | "remove_from_cart" | "checkout" | "chat",
  "message": "사용자에게 표시할 메시지",
  "products": [{"id": "product-id", "quantity": 1}]
}

규칙:
- 항상 한국어로 응답
- 친근하고 도움이 되는 톤 유지
- 제품 추천 시 구체적인 이유 제시
- 장바구니 변경 시 명확한 확인 메시지 제공
- 결제 전 주문 내용 상세 확인`;
```

**커스터마이징 방법**:

1. **언어 변경** (영어로 변경 예시):
```typescript
export const SHOPPING_ASSISTANT_PROMPT = `You are an AI shopping assistant.

Key features:
1. Product recommendations - Analyze user purchase history and preferences
2. Cart management - Add or remove products from cart
3. Order confirmation - Review order details before checkout
4. Natural conversation - Maintain a friendly and helpful tone

Response format:
All responses must be in the following JSON format:
{
  "action": "recommend" | "add_to_cart" | "remove_from_cart" | "checkout" | "chat",
  "message": "Message to display to the user",
  "products": [{"id": "product-id", "quantity": 1}]
}

Rules:
- Always respond in English
- Maintain a friendly and helpful tone
- Provide specific reasons for product recommendations
- Provide clear confirmation messages for cart changes
- Confirm order details in detail before checkout`;
```

2. **새로운 액션 추가** (예: 위시리스트):

**types/app.ts**:
```typescript
export type AIAction =
  | 'recommend'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout'
  | 'add_to_wishlist'  // 새로운 액션
  | 'chat';
```

**claude-client.ts**:
```typescript
export const SHOPPING_ASSISTANT_PROMPT = `...

액션 가이드라인:
- "recommend": 제품 추천 시
- "add_to_cart": 장바구니에 제품 추가 시
- "remove_from_cart": 장바구니에서 제품 제거 시
- "add_to_wishlist": 위시리스트에 제품 추가 시  // 추가
- "checkout": 결제 진행 시
- "chat": 일반 대화 시
...`;
```

**shopping-agent.ts**:
```typescript
private parseClaudeResponse(content: unknown): AIResponse {
  // ...
  const validActions = [
    'recommend',
    'add_to_cart',
    'remove_from_cart',
    'checkout',
    'add_to_wishlist',  // 추가
    'chat',
  ];
  // ...
}
```

**API Route** (route.ts):
```typescript
// 액션 처리
if (aiResponse.action === 'add_to_wishlist' && aiResponse.products) {
  // 위시리스트 처리 로직
  for (const productAction of aiResponse.products) {
    await addToWishlist(user.id, productAction.id);
  }
}
```

3. **컨텍스트 정보 추가** (예: 사용자 선호도):

**shopping-agent.ts**:
```typescript
private async prepareContextInfo(context: ConversationContext): Promise<string> {
  const { userId, cart, frequentProducts } = context;

  // 기존 제품 조회
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .gt('stock', 0)
    .limit(20);

  // 사용자 선호도 조회 (추가)
  const { data: preferences } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  let contextInfo = `사용자 ID: ${userId}\n\n`;

  // 사용자 선호도 추가
  if (preferences) {
    contextInfo += `사용자 선호도:\n`;
    contextInfo += `- 선호 카테고리: ${preferences.favorite_categories.join(', ')}\n`;
    contextInfo += `- 가격 범위: ${preferences.min_price}원 ~ ${preferences.max_price}원\n`;
    contextInfo += `- 브랜드 선호: ${preferences.favorite_brands.join(', ')}\n\n`;
  }

  // 기존 장바구니, 자주 구매 제품 등...
  // ...

  return contextInfo;
}
```

---

### 2. 모델 설정 변경

**파일**: `src/lib/claude-client.ts`

```typescript
export const CLAUDE_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',  // 모델 선택
  max_tokens: 1024,                      // 최대 토큰 수
  temperature: 0.7,                      // 창의성 (0.0 ~ 1.0)
} as const;
```

**사용 가능한 모델**:
- `claude-3-5-sonnet-20241022`: 최신 Sonnet (균형잡힌 성능)
- `claude-3-opus-20240229`: Opus (최고 성능, 비용 높음)
- `claude-3-haiku-20240307`: Haiku (빠른 응답, 비용 낮음)

**파라미터 설명**:
- `max_tokens`: 응답 최대 길이 (512 ~ 4096 권장)
- `temperature`:
  - `0.0 ~ 0.3`: 일관되고 예측 가능한 응답
  - `0.4 ~ 0.7`: 균형잡힌 응답 (권장)
  - `0.8 ~ 1.0`: 창의적이고 다양한 응답

---

### 3. 대화 히스토리 설정

**파일**: `src/lib/conversation-manager.ts`

```typescript
addMessage(userId: string, message: ChatMessage): void {
  const context = this.getContext(userId);
  context.conversationHistory.push(message);

  // 최근 N개 메시지만 유지 (기본: 20)
  const MAX_MESSAGES = 20;  // 커스터마이징 가능
  if (context.conversationHistory.length > MAX_MESSAGES) {
    context.conversationHistory = context.conversationHistory.slice(-MAX_MESSAGES);
  }
}
```

**세션 타임아웃 변경**:
```typescript
cleanupOldContexts(): void {
  const TIMEOUT_MS = 60 * 60 * 1000;  // 1시간 (기본값)
  // const TIMEOUT_MS = 30 * 60 * 1000;  // 30분
  // const TIMEOUT_MS = 2 * 60 * 60 * 1000;  // 2시간

  const timeoutDate = new Date(Date.now() - TIMEOUT_MS);

  for (const [userId, context] of this.contexts.entries()) {
    if (context.lastActivity < timeoutDate) {
      this.contexts.delete(userId);
    }
  }
}
```

**자동 정리 주기 변경**:
```typescript
// 파일 하단
if (typeof window === 'undefined') {
  const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;  // 30분 (기본값)
  // const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;  // 10분

  setInterval(() => {
    conversationManager.cleanupOldContexts();
  }, CLEANUP_INTERVAL_MS);
}
```

---

### 4. 제품 추천 로직 커스터마이징

**파일**: `src/lib/shopping-agent.ts`

**제품 개수 제한 변경**:
```typescript
private async prepareContextInfo(context: ConversationContext): Promise<string> {
  // ...

  const PRODUCT_LIMIT = 20;  // 기본값: 20개
  // const PRODUCT_LIMIT = 50;  // 더 많은 제품 표시

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .gt('stock', 0)
    .limit(PRODUCT_LIMIT);

  // ...
}
```

**카테고리 필터링 추가**:
```typescript
private async prepareContextInfo(context: ConversationContext): Promise<string> {
  // 특정 카테고리만 추천
  const ALLOWED_CATEGORIES = ['전자제품', '의류', '식품'];

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .gt('stock', 0)
    .in('category', ALLOWED_CATEGORIES)
    .limit(20);

  // ...
}
```

**자주 구매 제품 개수 변경**:
```typescript
async getUserFrequentProducts(userId: string): Promise<UserPurchaseFrequency[]> {
  // ...

  const FREQUENT_PRODUCT_LIMIT = 10;  // 기본값: 10개
  // const FREQUENT_PRODUCT_LIMIT = 5;   // 더 적은 제품

  const result = Array.from(productFrequency.values())
    .sort(...)
    .slice(0, FREQUENT_PRODUCT_LIMIT);

  return result;
}
```

---

### 5. 에러 처리 커스터마이징

**기본 에러 메시지 변경**:

**shopping-agent.ts**:
```typescript
async processMessage(context: ConversationContext, userMessage: string): Promise<AIResponse> {
  try {
    // ... 로직
  } catch (error) {
    console.error('Shopping agent error:', error);

    // 커스텀 에러 메시지
    return {
      action: 'chat',
      message: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
      // message: 'Sorry, a temporary error occurred. Please try again.',  // 영어
    };
  }
}
```

**재시도 로직 추가**:
```typescript
async processMessage(
  context: ConversationContext,
  userMessage: string,
  retryCount = 0
): Promise<AIResponse> {
  const MAX_RETRIES = 3;

  try {
    // ... 로직
  } catch (error) {
    console.error(`Shopping agent error (attempt ${retryCount + 1}):`, error);

    if (retryCount < MAX_RETRIES) {
      // 재시도
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return this.processMessage(context, userMessage, retryCount + 1);
    }

    return {
      action: 'chat',
      message: '죄송합니다. 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }
}
```

---

### 6. 응답 파싱 커스터마이징

**더 관대한 파싱**:

```typescript
private parseClaudeResponse(content: unknown): AIResponse {
  try {
    let responseText = '';
    if (typeof content === 'string') {
      responseText = content;
    } else if (
      typeof content === 'object' &&
      content !== null &&
      'type' in content &&
      content.type === 'text' &&
      'text' in content
    ) {
      responseText = content.text as string;
    } else {
      throw new Error('Unexpected response format from Claude');
    }

    // JSON 추출 (더 유연한 패턴)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // JSON이 없으면 일반 대화로 처리
      return {
        action: 'chat',
        message: responseText.trim() || '응답을 처리할 수 없습니다.',
      };
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // 기본값 설정
    const action = parsedResponse.action || 'chat';
    const message = parsedResponse.message || '메시지가 없습니다.';
    const products = parsedResponse.products || undefined;

    // 액션 유효성 검증
    const validActions = [
      'recommend',
      'add_to_cart',
      'remove_from_cart',
      'checkout',
      'chat',
    ];

    return {
      action: validActions.includes(action) ? action : 'chat',
      message,
      products,
    };
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return {
      action: 'chat',
      message: '응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
    };
  }
}
```

---

## API 레퍼런스

### ShoppingAgent

#### `processMessage(context, userMessage)`

사용자 메시지를 처리하고 AI 응답을 생성합니다.

**Parameters**:
- `context` (ConversationContext): 대화 컨텍스트
- `userMessage` (string): 사용자 입력 메시지

**Returns**: `Promise<AIResponse>`

**Example**:
```typescript
const agent = new ShoppingAgent();
const response = await agent.processMessage(context, "오늘 저녁 뭐 먹을까?");
console.log(response.message);  // AI 응답 메시지
console.log(response.action);   // 'chat' | 'recommend' | ...
```

---

#### `getUserFrequentProducts(userId)`

사용자의 자주 구매하는 제품을 조회합니다.

**Parameters**:
- `userId` (string): 사용자 ID

**Returns**: `Promise<UserPurchaseFrequency[]>`

**Example**:
```typescript
const frequentProducts = await agent.getUserFrequentProducts('user-123');
console.log(frequentProducts);
// [
//   {
//     product_id: 'prod-1',
//     product_name: '사과',
//     purchase_count: 5,
//     last_purchased: '2025-01-15T10:30:00Z',
//     ...
//   },
//   ...
// ]
```

---

#### `getProductsByIds(productIds)`

제품 ID 목록으로 제품 정보를 조회합니다.

**Parameters**:
- `productIds` (string[]): 제품 ID 배열

**Returns**: `Promise<Product[]>`

**Example**:
```typescript
const products = await agent.getProductsByIds(['prod-1', 'prod-2']);
console.log(products);
// [
//   { id: 'prod-1', name: '사과', price: 3000, stock: 50, ... },
//   { id: 'prod-2', name: '바나나', price: 2000, stock: 30, ... }
// ]
```

---

#### `validateCartItems(cartItems)`

장바구니 아이템의 유효성을 검증합니다 (재고 확인).

**Parameters**:
- `cartItems` (CartItem[]): 장바구니 아이템 배열

**Returns**: `Promise<CartItem[]>` (유효한 아이템만 반환)

**Example**:
```typescript
const validCart = await agent.validateCartItems(cart);
// 재고 부족한 제품은 제외됨
```

---

### ConversationManager

#### `getContext(userId)`

사용자의 대화 컨텍스트를 가져옵니다 (없으면 생성).

**Parameters**:
- `userId` (string): 사용자 ID

**Returns**: `ConversationContext`

**Example**:
```typescript
const context = conversationManager.getContext('user-123');
console.log(context.cart);
console.log(context.conversationHistory);
```

---

#### `addMessage(userId, message)`

대화 히스토리에 메시지를 추가합니다.

**Parameters**:
- `userId` (string): 사용자 ID
- `message` (ChatMessage): 추가할 메시지

**Returns**: `void`

**Example**:
```typescript
conversationManager.addMessage('user-123', {
  id: 'msg-1',
  role: 'user',
  content: '안녕하세요',
  timestamp: new Date(),
});
```

---

#### `addToCart(userId, item)`

장바구니에 제품을 추가합니다.

**Parameters**:
- `userId` (string): 사용자 ID
- `item` (CartItem): 추가할 제품

**Returns**: `CartItem[]` (업데이트된 장바구니)

**Example**:
```typescript
const updatedCart = conversationManager.addToCart('user-123', {
  productId: 'prod-1',
  name: '사과',
  price: 3000,
  quantity: 2,
});
```

---

#### `removeFromCart(userId, productId, quantity?)`

장바구니에서 제품을 제거합니다.

**Parameters**:
- `userId` (string): 사용자 ID
- `productId` (string): 제품 ID
- `quantity` (number, optional): 제거할 수량 (생략 시 전체 제거)

**Returns**: `CartItem[]` (업데이트된 장바구니)

**Example**:
```typescript
// 수량 감소
const cart1 = conversationManager.removeFromCart('user-123', 'prod-1', 1);

// 전체 제거
const cart2 = conversationManager.removeFromCart('user-123', 'prod-1');
```

---

#### `clearCart(userId)`

장바구니를 비웁니다.

**Parameters**:
- `userId` (string): 사용자 ID

**Returns**: `void`

**Example**:
```typescript
conversationManager.clearCart('user-123');
```

---

#### `getCartTotal(userId)`

장바구니 총액을 계산합니다.

**Parameters**:
- `userId` (string): 사용자 ID

**Returns**: `number` (총액)

**Example**:
```typescript
const total = conversationManager.getCartTotal('user-123');
console.log(`총액: ${total.toLocaleString()}원`);
```

---

#### `getCartItemCount(userId)`

장바구니 아이템 개수를 계산합니다.

**Parameters**:
- `userId` (string): 사용자 ID

**Returns**: `number` (총 개수)

**Example**:
```typescript
const count = conversationManager.getCartItemCount('user-123');
console.log(`총 ${count}개`);
```

---

#### `exportContext(userId)`

컨텍스트를 내보냅니다 (영속성 저장용).

**Parameters**:
- `userId` (string): 사용자 ID

**Returns**: `ConversationContext | null`

**Example**:
```typescript
const context = conversationManager.exportContext('user-123');
if (context) {
  // Redis, MongoDB 등에 저장
  await redis.set(`context:${userId}`, JSON.stringify(context));
}
```

---

#### `importContext(userId, context)`

외부 저장소에서 컨텍스트를 가져옵니다.

**Parameters**:
- `userId` (string): 사용자 ID
- `context` (ConversationContext): 가져올 컨텍스트

**Returns**: `void`

**Example**:
```typescript
const savedContext = JSON.parse(await redis.get(`context:${userId}`));
conversationManager.importContext('user-123', savedContext);
```

---

### ClaudeClient

#### `formatConversationHistory(history)`

대화 히스토리를 Claude API 형식으로 포맷팅합니다.

**Parameters**:
- `history` (Array<{role: string, content: string}>): 대화 히스토리

**Returns**: `Anthropic.MessageParam[]`

**Example**:
```typescript
const formatted = formatConversationHistory([
  { role: 'user', content: '안녕' },
  { role: 'assistant', content: '안녕하세요' },
]);
```

---

## 트러블슈팅

### 1. API 키 에러

**증상**: `Error: Missing API key`

**원인**: `ANTHROPIC_API_KEY` 환경 변수 미설정

**해결**:
```bash
# .env.local 파일 확인
ANTHROPIC_API_KEY=sk-ant-api03-...

# 환경 변수 로드 확인 (Node.js)
console.log(process.env.ANTHROPIC_API_KEY);  // undefined이면 문제
```

---

### 2. JSON 파싱 에러

**증상**: `Error parsing Claude response`

**원인**: Claude가 JSON 형식을 정확히 지키지 않음

**해결**:
1. 시스템 프롬프트를 더 명확하게 수정
2. `parseClaudeResponse()` 함수의 에러 처리 강화
3. `temperature` 값을 낮춤 (0.5 이하)

```typescript
export const CLAUDE_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  temperature: 0.3,  // 더 일관된 응답
};
```

---

### 3. 메모리 누수

**증상**: 서버 메모리 사용량이 계속 증가

**원인**: `ConversationManager`의 컨텍스트가 정리되지 않음

**해결**:
1. 자동 정리 주기 확인
2. 수동 정리 호출

```typescript
// 수동 정리
conversationManager.cleanupOldContexts();

// 또는 특정 사용자 컨텍스트 삭제
conversationManager.contexts.delete('user-id');
```

---

### 4. 느린 응답 속도

**증상**: AI 응답이 5초 이상 걸림

**원인**:
- Claude API 응답 지연
- 데이터베이스 쿼리 느림
- 너무 많은 컨텍스트 정보

**해결**:
1. **모델 변경**: Haiku 모델 사용
```typescript
export const CLAUDE_CONFIG = {
  model: 'claude-3-haiku-20240307',  // 더 빠른 응답
  max_tokens: 512,
  temperature: 0.7,
};
```

2. **제품 제한**: 제공하는 제품 개수 줄이기
```typescript
const { data: products } = await supabaseAdmin
  .from('products')
  .select('*')
  .gt('stock', 0)
  .limit(10);  // 20 → 10
```

3. **대화 히스토리 줄이기**:
```typescript
const MAX_MESSAGES = 10;  // 20 → 10
```

---

### 5. 장바구니 동기화 문제

**증상**: UI와 서버의 장바구니 상태가 다름

**원인**: 클라이언트와 서버 간 상태 불일치

**해결**:
1. **매 요청마다 장바구니 전송**:
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: input,
    cart: currentCart,  // 항상 최신 장바구니 전송
  }),
});
```

2. **응답 후 장바구니 업데이트**:
```typescript
const data = await response.json();
if (data.cart) {
  setCart(data.cart);  // 서버 응답의 장바구니로 교체
}
```

---

### 6. CORS 에러 (프론트엔드 분리 시)

**증상**: `Access to fetch at ... from origin ... has been blocked by CORS policy`

**원인**: API와 프론트엔드 도메인이 다름

**해결**:

**Next.js**:
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-frontend.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

**Express.js**:
```typescript
import cors from 'cors';

app.use(cors({
  origin: 'https://your-frontend.com',
  credentials: true,
}));
```

---

### 7. 데이터베이스 연결 에러

**증상**: `Error fetching products: connection timeout`

**원인**:
- 잘못된 데이터베이스 URL
- 네트워크 문제
- RLS 정책 차단

**해결**:
1. **환경 변수 확인**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

2. **RLS 정책 확인** (Supabase):
```sql
-- Service Role Key는 RLS 우회
-- 하지만 테이블에 SELECT 권한이 있는지 확인
SELECT * FROM products LIMIT 1;
```

3. **연결 테스트**:
```typescript
const { data, error } = await supabaseAdmin
  .from('products')
  .select('count');

console.log('Connection test:', { data, error });
```

---

### 8. TypeScript 타입 에러

**증상**: `Property 'xxx' does not exist on type 'yyy'`

**원인**: 타입 정의 불일치

**해결**:
1. **타입 파일 확인**: `src/types/app.ts` 파일이 존재하는지 확인
2. **타입 import**: 필요한 타입을 import 했는지 확인
3. **타입 assertion**: 불가피한 경우 타입 단언 사용

```typescript
// 타입 단언 (최후의 수단)
const product = data as Product;
```

---

## 추가 리소스

### 공식 문서
- [Anthropic Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [Anthropic SDK for TypeScript](https://github.com/anthropics/anthropic-sdk-typescript)
- [Claude Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)

### 커뮤니티
- [Anthropic Discord](https://discord.gg/anthropic)
- [Anthropic Forum](https://community.anthropic.com)

### 샘플 프로젝트
- 원본 프로젝트: `ai-shopping-assistant` (본 프로젝트)
- GitHub Issues: 질문 및 버그 리포트

---

## 라이선스 및 기여

### 라이선스
본 Shopping Agent 코드는 MIT 라이선스를 따릅니다.

### 기여 방법
1. 버그 리포트: GitHub Issues
2. 기능 제안: GitHub Discussions
3. Pull Request 환영

### 연락처
- 프로젝트 관리자: [GitHub Profile]
- 이메일: [your-email@example.com]

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-10-28
**작성자**: Claude Code
