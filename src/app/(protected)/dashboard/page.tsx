"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountBalances } from "@/features/dashboard/components/account-balances";
import { GroupBalancesSummary } from "@/features/dashboard/components/group-balances-summary";
import { HeroBalanceCard } from "@/features/dashboard/components/hero-balance-card";
import { OutstandingDebtsWidget } from "@/features/dashboard/components/outstanding-debts-widget";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentExpensesList } from "@/features/dashboard/components/recent-expenses-list";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { useDashboardStats } from "@/features/dashboard/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@clerk/nextjs";
import { BudgetAlertsWidget } from "@/features/budgets/components/budget-alerts-widget";
import { UpcomingRecurringWidget } from "@/features/recurring-expenses/components/upcoming-recurring-widget";
import { useProcessRecurringExpenses } from "@/features/recurring-expenses/hooks";

export default function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { processRecurringExpenses } = useProcessRecurringExpenses();
  const hasProcessedRef = useRef(false);

  // Auto-process recurring expenses when dashboard loads (once per session)
  useEffect(() => {
    if (!hasProcessedRef.current && user) {
      hasProcessedRef.current = true;
      processRecurringExpenses().catch(() => {
        // Silently fail - processing errors shouldn't break the dashboard
      });
    }
  }, [user, processRecurringExpenses]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {!isMobile && (
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        )}

        <Skeleton className="h-40 w-full" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32 sm:col-span-2 lg:col-span-1" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
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

  return (
    <div className="flex flex-col gap-6">
      {!isMobile && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back! {user?.firstName || ""} 👋
            </h1>

            <p className="text-muted-foreground text-base">
              Here&apos;s an overview of your finances
            </p>
          </div>
          <QuickActions />
        </div>
      )}

      <HeroBalanceCard
        balance={stats.currentMonth.netBalance}
        income={stats.currentMonth.totalIncome}
        expenses={stats.currentMonth.totalExpenses}
      />

      {isMobile && <QuickActions />}

      <StatsCards stats={stats.currentMonth} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetAlertsWidget />
        <UpcomingRecurringWidget />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentExpensesList expenses={stats.recentExpenses} />
        <GroupBalancesSummary />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OutstandingDebtsWidget />
        <AccountBalances accounts={stats.accounts} />
      </div>
    </div>
  );
}
