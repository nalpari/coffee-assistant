# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Coffee Assistant with AI**는 AI 기반 커피 추천 및 관리 시스템입니다. Next.js 16, React 19, TypeScript, Tailwind CSS v4, 그리고 shadcn/ui를 활용한 현대적인 풀스택 웹 애플리케이션입니다.

주요 기능:
- **AI 쇼핑 어시스턴트**: Claude AI 기반 대화형 커피 추천 및 주문 시스템
- **주문 관리**: 실시간 주문 상태 추적 및 관리
- **인증 시스템**: Supabase 기반 Google OAuth 인증
- **장바구니**: Zustand 기반 상태 관리로 빠른 장바구니 경험

## Development Commands

**Note: This project uses pnpm as the package manager.**

### Package Manager Setup
```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
```

### Environment Setup
```bash
# Copy environment example file
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
# - ANTHROPIC_API_KEY: Your Anthropic Claude API key
```

### Running the Development Server
```bash
pnpm dev
```
Opens on [http://localhost:3000](http://localhost:3000) with hot module reloading enabled.

### Building for Production
```bash
pnpm build
```
Creates an optimized production build in `.next` directory.

### Starting Production Server
```bash
pnpm start
```
Runs the production build (requires `pnpm build` first).

### Testing
```bash
# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```
Tests are configured with **Vitest** and **Testing Library** for fast, modern testing.

### Linting
```bash
pnpm lint
```
Runs ESLint with Next.js configuration for TypeScript.

### Package Management
```bash
# Add a dependency
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Remove a dependency
pnpm remove <package-name>

# Update dependencies
pnpm update
```

## Project Structure

### App Router Architecture
- **Next.js App Router**: Uses the `app/` directory pattern (not `pages/`)
- **File-based Routing**: Routes are defined by folder structure in `src/app/`
- **Root Layout**: `src/app/layout.tsx` wraps all pages with providers (Auth, Query) and global layout
- **Home Page**: `src/app/page.tsx` contains the landing page component
- **Middleware**: `middleware.ts` handles Supabase session management for all routes

### Directory Structure
```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers and fonts
│   ├── page.tsx              # Home page
│   ├── ai-recommendations/   # AI recommendation page
│   ├── products/[id]/        # Product detail pages
│   ├── orders/               # Order listing and management
│   │   ├── [id]/             # Individual order detail
│   │   └── manage/           # Order management dashboard
│   ├── checkout/             # Checkout flow
│   ├── dashboard/            # User dashboard
│   ├── auth/                 # Authentication pages
│   │   ├── login/            # Login page
│   │   └── callback/         # OAuth callback handler
│   ├── api/                  # API routes
│   │   ├── chat/             # AI chat endpoint
│   │   └── orders/           # Order CRUD endpoints
│   ├── actions/              # Server actions
│   │   ├── order.ts          # Order operations
│   │   └── payment.ts        # Payment processing
│   ├── favicon.ico           # Favicon
│   └── globals.css           # Global styles with Tailwind and CSS variables
│
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx        # Button with variants
│   │   ├── card.tsx          # Card components
│   │   ├── dialog.tsx        # Modal dialogs
│   │   ├── input.tsx         # Input fields
│   │   ├── sheet.tsx         # Side sheets
│   │   ├── badge.tsx         # Badges
│   │   └── tooltip.tsx       # Tooltips
│   ├── auth/                 # Authentication components
│   │   ├── GoogleSignInButton.tsx
│   │   ├── UserProfile.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── LogoutButton.tsx
│   │   └── ProtectedRoute.tsx
│   ├── cart/                 # Shopping cart components
│   │   ├── CartButton.tsx
│   │   ├── CartSheet.tsx
│   │   └── CartItem.tsx
│   ├── menu/                 # Menu display components
│   │   ├── MenuGrid.tsx
│   │   ├── MenuCard.tsx
│   │   ├── CategoryTabs.tsx
│   │   └── LoadingSpinner.tsx
│   ├── product/              # Product components
│   │   └── QuantityControl.tsx
│   ├── orders/               # Order components
│   │   ├── OrderList.tsx
│   │   └── OrderCard.tsx
│   ├── chat/                 # AI chat components
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   ├── layout/               # Layout components
│   │   ├── Header.tsx
│   │   ├── FooterNavigation.tsx
│   │   └── FooterNavButton.tsx
│   └── providers/            # Context providers
│       └── QueryProvider.tsx # TanStack Query provider
│
├── lib/                      # Utility functions and clients
│   ├── utils.ts              # cn() utility for className merging
│   ├── supabase.ts           # Supabase client (client-side)
│   ├── supabase-auth.ts      # Supabase auth helpers
│   ├── supabase-server.ts    # Supabase server client
│   ├── claude-client.ts      # Anthropic Claude API client
│   ├── shopping-agent.ts     # AI shopping agent logic
│   ├── conversation-manager.ts # Conversation state management
│   ├── order-utils.ts        # Order processing utilities
│   ├── payment-utils.ts      # Payment utilities
│   ├── price-utils.ts        # Price calculation utilities
│   └── api/
│       └── menu.ts           # Menu API functions
│
├── hooks/                    # Custom React hooks
│   ├── useCart.ts            # Cart state management hook
│   ├── use-menu-query.ts     # Menu data fetching
│   ├── use-product-query.ts  # Product detail fetching
│   ├── use-orders-query.ts   # Orders data fetching
│   └── use-infinite-scroll.ts # Infinite scroll implementation
│
├── store/                    # Zustand state stores
│   ├── cart-store.ts         # Shopping cart state
│   └── chat-store.ts         # Chat conversation state
│
├── contexts/                 # React contexts
│   └── AuthContext.tsx       # Authentication context
│
├── types/                    # TypeScript type definitions
│   ├── menu.ts               # Menu and product types
│   ├── cart.ts               # Cart item types
│   ├── chat.ts               # Chat message types
│   ├── order.ts              # Order types
│   ├── auth.ts               # Auth types
│   └── shopping-agent.ts     # AI agent types
│
└── data/                     # Mock data and constants
    └── mock-menu.ts          # Mock menu data for development
```

### Import Aliases
- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/store` → `src/store`
- `@/types` → `src/types`
- `@/contexts` → `src/contexts`
- `@/data` → `src/data`
- `@/components/ui` → `src/components/ui`
- Example: `import { Button } from '@/components/ui/button'`

## Technology Stack

### Core Framework
- **Next.js 16.0.0** with React Compiler enabled (`reactCompiler: true`)
- **React 19.2.0** with React DOM 19.2.0
- **TypeScript 5** with strict mode enabled

### Backend & Integration
- **Anthropic Claude API** (`@anthropic-ai/sdk`) - AI-powered shopping assistant
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) - Backend, database, and authentication
  - PostgreSQL database
  - Google OAuth authentication
  - Real-time subscriptions
  - Row Level Security (RLS) policies
- **TanStack Query v5** (`@tanstack/react-query`) - Server state management and data fetching
  - Automatic caching and revalidation
  - Optimistic updates
  - Background refetching
- **Zustand** - Client-side state management
  - Cart state (`cart-store.ts`)
  - Chat conversation state (`chat-store.ts`)

### Styling & UI
- **Tailwind CSS v4** with PostCSS plugin architecture
- **shadcn/ui** - Accessible, customizable React components built with:
  - **Radix UI** - Accessible UI primitives (Dialog, Tooltip, Slot)
  - **class-variance-authority** - Type-safe variant system for components
  - **clsx** + **tailwind-merge** - Efficient className management
  - **tailwindcss-animate** - Pre-built animations
- **Framer Motion** - Advanced animations and transitions
- **Lucide React** - Beautiful, consistent icon library
- **CSS Custom Properties**: Theme variables defined in `src/app/globals.css`
  - Light/Dark mode color schemes with HSL values
  - Semantic color tokens (primary, secondary, accent, destructive, etc.)
  - Border radius variables for consistent styling
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme`
- **Font System**: Geist Sans and Geist Mono loaded via `next/font/google`

### shadcn/ui Configuration
- **Style**: New York style
- **Base Color**: Zinc
- **RSC**: Enabled (React Server Components support)
- **CSS Variables**: Enabled for dynamic theming
- **Component Location**: `src/components/ui/`

### Testing
- **Vitest** - Fast, modern test runner for unit and integration tests
- **Testing Library** - React component testing utilities
  - `@testing-library/react` - React component testing
  - `@testing-library/jest-dom` - DOM matchers
  - `@testing-library/user-event` - User interaction simulation
- **jsdom** - DOM environment for testing

### Code Quality & Package Management
- **ESLint 9** with Next.js TypeScript and Core Web Vitals configurations
- **React Compiler**: Babel plugin for React compilation optimization
- **pnpm** - Fast, disk space efficient package manager
  - Uses content-addressable storage for deduplication
  - Strict node_modules structure prevents phantom dependencies
  - Configured via `.npmrc` for project-specific settings

## Core Features Architecture

### AI Shopping Assistant
**Location**: `src/lib/shopping-agent.ts`, `src/lib/claude-client.ts`

The AI shopping assistant uses Anthropic's Claude API to provide personalized coffee recommendations and handle conversational ordering.

**Key Components**:
- **ShoppingAgent**: Main AI agent class that processes user messages
- **ConversationManager**: Manages conversation history and context
- **Claude Client**: API wrapper with configuration and prompt templates

**Capabilities**:
- Product recommendations based on user preferences
- Natural language ordering (add to cart, checkout)
- Order status inquiries
- Personalized suggestions based on purchase history
- Context-aware responses using conversation history

**Actions**:
- `recommend`: Product recommendations
- `add_to_cart`: Add products to cart
- `remove_from_cart`: Remove products from cart
- `checkout`: Initiate checkout process
- `get_orders`: Fetch user order history
- `get_order_status`: Check specific order status
- `chat`: General conversation

### State Management Architecture

**Client State (Zustand)**:
- `cart-store.ts`: Shopping cart management
  - Add/remove items
  - Update quantities
  - Calculate totals
- `chat-store.ts`: Chat conversation state
  - Message history
  - Loading states
  - Conversation context

**Server State (TanStack Query)**:
- `use-menu-query.ts`: Menu and product data
- `use-product-query.ts`: Individual product details
- `use-orders-query.ts`: Order history and status
- Automatic caching, background refetching, and optimistic updates

### Authentication System
**Location**: `src/lib/supabase-auth.ts`, `src/contexts/AuthContext.tsx`, `middleware.ts`

Supabase-based authentication with Google OAuth.

**Components**:
- **AuthContext**: Global authentication state provider
- **Middleware**: Automatic session management and refresh
- **Protected Routes**: Client-side route protection
- **Google OAuth**: One-click Google sign-in

**Session Management**:
- Automatic token refresh in middleware
- Cookie-based session persistence
- Server and client-side auth helpers

### Order Management System
**Location**: `src/app/api/orders/`, `src/app/actions/order.ts`, `src/types/order.ts`

Complete order lifecycle management from creation to completion.

**Order States**:
- `pending`: Order placed, awaiting confirmation
- `confirmed`: Order confirmed by shop
- `preparing`: Coffee being prepared
- `ready`: Ready for pickup
- `completed`: Order fulfilled
- `cancelled`: Order cancelled

**API Routes**:
- `POST /api/orders`: Create new order
- `GET /api/orders`: List user orders
- `GET /api/orders/[id]`: Get order details
- `PATCH /api/orders/[id]`: Update order status

### Shopping Cart System
**Location**: `src/store/cart-store.ts`, `src/components/cart/`

Zustand-based cart with optimistic updates and persistence.

**Features**:
- Add/remove products
- Quantity controls
- Price calculations (including discounts)
- Side sheet UI with instant updates
- Cart button with item count badge

## Configuration Details

### TypeScript Configuration
- **Target**: ES2017
- **Module Resolution**: `bundler` (modern Next.js approach)
- **JSX**: `react-jsx` (automatic JSX runtime, no React import needed)
- **Strict Mode**: Enabled for type safety
- **Path Aliases**: Configured for `@/*` imports

### Next.js Configuration
- **React Compiler**: Enabled for automatic React optimizations
- **Image Optimization**: Available via `next/image` component
- **Middleware**: Session management for all dynamic routes

### Vitest Configuration
- **Environment**: jsdom (browser-like environment)
- **Globals**: Enabled for Jest-like API
- **Setup**: `vitest.setup.ts` for Testing Library configuration
- **Plugins**: React plugin for JSX support, tsconfig-paths for aliases

### ESLint Configuration
- Uses modern flat config format (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores `.next/`, `out/`, `build/`, and `next-env.d.ts`

### Tailwind CSS Configuration
- **Content Paths**: `src/pages`, `src/components`, `src/app`
- **Theme Extension**:
  - Custom color system with HSL CSS variables
  - Semantic color tokens for consistent theming
  - Chart colors (1-5) for data visualization
  - Dynamic border radius system
- **Plugins**:
  - `tailwindcss-animate` for animation utilities
  - `@tailwindcss/typography` for prose styling

## Key Conventions

### Component Patterns
- Use functional components with TypeScript
- No need to import React explicitly (automatic JSX runtime)
- Prefer Server Components by default (Next.js 13+ App Router pattern)
- Use `'use client'` directive only when needed for interactivity
- React 19 features: Use `use()` hook, Activity API when appropriate

### Styling Patterns
- **Tailwind Utility Classes**: Primary styling approach
- **Dark Mode**: Use `dark:` prefix for dark mode variants
- **CSS Variables**:
  - Theme colors: `--background`, `--foreground`, `--primary`, etc.
  - Fonts: `--font-geist-sans`, `--font-geist-mono`
  - Spacing: `--radius` for border radius
- **Component Variants**: Use `class-variance-authority` for type-safe variants
- **className Utilities**: Use `cn()` from `@/lib/utils` for conditional classes

### Data Fetching Patterns
- **Server Components**: Fetch data directly in async server components
- **Client Components**: Use TanStack Query hooks for client-side fetching
- **API Routes**: Use for operations requiring server-side processing or secrets
- **Server Actions**: Use for mutations (form submissions, data updates)

### State Management Patterns
- **UI State**: React useState, useReducer
- **Client State**: Zustand stores for complex client-side state
- **Server State**: TanStack Query for API data
- **Global State**: React Context for auth and theme

### shadcn/ui Component Usage
- **Import Pattern**: `import { ComponentName } from '@/components/ui/component-name'`
- **Adding Components**: `pnpm dlx shadcn@latest add <component-name>`
- **Customization**: Components are copied to your project and fully customizable
- **Available Components**: Button, Card, Dialog, Input, Sheet, Badge, Tooltip
- **Component Documentation**: https://ui.shadcn.com/docs/components

### File Naming
- React components: PascalCase for component files (e.g., `Button.tsx`)
- Routes: lowercase with hyphens for folders in `app/` (e.g., `ai-recommendations/`)
- Special files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `route.ts`
- Utility files: lowercase with hyphens (e.g., `utils.ts`)
- Type files: lowercase with hyphens (e.g., `shopping-agent.ts`)

### API & Database Conventions
- **Supabase Tables**: Use snake_case for table and column names
- **TypeScript Types**: Use PascalCase for type names, camelCase for properties
- **API Responses**: Return consistent JSON structure with proper HTTP status codes
- **Error Handling**: Use try-catch with meaningful error messages
- **Type Safety**: Define types for all Supabase queries and API responses

### Memo
- 모든 답변과 추론과정은 한국어로 해줘.
- 컴포넌트 작성 코드는 react 19.2 버전으로 최신 기능을 적극적으로 활용해줘. 예) Activity, use hook 등
- 커밋할 때는 반드시 `git commit -m "feat: [커밋 내용]"` 형태로 작성해줘.
- 모든 태스크가 종료될때는 항상 검증 및 테스트 상황에서 실행했던 3000포트 서버 모두 종료해줘.
- supabase 에 명령을 내릴 일이 있다면 가급적 supabase cli를 이용해줘.
