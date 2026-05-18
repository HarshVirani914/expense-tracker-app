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
import { QuickActionsDesktopTrigger, QuickActionsMobileTiles, QuickActionsProvider } from "@/features/dashboard/components/quick-actions";
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
      <div className="flex min-w-0 w-full max-w-full flex-col gap-4 md:gap-6 @container/dashboard">
        <div className="order-1 flex flex-col gap-4 @4xl/dashboard:flex-row @4xl/dashboard:items-start @4xl/dashboard:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-8 w-40 min-[480px]:h-9 @xl/dashboard:h-10" />
            <Skeleton className="hidden h-4 w-full max-w-md md:block" />
          </div>
          <Skeleton className="hidden h-10 w-full max-w-xs shrink-0 @4xl/dashboard:block @4xl/dashboard:w-36" />
        </div>

        <Skeleton className="order-2 h-32 w-full md:order-3 md:h-36" />

        <Skeleton className="order-3 h-28 w-full md:hidden" />

        <div className="order-4 grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 @4xl/dashboard:grid-cols-3 md:order-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32 @xl/dashboard:col-span-2 @4xl/dashboard:col-span-1" />
        </div>

        <div className="order-5 grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 md:order-5 md:gap-6">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>

        <div className="order-6 flex flex-col gap-4 @4xl/dashboard:grid @4xl/dashboard:grid-cols-3 @4xl/dashboard:items-start md:gap-6">
          <div className="flex flex-col gap-4 @4xl/dashboard:col-span-2 md:gap-6">
            <Skeleton className="h-72 w-full md:h-80" />
            <Skeleton className="h-56 w-full md:h-64" />
            <Skeleton className="h-64 w-full md:h-72" />
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <Skeleton className="h-56 w-full md:h-64" />
            <Skeleton className="h-56 w-full md:h-64" />
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
          <FeaturePageHero className="order-1 p-3 sm:p-4 md:p-5 @container/hero">
            <div className="flex min-w-0 flex-col gap-3 @4xl/hero:flex-row @4xl/hero:items-start @4xl/hero:justify-between md:gap-4">
              <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight min-[480px]:text-2xl md:text-2xl @xl/hero:text-4xl">
                    Welcome back
                    {user?.firstName ? `, ${user.firstName}` : ""}
                  </h1>
                </div>
                <p className="hidden text-muted-foreground text-sm wrap-break-word md:block @xl/hero:text-base">
                  Here&apos;s an overview of your finances.{" "}
                </p>
              </div>

              <QuickActionsDesktopTrigger className="hidden min-w-0 shrink-0 @md:flex @md:w-full @md:justify-center @4xl/hero:w-auto @4xl/hero:justify-end" />
            </div>
          </FeaturePageHero>

          {showAIPrompts && (
            <Card className="relative order-2 hidden overflow-hidden border shadow-none md:block">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-blue-500/5 to-transparent" />
              <CardContent className="relative p-4">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                      <IconSparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <h3 className="mb-1 text-sm font-semibold">
                          Ask your AI Assistant
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Get instant insights, add expenses, or analyze your
                          spending
                        </p>
                      </div>

                      <Link href="/ai">
                        <Button size="sm" className="gap-2">
                          <IconMessageChatbot className="h-3.5 w-3.5" />
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

          <div className="order-2 md:order-3">
            <HeroBalanceCard
              totalAccountBalance={totalAccountBalance}
              monthlyNet={stats.currentMonth.netBalance}
            />
          </div>

          <div className="order-3 md:hidden">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Quick actions
            </p>
            <QuickActionsMobileTiles />
          </div>

          <div className="order-4 md:order-4">
            <StatsCards stats={stats.currentMonth} />
          </div>

          <div className="order-5 grid grid-cols-1 gap-4 @xl/dashboard:grid-cols-2 md:order-5 md:gap-6">
            <BudgetAlertsWidget />
            <UpcomingRecurringWidget />
          </div>

          <div className="order-6 flex flex-col gap-4 @4xl/dashboard:grid @4xl/dashboard:grid-cols-3 @4xl/dashboard:items-start md:order-6 md:gap-6">
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

        <Link href="/ai" aria-label="Open AI assistant">
          <Button
            size="lg"
            className="fixed right-4 z-50 h-14 w-14 rounded-full shadow-2xl max-md:bottom-24 hover:scale-110 md:bottom-6 md:right-6 transition-all bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <IconSparkles className="h-6 w-6" />
          </Button>
        </Link>
      </>
    </QuickActionsProvider>
  );
}
