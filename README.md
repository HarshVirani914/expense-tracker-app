# PocketPulse - Expense Tracker PWA

A modern Progressive Web Application for tracking expenses, managing budgets, and monitoring financial health across all your devices.

## Features

- 💰 **Expense Tracking**: Record and categorize expenses with ease
- 👥 **Group Expenses**: Split bills and track shared expenses
- 📊 **Dashboard**: Visual overview of your financial health
- 💳 **Multiple Accounts**: Manage expenses across different accounts
- 📱 **Progressive Web App**: Install on any device for offline access
- 🌓 **Dark Mode**: Automatic theme switching
- 🔒 **Secure**: Built with Clerk authentication
- ⚡ **Fast**: Optimized with React Server Components

## PWA Capabilities

This app is a fully-featured Progressive Web App:

- ✅ **Installable**: Add to home screen on mobile and desktop
- ✅ **Offline Support**: Access your data without internet
- ✅ **Background Sync**: Automatic data sync when back online
- ✅ **App Shortcuts**: Quick actions from home screen
- ✅ **Responsive**: Works seamlessly on all devices
- ✅ **Secure**: HTTPS with security headers

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
- **UI**: React 19, Tailwind CSS 4, Shadcn UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **PWA**: Custom Service Worker + Web App Manifest
- **Theming**: next-themes
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

### Optional

- `NEXT_PUBLIC_APP_URL` - App URL for PWA manifest (default: localhost:3000)
- `LOG_LEVEL` - Logging level (debug|info|warn|error)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For push notifications (future)
- `VAPID_PRIVATE_KEY` - For push notifications (future)

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
