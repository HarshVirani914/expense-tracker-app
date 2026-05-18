"use client";

import { FeaturePageHero } from "@/components/layout/feature-page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AIInsightsWidget } from "@/features/ai/components/ai-insights-widget";
import { BudgetAlertsWidget } from "@/features/budgets/components/budget-alerts-widget";
import { AccountBalances } from "@/features/dashboard/components/account-balances";
import { GroupBalancesSummary } from "@/features/dashboard/components/group-balances-summary";
import { HeroBalanceCard } from "@/features/dashboard/components/hero-balance-card";
import { OutstandingDebtsWidget } from "@/features/dashboard/components/outstanding-debts-widget";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentExpensesList } from "@/features/dashboard/components/recent-expenses-list";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { useDashboardStats } from "@/features/dashboard/hooks";
import { UpcomingRecurringWidget } from "@/features/recurring-expenses/components/upcoming-recurring-widget";
import { useProcessRecurringExpenses } from "@/features/recurring-expenses/hooks";
import { useUser } from "@clerk/nextjs";
import { IconMessageChatbot, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function DashboardPage() {
  const { stats, isLoading, error } = useDashboardStats();
  const { user } = useUser();
  const { processRecurringExpenses } = useProcessRecurringExpenses();
  const hasProcessedRef = useRef(false);
  const [showAIPrompts, setShowAIPrompts] = useState(true);

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
      <div className="flex min-w-0 w-full max-w-full flex-col gap-6 @container/dashboard">
        <div className="flex flex-col gap-4 @4xl/dashboard:flex-row @4xl/dashboard:items-start @4xl/dashboard:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-9 w-48 min-[480px]:h-10 @xl/dashboard:h-11" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-10 w-full max-w-xs shrink-0 @4xl/dashboard:w-36" />
        </div>

        <Skeleton className="h-28 w-full" />

        <Skeleton className="h-40 w-full" />

        <div className="grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 @4xl/dashboard:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32 @xl/dashboard:col-span-2 @4xl/dashboard:col-span-1" />
        </div>

        <div className="grid grid-cols-1 gap-6 @xl/dashboard:grid-cols-2">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>

        <div className="flex flex-col gap-6 @4xl/dashboard:grid @4xl/dashboard:grid-cols-3 @4xl/dashboard:items-start @4xl/dashboard:gap-6">
          <div className="flex flex-col gap-6 @4xl/dashboard:col-span-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
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
    <>
      <div className="flex min-w-0 w-full max-w-full flex-col gap-6 @container/dashboard">
        <FeaturePageHero className="p-4 sm:p-5 @container/hero">
          <div className="flex min-w-0 flex-col gap-4 @4xl/hero:flex-row @4xl/hero:items-start @4xl/hero:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight min-[480px]:text-3xl @xl/hero:text-4xl">
                  Welcome back
                  {user?.firstName ? `, ${user.firstName}` : ""}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm wrap-break-word @xl/hero:text-base">
                Here&apos;s an overview of your finances.{" "}
              </p>
            </div>

            <div className="flex min-w-0 w-full shrink-0 justify-end @4xl/hero:w-auto">
              <QuickActions />
            </div>
          </div>
        </FeaturePageHero>

        {showAIPrompts && (
          <Card className="relative overflow-hidden border shadow-none">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-blue-500/5 to-transparent" />
            <CardContent className="relative p-4">
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <IconSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">
                        Ask your AI Assistant
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Get instant insights, add expenses, or analyze your
                        spending
                      </p>
                    </div>

                    <Link href="/ai">
                      <Button size="sm" className="gap-2">
                        <IconMessageChatbot className="w-3.5 h-3.5" />
                        Open AI Chat
                      </Button>
                    </Link>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIPrompts(false)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <HeroBalanceCard
          totalAccountBalance={totalAccountBalance}
          monthlyNet={stats.currentMonth.netBalance}
        />

        <StatsCards stats={stats.currentMonth} />

        <div className="grid grid-cols-1 gap-6 @xl/dashboard:grid-cols-2">
          <BudgetAlertsWidget />
          <UpcomingRecurringWidget />
        </div>

        <div className="flex flex-col gap-6 @4xl/dashboard:grid @4xl/dashboard:grid-cols-3 @4xl/dashboard:items-start">
          <div className="flex min-w-0 flex-col gap-6 @4xl/dashboard:col-span-2">
            <RecentExpensesList expenses={stats.recentExpenses} />
            <AIInsightsWidget />
            <OutstandingDebtsWidget />
          </div>
          <aside className="flex flex-col gap-6 min-w-0">
            <GroupBalancesSummary />
            <AccountBalances accounts={stats.accounts} />
          </aside>
        </div>
      </div>

      {/* Floating AI Assistant Button */}
      <Link href="/ai">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 hover:scale-110 transition-all bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <IconSparkles className="h-6 w-6" />
        </Button>
      </Link>
    </>
  );
}
