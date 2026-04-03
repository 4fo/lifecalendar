# Agent Guidelines for Life Calendar

This document provides guidelines for AI agents working on the Life Calendar codebase.

## Project Overview

- **Name:** Life Calendar
- **Type:** React + TypeScript webapp
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Supabase
- **Deployment:** GitHub Pages (https://4fo.github.io/lifecalendar)
- **Repository:** https://github.com/4fo/lifecalendar

## Build & Development Commands

```bash
# Development
npm run dev              # Start Vite dev server on port 5173
npm run build            # TypeScript check + production build
npm run preview          # Preview production build locally

# Linting
npm run lint             # Run ESLint with strict rules

# Deployment
npm run deploy           # Build and deploy to gh-pages branch
```

**Note:** No test framework is currently configured. Tests can be added if needed.

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and return values when not obvious
- Prefer `interface` over `type` for object shapes
- Use strict null checks - avoid `null | undefined` where possible
- Prefer generic types over `any`

### React Components

- Use functional components with hooks exclusively
- Use `.tsx` extension for components with JSX
- Name components PascalCase (e.g., `LifeCalendar.tsx`)
- Keep components focused - single responsibility principle
- Extract reusable logic into custom hooks

### Imports

- Group imports in this order:
  1. External libraries (react, react-router-dom, etc.)
  2. Internal components/hooks (from ./components, ./hooks)
  3. Utilities (from ./utils, ./services)
  4. Types (from ./types)
  5. Relative imports for shared code

Example:
```typescript
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getWeekRange, getCurrentWeekNumber } from '../utils/dateUtils';
import { Event, CATEGORIES } from '../types';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `LifeCalendar`, `EventModal` |
| Functions | camelCase | `getWeekRange`, `toggleBatch` |
| Variables | camelCase | `currentYear`, `isExpanded` |
| Constants | UPPER_SNAKE_CASE | `MAX_LIFE_SPAN`, `DEFAULT_WEEK_START` |
| Interfaces | PascalCase with `I` prefix (optional) | `EventProps`, `WeekData` |
| CSS Classes | kebab-case (Tailwind) | `flex items-center gap-2` |

### Error Handling

- Use try/catch for async operations, especially API calls
- Display user-friendly error messages in UI
- Log errors to console for debugging
- Handle Supabase errors gracefully with fallback to local state

### State Management

- Use React Context (`AppContext.tsx`) for global state
- Use local `useState` for component-specific state
- Use `useMemo` for expensive calculations
- Use `useCallback` for callback functions passed to children

### Tailwind CSS

- Use responsive prefixes (`sm:`, `md:`, `lg:`) for responsive design
- Prefer utility classes over custom CSS
- Use `dark:` prefix for dark mode variants
- Keep mobile-first approach

Example:
```jsx
<div className="flex items-center gap-2 p-2 sm:p-4 dark:bg-gray-800" />
```

## Project Structure

```
lifecalendar/
├── src/
│   ├── components/       # React components
│   │   ├── LifeCalendar.tsx
│   │   ├── EventModal.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── store/            # React Context
│   │   └── AppContext.tsx
│   ├── utils/            # Utility functions
│   │   └── dateUtils.ts
│   ├── services/         # API/Auth services
│   │   ├── auth.ts
│   │   └── sync.ts
│   ├── lib/              # Library configs
│   │   └── supabase.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Git & Deployment Workflow

1. **Create a branch** for new features/fixes
2. **Make changes** following code style guidelines
3. **Commit** with clear, descriptive messages
4. **Push** to trigger GitHub Actions workflow
5. **Workflow** automatically deploys to GitHub Pages

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main` and deploys to the `gh-pages` branch.

## Common Tasks

### Adding a new component
1. Create file in `src/components/`
2. Use functional component pattern with TypeScript props
3. Export as default if it's the main export
4. Import in parent component

### Modifying calendar logic
- Calendar rendering is in `src/components/LifeCalendar.tsx`
- Date utilities are in `src/utils/dateUtils.ts`
- Week calculations use ISO week numbering by default

### Supabase integration
- Client configured in `src/lib/supabase.ts`
- Auth service in `src/services/auth.ts`
- Sync service in `src/services/sync.ts`

## Key Files

| File | Purpose |
|------|---------|
| `LifeCalendar.tsx` | Main calendar grid rendering |
| `AppContext.tsx` | Global state management |
| `dateUtils.ts` | Week number, date range calculations |
| `supabase.ts` | Supabase client configuration |
| `App.tsx` | Main layout and routing |

## Important Notes

- Week blocks use `flex-1` with `min-w-[3px]` to ensure all 52 weeks render
- Life span defaults to 90 years (configurable in settings)
- Dark mode is supported via Tailwind's dark mode
- The app is deployed to `/lifecalendar/` subdirectory (configured in vite.config.ts)