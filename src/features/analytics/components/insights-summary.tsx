"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown, IconMinus, IconBulb } from "@tabler/icons-react"
import type { AnalyticsInsights } from "../types"
import { formatCurrencyWithDecimals } from "@/lib/format"
import { MONEY_SEMANTICS } from "@/lib/money-semantics"

type InsightsSummaryProps = {
  insights: AnalyticsInsights | undefined
  isLoading?: boolean
}

export const InsightsSummary = ({ insights, isLoading }: InsightsSummaryProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconBulb className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Insights</h3>
          </div>
          <p className="text-xs text-muted-foreground">{MONEY_SEMANTICS.insightsAnalyticsSubtitle}</p>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconBulb className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Insights</h3>
          </div>
          <p className="text-xs text-muted-foreground">{MONEY_SEMANTICS.insightsAnalyticsSubtitle}</p>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No insights available</p>
          </div>
        </div>
      </Card>
    )
  }

  const getTrendIcon = () => {
    switch (insights.trendDirection) {
      case 'up':
        return <IconTrendingUp className="h-4 w-4" />
      case 'down':
        return <IconTrendingDown className="h-4 w-4" />
      default:
        return <IconMinus className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    switch (insights.trendDirection) {
      case 'up':
        return 'destructive'
      case 'down':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <IconBulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground">{MONEY_SEMANTICS.insightsAnalyticsSubtitle}</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Largest Expense</p>
            <p className="text-2xl font-bold">{formatCurrencyWithDecimals(insights.largestExpense)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Top Category</p>
            <p className="text-2xl font-bold truncate">{insights.mostFrequentCategory}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Spending Trend</p>
            <div className="flex items-center gap-2">
              <Badge variant={getTrendColor()} className="gap-1">
                {getTrendIcon()}
                {insights.trendPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg. Daily</p>
            <p className="text-xl font-semibold">{formatCurrencyWithDecimals(insights.averageDaily)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg. Weekly</p>
            <p className="text-xl font-semibold">{formatCurrencyWithDecimals(insights.averageWeekly)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg. Monthly</p>
            <p className="text-xl font-semibold">{formatCurrencyWithDecimals(insights.averageMonthly)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
