# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev                    # Start dev server with Turbopack (http://localhost:3000)
pnpm build                  # Runs prisma migrate deploy + prisma generate + next build
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database
pnpm db:generate            # Generate Prisma client (run after schema changes)
pnpm db:migrate             # Create and apply new migration (dev)
pnpm db:migrate:deploy      # Apply migrations without creating new ones (prod)
pnpm db:seed                # Seed default categories (idempotent)
pnpm db:studio              # Open Prisma Studio UI
pnpm db:push                # Push schema changes without migration (prototyping)
pnpm db:reset               # Drop and recreate DB + re-run migrations (dev only)

# Utilities
pnpm clerk:sync             # Sync existing Clerk users into the database
```

The PWA service worker is **disabled in dev** (`NODE_ENV !== 'production'`). PWA features only work after `pnpm build && pnpm start`.

## Architecture

### Stack

- **Next.js 16.2** with App Router, React 19, React Compiler enabled
- **PostgreSQL** via Prisma ORM with `@prisma/adapter-pg` (no connection pooling layer needed)
- **Clerk** for authentication — user records are synced to the local DB via webhook at `/api/webhooks/clerk`
- **TanStack Query** for all client-side data fetching and cache management
- **AI SDK** (`ai` + `@ai-sdk/google`) using Google Gemini models
- **Shadcn UI** (radix-luma style, Tabler icons, Tailwind CSS 4)
- **Serwist** for PWA / service worker

### Route layout

All authenticated pages live under `src/app/(protected)/`. The route group itself does not have a layout file; layout components (`app-sidebar.tsx`, `bottom-nav.tsx`, etc.) are colocated in `src/app/(protected)/dashboard/`. Sign-in/sign-up use Clerk's catch-all segments at `src/app/sign-in/[[...sign-in]]/`.

API routes live under `src/app/api/` and follow REST conventions. All routes call `requireCurrentUser()` from `src/lib/auth.ts` as the first step — this function resolves the Clerk session and lazily upserts a local DB user record if one doesn't exist yet.

### Feature module pattern

Each domain (expenses, budgets, categories, groups, contacts, analytics, recurring-expenses, settlements, import-export, ai) is a self-contained feature module under `src/features/<feature>/`:

```
src/features/<feature>/
  components/     # React components for this feature
  hooks/          # TanStack Query hooks (use-<action>-<entity>.ts)
  services/       # Server-side Prisma query logic (called from API routes)
  schemas/        # Zod validation schemas shared between routes and forms
  types/          # TypeScript types for the feature
```

API routes (`src/app/api/<feature>/route.ts`) are thin: they parse/validate the request using the feature's Zod schemas, call the feature's service, and return a typed `ApiResponse<T>` or `PaginatedResponse<T>`.

Client hooks use `apiClient` from `src/lib/api-client.ts` to call these routes. `apiClient` is a typed wrapper around `fetch` that throws `ApiClientError` on non-OK responses.

### Auth / user sync flow

1. On sign-up, Clerk fires a webhook to `/api/webhooks/clerk` → creates DB user.
2. On every server request, `requireCurrentUser()` (or `getCurrentUser()`) resolves Clerk session → looks up DB user → creates one if missing (fallback sync, handles races with P2002 retry).
3. `CLERK_WEBHOOK_SECRET` is required for webhook verification via `verifyWebhook(req)`.

### AI features

AI models live in `src/lib/ai/models.ts`. The default is `gemini-2.5-flash`. A `withModelFallback()` helper tries models in sequence on 503/high-demand errors. Rate limiting is implemented in `src/lib/ai/rate-limiter.ts`.

Features using AI: chat assistant (`/api/chat`), expense parsing, receipt scanning, bulk import parsing, insights generation.

### Feature accents

`src/lib/feature-accents.ts` defines per-route color tokens (`FeatureAccent`) used throughout the UI for icon tints, nav indicators, page ambient backgrounds, and hero gradients. When adding a new route, add its accent to `featureAccents` and to `pathMatchers`.

### Prisma client location

The generated client is at `src/generated/prisma/` (not the default `node_modules/.prisma`). Import from `@/generated/prisma/client`. The singleton instance is at `src/lib/prisma.ts`.

### Currency

The app is INR-first. User-facing money semantics strings (tooltips, subtitles) are centralized in `src/lib/money-semantics.ts` as `MONEY_SEMANTICS` constants — update there rather than scattering strings.

## Environment variables

Required in `.env.local` (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` — for local dev, use `ngrok` + Clerk dashboard webhook config
- `GOOGLE_GENERATIVE_AI_API_KEY` — for AI features (not in `.env.example` but required)
- `NEXT_PUBLIC_APP_URL` — used in PWA manifest metadata

## Shadcn components

Add components with `pnpm dlx shadcn add <component>`. They are placed in `src/components/ui/`. The config in `components.json` uses the `radix-luma` style with Tabler icons.
