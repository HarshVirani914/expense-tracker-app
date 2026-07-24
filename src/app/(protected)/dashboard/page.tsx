"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetAlertsWidget } from "@/features/budgets/components/budget-alerts-widget";
import { AccountBalances } from "@/features/dashboard/components/account-balances";
import { HeroBalanceCard } from "@/features/dashboard/components/hero-balance-card";
import {
  QuickActionsDesktopTrigger,
  QuickActionsMobileTiles,
  QuickActionsProvider,
} from "@/features/dashboard/components/quick-actions";
import { RecentExpensesList } from "@/features/dashboard/components/recent-expenses-list";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { useDashboardStats } from "@/features/dashboard/hooks";
import { UpcomingRecurringWidget } from "@/features/recurring-expenses/components/upcoming-recurring-widget";
import { useProcessRecurringExpenses } from "@/features/recurring-expenses/hooks";
import { useUser } from "@clerk/nextjs";
import { IconSparkles } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";

// Lazy-load below-fold widgets — defers their JS and API fetches until after
// above-fold content has rendered and hydrated.
const AIInsightsWidget = dynamic(
  () =>
    import("@/features/ai/components/ai-insights-widget").then((m) => ({
      default: m.AIInsightsWidget,
    })),
  { loading: () => <Skeleton className="h-52 w-full" />, ssr: false },
);
const OutstandingDebtsWidget = dynamic(
  () =>
    import("@/features/dashboard/components/outstanding-debts-widget").then(
      (m) => ({ default: m.OutstandingDebtsWidget }),
    ),
  { loading: () => <Skeleton className="h-48 w-full" />, ssr: false },
);
const GroupBalancesSummary = dynamic(
  () =>
    import("@/features/dashboard/components/group-balances-summary").then(
      (m) => ({ default: m.GroupBalancesSummary }),
    ),
  { loading: () => <Skeleton className="h-48 w-full" />, ssr: false },
);

export default function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();
  const { user } = useUser();
  const { processRecurringExpenses } = useProcessRecurringExpenses();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (!hasProcessedRef.current && user) {
      hasProcessedRef.current = true;
      processRecurringExpenses().catch(() => {});
    }
  }, [user, processRecurringExpenses]);

  if (isLoading) {
    return (
      <div className="flex min-w-0 w-full max-w-full flex-col gap-4 md:gap-6 @container/dashboard">
        <Skeleton className="order-1 h-44 w-full rounded-2xl" />
        <Skeleton className="order-2 h-20 w-full" />
        <Skeleton className="order-5 h-28 w-full md:hidden" />
        <div className="order-4 grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 md:order-3 md:gap-6">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
        <div className="order-3 flex flex-col gap-4 @4xl/dashboard:grid @4xl/dashboard:grid-cols-3 @4xl/dashboard:items-start md:order-4 md:gap-6">
          <div className="flex flex-col gap-4 @4xl/dashboard:col-span-2 md:gap-6">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">
          Failed to load dashboard. Please try again.
        </p>
      </div>
    );
  }

  const totalAccountBalance = stats.accounts.reduce(
    (sum, account) => sum + account.currentBalance,
    0,
  );

  return (
    <QuickActionsProvider>
      <>
        <div className="flex min-w-0 w-full max-w-full flex-col gap-4 md:gap-6 @container/dashboard">
          {/* Hero — dark canvas with balance and greeting, always rendered first */}
          <div className="order-1">
            <div className="mb-3 hidden justify-end md:flex">
              <QuickActionsDesktopTrigger />
            </div>
            <HeroBalanceCard
              totalAccountBalance={totalAccountBalance}
              monthlyNet={stats.currentMonth.netBalance}
              totalIncome={stats.currentMonth.totalIncome}
              totalExpenses={stats.currentMonth.totalExpenses}
              userName={user?.firstName ?? undefined}
            />
          </div>

          {/* Stats cards — top spending category (hero covers income/expenses) */}
          <div className="order-2">
            <StatsCards stats={stats.currentMonth} />
          </div>

          {/* Mobile quick actions — below content so recent activity ranks first */}
          <div className="order-5 md:hidden">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick actions
            </p>
            <QuickActionsMobileTiles />
          </div>

          {/* Budget + Recurring widgets */}
          <div className="order-4 grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 md:order-3 md:gap-6">
            <BudgetAlertsWidget />
            <UpcomingRecurringWidget />
          </div>

          {/* Main content grid — recent activity first */}
          <div className="order-3 flex flex-col gap-4 @4xl/dashboard:grid @4xl/dashboard:grid-cols-3 @4xl/dashboard:items-start md:order-4 md:gap-6">
            <div className="flex min-w-0 flex-col gap-4 @4xl/dashboard:col-span-2 md:gap-6">
              <RecentExpensesList expenses={stats.recentExpenses} />
              <AIInsightsWidget />
              <OutstandingDebtsWidget />
            </div>
            <aside className="flex min-w-0 flex-col gap-4 md:gap-6">
              <GroupBalancesSummary />
              <AccountBalances accounts={stats.accounts} />
            </aside>
          </div>
        </div>

        {/* AI FAB — mobile: above bottom nav; desktop: bottom-right */}
        <Link
          href="/ai"
          aria-label="Open AI assistant"
          className="md:hidden fixed right-4 z-50"
          style={{
            bottom: "calc(5rem + env(safe-area-inset-bottom) + 1.25rem)",
          }}
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full glow-primary transition-all active:scale-95 motion-reduce:transition-none motion-reduce:transform-none"
          >
            <IconSparkles className="h-6 w-6" />
          </Button>
        </Link>
        <Link
          href="/ai"
          aria-label="Open AI assistant"
          className="hidden md:block fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full glow-primary transition-all hover:scale-110 motion-reduce:transition-none motion-reduce:transform-none"
          >
            <IconSparkles className="h-6 w-6" />
          </Button>
        </Link>
      </>
    </QuickActionsProvider>
  );
}
