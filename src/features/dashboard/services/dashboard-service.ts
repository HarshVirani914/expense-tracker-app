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

      const [
        personalExpensesStats,
        groupExpensesParticipants,
        incomeStats,
        allExpenses,
        recentExpenses,
        accounts,
      ] = await Promise.all([
        prisma.expense.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            groupId: null,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.expenseParticipant.aggregate({
          where: {
            userId,
            expense: {
              type: 'EXPENSE',
              groupId: { not: null },
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          },
          _sum: {
            paidAmount: true,
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
        prisma.expense.findMany({
          where: {
            userId,
            type: 'EXPENSE',
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            categoryId: true,
            amount: true,
            groupId: true,
            participants: {
              where: { userId },
              select: { paidAmount: true },
            },
          },
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

      const personalExpenses = Number(personalExpensesStats._sum.amount || 0)
      const groupExpensesPaid = Number(groupExpensesParticipants._sum.paidAmount || 0)
      const totalExpenses = personalExpenses + groupExpensesPaid
      const totalIncome = Number(incomeStats._sum.amount || 0)

      const categoryTotals = new Map<string, number>()
      for (const expense of allExpenses) {
        const amount =
          expense.groupId && expense.participants.length > 0
            ? Number(expense.participants[0].paidAmount)
            : Number(expense.amount)

        const currentTotal = categoryTotals.get(expense.categoryId) || 0
        categoryTotals.set(expense.categoryId, currentTotal + amount)
      }

      const sortedCategories = Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const topCategoryIds = sortedCategories.map(([categoryId]) => categoryId)
      const categoriesById =
        topCategoryIds.length === 0
          ? new Map<string, { name: string; color: string }>()
          : new Map(
              (
                await prisma.category.findMany({
                  where: { id: { in: topCategoryIds } },
                  select: { id: true, name: true, color: true },
                })
              ).map((c) => [c.id, { name: c.name, color: c.color }]),
            )

      const categoriesWithNames = sortedCategories.map(([categoryId, total]) => {
        const category = categoriesById.get(categoryId)
        return {
          categoryId,
          name: category?.name ?? 'Unknown',
          color: category?.color ?? '#6B7280',
          total,
        }
      })

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
