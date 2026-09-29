# Tasklane Architecture

## Overview
Tasklane is a premium, keyboard-first productivity app built with Next.js 15, TypeScript, and Supabase. The architecture prioritizes performance, offline-first capability, and a delightful user experience.

## Folder Structure
```
tasklane/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard / main view
│   ├── api/                     # API routes for server logic
│   │   ├── tasks/               # Task CRUD endpoints
│   │   ├── types/               # Work type endpoints
│   │   └── auth/                # Authentication
│   └── (dashboard)/             # Grouped routes
│       ├── today/               # Today's view
│       ├── upcoming/            # Upcoming tasks
│       └── overdue/             # Overdue tasks
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Left sidebar with types & nav
│   │   ├── TopBar.tsx           # Header with search & settings
│   │   └── RightRail.tsx        # Focus timer & today's summary
│   ├── tasks/
│   │   ├── TaskCard.tsx         # Task display component
│   │   ├── TaskForm.tsx         # Create/edit task dialog
│   │   ├── QuickAdd.tsx         # Natural language quick add
│   │   └── TaskActions.tsx      # Bulk actions menu
│   ├── views/
│   │   ├── ListView.tsx         # List view with sorting/filtering
│   │   ├── KanbanView.tsx       # Kanban board (dnd-kit)
│   │   ├── CalendarView.tsx     # Calendar with drag reschedule
│   │   └── SmartList.tsx        # Today/Upcoming/Overdue
│   ├── progress/
│   │   ├── ProgressRing.tsx     # Main circular progress
│   │   ├── ProgressBars.tsx     # Per-type bars
│   │   └── StreakCounter.tsx    # Daily/weekly goals
│   ├── focus/
│   │   ├── PomodoroTimer.tsx    # Focus session timer
│   │   └── TimerSettings.tsx    # Config modal
│   ├── insights/
│   │   ├── Dashboard.tsx        # Charts & analytics
│   │   ├── Charts.tsx           # Recharts components
│   │   └── Heatmap.tsx          # 12-week completion heatmap
│   ├── ui/                      # shadcn/ui & primitives
│   │   ├── Dialog.tsx
│   │   ├── Popover.tsx
│   │   ├── Command.tsx
│   │   ├── Tooltip.tsx
│   │   └── Toast.tsx
│   └── common/
│       ├── CommandPalette.tsx   # Cmd+K global search
│       ├── ShortcutCheatsheet.tsx
│       └── Empty.tsx            # Empty state component
├── lib/
│   ├── db/                      # Prisma setup & queries
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── api/                     # API client layer
│   │   ├── tasks.ts
│   │   ├── types.ts
│   │   └── focus.ts
│   ├── auth/                    # Auth utilities (Supabase)
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── hooks.ts
│   ├── store/                   # Zustand stores
│   │   ├── tasks.ts
│   │   ├── ui.ts
│   │   └── preferences.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useQuery.ts
│   │   ├── useTasks.ts
│   │   ├── useFocus.ts
│   │   └── useKeyboard.ts
│   ├── utils/
│   │   ├── nlp.ts              # Natural language parsing
│   │   ├── dates.ts            # Date utilities
│   │   ├── progress.ts         # Progress calculations
│   │   ├── validation.ts       # Zod schemas
│   │   └── cn.ts               # Class name utility
│   └── constants.ts            # Work types, colors, etc.
├── prisma/
│   ├── schema.prisma           # Data model
│   ├── migrations/
│   └── seed.ts                 # Seed script
├── public/
│   ├── manifest.json           # PWA manifest
│   └── service-worker.js       # Offline cache
├── styles/
│   ├── globals.css             # Tailwind imports, tokens
│   └── animations.css          # Custom animations
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── integration/            # Query & store tests
│   └── e2e/                    # Playwright E2E
├── .env.example
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── prettier.config.js
├── eslint.config.js
└── README.md
```

## Data Model (Prisma)

### Core Tables
- **User** — auth via Supabase, with preferences (theme, timer settings)
- **Task** — full task record with all fields
- **WorkType** — predefined and custom work categories
- **Subtask** — checklist items under tasks
- **Tag** — user-created tags
- **FocusSession** — logged Pomodoro sessions
- **Progress** — daily completion metrics for streaks

### Relationships
```
User
  ├─ tasks (1:M)
  ├─ work_types (1:M)
  ├─ tags (1:M)
  ├─ focus_sessions (1:M)
  └─ progress_entries (1:M)

Task
  ├─ subtasks (1:M)
  ├─ tags (M:M)
  └─ work_type (M:1)
```

## State Management

**Zustand Stores** (persisted to localStorage with sync queue)
- `tasksStore` — in-memory task list, optimistic updates
- `uiStore` — view (list/kanban/calendar), filters, sort
- `preferencesStore` — theme, timer config, keyboard shortcuts
- `focusStore` — active session, logged minutes

**TanStack Query** — server sync, background refetch, stale-while-revalidate

## API Layer

Typed, request-response pattern. Each endpoint validates input with Zod.

```typescript
POST /api/tasks          // Create task
GET /api/tasks           // List tasks (filters, sort)
PATCH /api/tasks/:id     // Update task
DELETE /api/tasks/:id    // Delete (soft delete, recovery)
POST /api/tasks/:id/undo // Undo recent action

POST /api/focus/start    // Start Pomodoro
POST /api/focus/pause    // Pause session
POST /api/focus/end      // End & log session

GET /api/insights        // Charts data
GET /api/export          // JSON/CSV export
```

## Key Patterns

### Optimistic Updates
- UI updates immediately on user action
- Zustand store mutation triggers re-render
- Sync to server in background
- Rollback on error with toast notification

### Natural Language Parsing
- Regex + simple tokenizer to extract:
  - Date/time: "tomorrow 3pm", "next Monday"
  - Priority: "!high", "!!", "!!!"
  - Estimate: "~45m", "~1h"
  - Type: "#meetings", "#errands"
  - Tags: custom syntax

### Accessibility
- ARIA labels on all interactive elements
- Focus visible on keyboard nav
- Screen reader announcements for state changes
- Keyboard shortcuts in Command Palette

### Performance
- Virtual scrolling for 200+ tasks
- Memoized components & selectors
- TanStack Query for background sync
- Service Worker for offline cache

## Authentication
- Supabase Auth (email + Google OAuth)
- Row Level Security (RLS) at database level
- Refresh tokens stored in secure HTTP-only cookie

## Deployment
- Vercel (default, optimized for Next.js)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
- Prisma migrations auto-run on build
- PWA installable on all platforms
