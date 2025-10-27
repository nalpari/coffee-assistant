# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Coffee Assistant with AI**는 AI 기반 커피 추천 및 관리 시스템입니다. Next.js 16, React 19, TypeScript, Tailwind CSS v4, 그리고 shadcn/ui를 활용한 현대적인 풀스택 웹 애플리케이션입니다.

## Development Commands

**Note: This project uses pnpm as the package manager.**

### Package Manager Setup
```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
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
- **Root Layout**: `src/app/layout.tsx` wraps all pages with Geist fonts and base HTML structure
- **Home Page**: `src/app/page.tsx` contains the landing page component

### Directory Structure
```
src/
├── app/                # Next.js App Router
│   ├── layout.tsx      # Root layout with fonts and metadata
│   ├── page.tsx        # Home page
│   ├── favicon.ico     # Favicon
│   └── globals.css     # Global styles with Tailwind and CSS variables
├── components/         # React components
│   └── ui/             # shadcn/ui components
│       └── button.tsx  # Button component with variants
└── lib/                # Utility functions
    └── utils.ts        # cn() utility for className merging
```

### Import Aliases
- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/components/ui` → `src/components/ui`
- Example: `import { Button } from '@/components/ui/button'`

## Technology Stack

### Core Framework
- **Next.js 16.0.0** with React Compiler enabled (`reactCompiler: true`)
- **React 19.2.0** with React DOM 19.2.0
- **TypeScript 5** with strict mode enabled

### Styling & UI
- **Tailwind CSS v4** with PostCSS plugin architecture
- **shadcn/ui** - Accessible, customizable React components built with:
  - **Radix UI** (`@radix-ui/react-slot`) - Accessible UI primitives
  - **class-variance-authority** - Type-safe variant system for components
  - **clsx** + **tailwind-merge** - Efficient className management
  - **tailwindcss-animate** - Pre-built animations
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

### Code Quality & Package Management
- **ESLint 9** with Next.js TypeScript and Core Web Vitals configurations
- **React Compiler**: Babel plugin for React compilation optimization
- **pnpm**: Fast, disk space efficient package manager
  - Uses content-addressable storage for deduplication
  - Strict node_modules structure prevents phantom dependencies
  - Configured via `.npmrc` for project-specific settings

## Configuration Details

### TypeScript Configuration
- **Target**: ES2017
- **Module Resolution**: `bundler` (modern Next.js approach)
- **JSX**: `react-jsx` (automatic JSX runtime, no React import needed)
- **Strict Mode**: Enabled for type safety

### Next.js Configuration
- **React Compiler**: Enabled for automatic React optimizations
- **Image Optimization**: Available via `next/image` component

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

### Styling Patterns
- **Tailwind Utility Classes**: Primary styling approach
- **Dark Mode**: Use `dark:` prefix for dark mode variants
- **CSS Variables**:
  - Theme colors: `--background`, `--foreground`, `--primary`, etc.
  - Fonts: `--font-geist-sans`, `--font-geist-mono`
  - Spacing: `--radius` for border radius
- **Component Variants**: Use `class-variance-authority` for type-safe variants
- **className Utilities**: Use `cn()` from `@/lib/utils` for conditional classes

### shadcn/ui Component Usage
- **Import Pattern**: `import { ComponentName } from '@/components/ui/component-name'`
- **Adding Components**: `pnpm dlx shadcn@latest add <component-name>`
- **Customization**: Components are copied to your project and fully customizable
- **Available Components**: Button (currently installed)
- **Component Documentation**: https://ui.shadcn.com/docs/components

### File Naming
- React components: PascalCase for component files (e.g., `Button.tsx`)
- Routes: lowercase with hyphens for folders in `app/` (e.g., `coffee-list/`)
- Special files: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, etc.
- Utility files: lowercase with hyphens (e.g., `utils.ts`)

### Memo
- 모든 답변과 추론과정은 한국어로 해줘.
- 컴포넌트 작성 코드는 react 19.2 버전으로 최신 기능을 적극적으로 활용해줘. 예) Activity, use hook 등
- 커밋할 때는 반드시 `git commit -m "feat: [커밋 내용]"` 형태로 작성해줘.
- 모든 태스크가 종료될때는 항상 검증 및 테스트 상황에서 실행했던 서버 모두 종료해줘.