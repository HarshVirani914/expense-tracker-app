"use client";

import { FeaturePageHero } from "@/components/layout/feature-page-hero";
import { Skeleton } from "@/components/ui/skeleton"
import { TimeRangeSelector } from "@/features/analytics/components/time-range-selector"
import { SpendingTrendsChart } from "@/features/analytics/components/spending-trends-chart"
import { CategoryBreakdownChart } from "@/features/analytics/components/category-breakdown-chart"
import { MonthlyComparisonChart } from "@/features/analytics/components/monthly-comparison-chart"
import { InsightsSummary } from "@/features/analytics/components/insights-summary"
import { useAnalytics } from "@/features/analytics/hooks"
import { MONEY_SEMANTICS } from "@/lib/money-semantics"
import type { AnalyticsFilters } from "@/features/analytics/types";
import { useState } from "react";

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: 'this-month',
  })

  const { analytics, isLoading } = useAnalytics(filters)

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
      <FeaturePageHero className="p-4 sm:p-5">
        <div className="min-w-0 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {MONEY_SEMANTICS.analyticsPageSubtitle}
          </p>
        </div>
      </FeaturePageHero>

      <TimeRangeSelector filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="min-w-0 space-y-6">
          <Skeleton className="h-96" />
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="min-w-0 space-y-6">
          <InsightsSummary insights={analytics?.insights} isLoading={isLoading} />

          <SpendingTrendsChart 
            data={analytics?.spendingTrends || []} 
            isLoading={isLoading} 
          />

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <CategoryBreakdownChart 
              data={analytics?.categoryBreakdown || []} 
              isLoading={isLoading} 
            />
            
            <MonthlyComparisonChart 
              data={analytics?.monthlyComparison || []} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
