"use client";

import { AccountBalances } from "@/features/dashboard/components/account-balances";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentExpensesList } from "@/features/dashboard/components/recent-expenses-list";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { useDashboardStats } from "@/features/dashboard/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
      <div className="flex flex-col md:flex-row gap-4 items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your finances.
          </p>
        </div>
        <QuickActions />
      </div>

      <StatsCards stats={stats.currentMonth} />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentExpensesList expenses={stats.recentExpenses} />
        <AccountBalances accounts={stats.accounts} />
      </div>
    </div>
  );
}
