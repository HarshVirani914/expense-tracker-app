export type TimeRangeOption = 'this-month' | 'last-month' | 'this-year' | 'last-year' | 'all-time' | 'custom'

export type SpendingTrend = {
  date: string
  amount: number
  month?: string
}

export type CategoryBreakdown = {
  categoryId: string
  name: string
  color: string
  amount: number
  percentage: number
}

export type MonthlyComparison = {
  month: string
  current: number
  previous?: number
}

export type AnalyticsInsights = {
  largestExpense: number
  mostFrequentCategory: string
  averageDaily: number
  averageWeekly: number
  averageMonthly: number
  trendDirection: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export type AnalyticsData = {
  spendingTrends: SpendingTrend[]
  categoryBreakdown: CategoryBreakdown[]
  monthlyComparison: MonthlyComparison[]
  insights: AnalyticsInsights
}

export type AnalyticsFilters = {
  startDate?: string
  endDate?: string
  timeRange?: TimeRangeOption
  categoryId?: string
}
