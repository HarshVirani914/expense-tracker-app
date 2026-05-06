import { accountService } from '@/features/accounts/services/account-service'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type { DashboardStats } from '../types'

export const dashboardService = {
  async getStats(userId: string): Promise<DashboardStats> {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

      const [expensesStats, incomeStats, topCategoriesData, recentExpenses, accounts] =
        await Promise.all([
          prisma.expense.aggregate({
            where: {
              userId,
              type: 'EXPENSE',
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          }),
          prisma.expense.aggregate({
            where: {
              userId,
              type: 'INCOME',
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          }),
          prisma.expense.groupBy({
            by: ['categoryId'],
            where: {
              userId,
              type: 'EXPENSE',
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
            orderBy: {
              _sum: {
                amount: 'desc',
              },
            },
            take: 5,
          }),
          prisma.expense.findMany({
            where: { userId },
            include: {
              category: true,
              account: true,
              group: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { date: 'desc' },
            take: 10,
          }),
          accountService.list(userId),
        ])

      const totalExpenses = Number(expensesStats._sum.amount || 0)
      const totalIncome = Number(incomeStats._sum.amount || 0)

      const categoriesWithNames = await Promise.all(
        topCategoriesData.map(async (item) => {
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId },
            select: { name: true, color: true },
          })
          return {
            categoryId: item.categoryId,
            name: category?.name || 'Unknown',
            color: category?.color || '#6B7280',
            total: Number(item._sum.amount || 0),
          }
        })
      )

      return {
        currentMonth: {
          totalExpenses,
          totalIncome,
          netBalance: totalIncome - totalExpenses,
          topCategories: categoriesWithNames,
        },
        recentExpenses,
        accounts,
      }
    } catch (error) {
      logger.error('Failed to get dashboard stats', { error, userId })
      throw new Error('Failed to fetch dashboard statistics')
    }
  },
}
