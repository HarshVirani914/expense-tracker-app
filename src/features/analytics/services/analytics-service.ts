import { prisma } from '@/lib/prisma'
import type { AnalyticsData, AnalyticsFilters, SpendingTrend, CategoryBreakdown, MonthlyComparison, AnalyticsInsights } from '../types'
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear, subYears, differenceInDays } from 'date-fns'

const getDateRangeFromTimeRange = (timeRange?: string): { startDate: Date; endDate: Date } => {
  const now = new Date()
  
  switch (timeRange) {
    case 'this-month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      }
    case 'last-month':
      const lastMonth = subMonths(now, 1)
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      }
    case 'this-year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
      }
    case 'last-year':
      const lastYear = subYears(now, 1)
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
      }
    case 'all-time':
      return {
        startDate: new Date(2000, 0, 1),
        endDate: now,
      }
    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      }
  }
}

export const analyticsService = {
  async getAnalytics(userId: string, filters: AnalyticsFilters): Promise<AnalyticsData> {
    let startDate: Date
    let endDate: Date

    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate)
      endDate = new Date(filters.endDate)
    } else if (filters.timeRange) {
      const range = getDateRangeFromTimeRange(filters.timeRange)
      startDate = range.startDate
      endDate = range.endDate
    } else {
      const range = getDateRangeFromTimeRange('this-month')
      startDate = range.startDate
      endDate = range.endDate
    }

    const [spendingTrends, categoryBreakdown, monthlyComparison, insights] = await Promise.all([
      this.getSpendingTrends(userId, startDate, endDate, filters.categoryId),
      this.getCategoryBreakdown(userId, startDate, endDate),
      this.getMonthlyComparison(userId, startDate, endDate),
      this.getInsights(userId, startDate, endDate),
    ])

    return {
      spendingTrends,
      categoryBreakdown,
      monthlyComparison,
      insights,
    }
  },

  async getSpendingTrends(
    userId: string,
    startDate: Date,
    endDate: Date,
    categoryId?: string
  ): Promise<SpendingTrend[]> {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(categoryId && { categoryId }),
      },
      select: {
        date: true,
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    const daysDiff = differenceInDays(endDate, startDate)
    
    if (daysDiff <= 31) {
      const dailyTotals = new Map<string, number>()
      
      expenses.forEach(expense => {
        const dateKey = format(new Date(expense.date), 'yyyy-MM-dd')
        const current = dailyTotals.get(dateKey) || 0
        dailyTotals.set(dateKey, current + Number(expense.amount))
      })

      return Array.from(dailyTotals.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } else {
      const monthlyTotals = new Map<string, number>()
      
      expenses.forEach(expense => {
        const monthKey = format(new Date(expense.date), 'yyyy-MM')
        const current = monthlyTotals.get(monthKey) || 0
        monthlyTotals.set(monthKey, current + Number(expense.amount))
      })

      return Array.from(monthlyTotals.entries())
        .map(([month, amount]) => ({ date: month, amount, month }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
  },

  async getCategoryBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CategoryBreakdown[]> {
    const expenses = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: expenses.map(e => e.categoryId),
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    })

    const categoryMap = new Map(categories.map(c => [c.id, c]))
    const total = expenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0)

    return expenses
      .map(expense => {
        const category = categoryMap.get(expense.categoryId)
        const amount = Number(expense._sum.amount || 0)
        return {
          categoryId: expense.categoryId,
          name: category?.name || 'Unknown',
          color: category?.color || '#9333EA',
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  },

  async getMonthlyComparison(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyComparison[]> {
    const monthsDiff = Math.ceil(differenceInDays(endDate, startDate) / 30)
    
    if (monthsDiff > 12) {
      return []
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: subMonths(startDate, monthsDiff),
          lte: endDate,
        },
      },
      select: {
        date: true,
        amount: true,
      },
    })

    const monthlyTotals = new Map<string, { current: number; previous?: number }>()
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date)
      const monthKey = format(expenseDate, 'MMM yyyy')
      
      if (!monthlyTotals.has(monthKey)) {
        monthlyTotals.set(monthKey, { current: 0 })
      }
      
      const entry = monthlyTotals.get(monthKey)!
      entry.current += Number(expense.amount)
    })

    return Array.from(monthlyTotals.entries())
      .map(([month, data]) => ({
        month,
        current: data.current,
        previous: data.previous,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateA.getTime() - dateB.getTime()
      })
  },

  async getInsights(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsInsights> {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        categoryId: true,
        date: true,
        category: { select: { name: true } },
      },
      orderBy: {
        amount: 'desc',
      },
    })

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const largestExpense = expenses.length > 0 ? Number(expenses[0].amount) : 0

    const categoryCount = new Map<string, { count: number; name: string }>()
    expenses.forEach(expense => {
      const entry = categoryCount.get(expense.categoryId)
      if (entry) {
        entry.count += 1
      } else {
        categoryCount.set(expense.categoryId, { count: 1, name: expense.category.name })
      }
    })

    let mostFrequentCategory = 'N/A'
    let maxCount = 0
    categoryCount.forEach(({ count, name }) => {
      if (count > maxCount) {
        maxCount = count
        mostFrequentCategory = name
      }
    })

    const daysDiff = Math.max(differenceInDays(endDate, startDate), 1)
    const averageDaily = totalAmount / daysDiff
    const averageWeekly = averageDaily * 7
    const averageMonthly = averageDaily * 30

    const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2)
    const firstHalfExpenses = expenses.filter(e => new Date(e.date) < midPoint)
    const secondHalfExpenses = expenses.filter(e => new Date(e.date) >= midPoint)
    
    const firstHalfTotal = firstHalfExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const secondHalfTotal = secondHalfExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

    let trendDirection: 'up' | 'down' | 'stable' = 'stable'
    let trendPercentage = 0

    if (firstHalfTotal > 0) {
      const change = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
      trendPercentage = Math.abs(change)
      
      if (change > 5) {
        trendDirection = 'up'
      } else if (change < -5) {
        trendDirection = 'down'
      }
    }

    return {
      largestExpense,
      mostFrequentCategory,
      averageDaily,
      averageWeekly,
      averageMonthly,
      trendDirection,
      trendPercentage,
    }
  },
}
