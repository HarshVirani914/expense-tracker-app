# PocketPulse - Expense Tracker PWA

A modern Progressive Web Application for tracking expenses, managing budgets, and monitoring financial health across all your devices.

## Features

### Expense Tracking

- Record income and expenses with amount, category, date, account, payment method (UPI, card, bank transfer, cash), and notes
- Color-coded categories: seeded defaults plus unlimited user-defined categories
- Multiple accounts (savings, current, wallet, credit card, cash) with live balances
- Filterable, searchable expense list — data table on desktop, date-grouped cards on mobile

### Smart Bulk Import (AI)

- **Paste text**: paste one or many bank SMS / payment notifications; Gemini extracts every transaction (amount, merchant, date, category, payment method) and ignores OTPs and promotional messages
- **Screenshots**: upload, drag-drop, clipboard-paste, or camera-capture up to 4 screenshots of SMS threads or banking apps; a vision model reads them directly — no separate OCR step
- **CSV / Excel**: classic import with a downloadable template pre-filled with your categories and accounts
- Every AI import lands in an editable review table with per-row confidence scores and automatic duplicate detection (same amount within one day) before anything is saved
- Export filtered expenses to CSV or Excel

### Groups and Bill Splitting

- Shared expense groups with equal, percentage, or custom splits
- Settlements, outstanding-debt tracking, and per-group balance summaries
- Contacts directory for people you split with

### Budgets, Recurring, and Analytics

- Per-category budgets with progress rings and approaching-limit / over-budget alerts
- Recurring expenses (daily to yearly) with upcoming-payment preview and one-tap processing
- Analytics: spending trends, category breakdown, and month-over-month comparison against the prior period

### AI Assistant

- Conversational assistant (Google Gemini via the Vercel AI SDK) that can query and create expenses with tool calls
- Natural-language expense entry ("450 on Swiggy yesterday, UPI")
- AI-generated spending insights on the dashboard
- Per-user rate limiting and automatic model fallback under load

### Design and Accessibility

- Revolut-inspired design system: cobalt accent, ink-and-cloud neutral surfaces, pill-shaped controls with a soft accent glow, liquid-glass bottom navigation
- Typography tuned for money: Inter for UI, Manrope tabular numerals for balances, JetBrains Mono where code-like text appears
- Full light and dark modes driven by CSS design tokens
- Accessibility-first: labeled icon controls, keyboard-operable cards and navigation, WCAG-conscious contrast, `prefers-reduced-motion` support, pinch-zoom enabled, 36px+ touch targets on mobile

### Progressive Web App

- Installable on mobile and desktop with home-screen shortcuts
- Offline support with a dedicated offline page (Serwist service worker)
- Responsive from 375px phones to wide desktops, with safe-area-aware floating controls
- Optional web push notification support (VAPID)

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- PostgreSQL database
- Clerk account for authentication

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd expense-tracker-app
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard
   - `CLERK_SECRET_KEY`: From Clerk dashboard
   - `GOOGLE_GENERATIVE_AI_API_KEY`: From Google AI Studio (powers smart import, AI chat, and insights)
   - `NEXT_PUBLIC_APP_URL`: Your app URL (use `http://localhost:3000` for local)

4. Set up the database:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed  # Optional: Add sample data
   ```

5. Run the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
pnpm build
pnpm start
```

The PWA features (service worker, offline support) only work in production mode.

## Project Structure

```
├── prisma/              # Database schema and migrations
├── public/              # Static assets and service worker
│   ├── sw.js           # Service worker for PWA
│   └── icons/          # App icons
├── src/
│   ├── app/            # Next.js app router
│   │   ├── (protected)/  # Protected routes (auth required)
│   │   ├── manifest.ts   # PWA manifest
│   │   └── layout.tsx    # Root layout with providers
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   ├── providers/      # Context providers
│   └── server/         # Server-side code
```

## Key Technologies

- **Framework**: Next.js 16.2 with App Router
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (Radix primitives)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk (with webhook-based user sync)
- **AI**: Vercel AI SDK with Google Gemini (structured outputs, vision, tool calling)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts (theme-driven chart palette)
- **PWA**: Serwist service worker + Web App Manifest
- **Typography**: Inter, Manrope, JetBrains Mono (next/font)
- **Theming**: next-themes with oklch design tokens
- **Icons**: Tabler Icons

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:push` - Push schema changes to database
- `pnpm db:reset` - Reset database (dev only)

## Environment Variables

See `.env.example` for all required environment variables.

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini key (required for smart import, AI chat, and insights)

### Optional

- `NEXT_PUBLIC_APP_URL` - App URL for PWA manifest (default: localhost:3000)
- `CLERK_WEBHOOK_SECRET` - For Clerk user-sync webhooks
- `LOG_LEVEL` - Logging level (debug|info|warn|error)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For push notifications
- `VAPID_PRIVATE_KEY` - For push notifications

## PWA Testing

### Desktop (Chrome/Edge)

1. Build and start in production mode
2. Look for install icon in address bar
3. Click to install

### Mobile (Android)

1. Visit app in Chrome
2. Use "Add to Home Screen" from menu

### Mobile (iOS)

1. Visit app in Safari
2. Tap Share → Add to Home Screen

### Offline Testing

1. Open Chrome DevTools → Application → Service Workers
2. Check "Offline" to test offline functionality
3. Visit cached pages and test offline features

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

## License

MIT
