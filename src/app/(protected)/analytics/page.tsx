"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeRangeSelector } from "@/features/analytics/components/time-range-selector"
import { SpendingTrendsChart } from "@/features/analytics/components/spending-trends-chart"
import { CategoryBreakdownChart } from "@/features/analytics/components/category-breakdown-chart"
import { MonthlyComparisonChart } from "@/features/analytics/components/monthly-comparison-chart"
import { InsightsSummary } from "@/features/analytics/components/insights-summary"
import { useAnalytics } from "@/features/analytics/hooks"
import type { AnalyticsFilters } from "@/features/analytics/types"

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: 'this-month',
  })

  const { analytics, isLoading } = useAnalytics(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Visualize your spending patterns and gain insights
        </p>
      </div>

      <TimeRangeSelector filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-96" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="space-y-6">
          <InsightsSummary insights={analytics?.insights} isLoading={isLoading} />

          <SpendingTrendsChart 
            data={analytics?.spendingTrends || []} 
            isLoading={isLoading} 
          />

          <div className="grid gap-6 lg:grid-cols-2">
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
