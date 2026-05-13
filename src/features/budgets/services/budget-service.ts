import { prisma } from '@/lib/prisma'
import type { BudgetWithCategory, BudgetWithSpending, BudgetAlert, Budget } from '../types'
import type { CreateBudgetInput, UpdateBudgetInput } from '../schemas'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths } from 'date-fns'
import { formatCurrencyWithDecimals } from '@/lib/format'

export const budgetService = {
  async list(userId: string): Promise<BudgetWithSpending[]> {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const budgetsWithSpending = await Promise.all(
      budgets.map(async budget => {
        const { spent, remaining, percentageUsed, status } = await this.calculateSpending({
          ...budget,
          amount: Number(budget.amount),
        } as Budget)
        return {
          ...budget,
          amount: Number(budget.amount),
          spent,
          remaining,
          percentageUsed,
          status,
        }
      })
    )

    return budgetsWithSpending as BudgetWithSpending[]
  },

  async getById(id: string, userId: string): Promise<BudgetWithSpending | null> {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    })

    if (!budget) {
      return null
    }

    const { spent, remaining, percentageUsed, status } = await this.calculateSpending({
      ...budget,
      amount: Number(budget.amount),
    } as Budget)

    return {
      ...budget,
      amount: Number(budget.amount),
      period: budget.period as 'WEEKLY' | 'MONTHLY',
      spent,
      remaining,
      percentageUsed,
      status,
    }
  },

  async create(userId: string, data: CreateBudgetInput) {
    const startDate = new Date(data.startDate)

    let endDate: Date
    if (data.period === 'WEEKLY') {
      endDate = endOfWeek(startDate)
    } else {
      endDate = endOfMonth(startDate)
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: data.categoryId,
        period: data.period,
      },
    })

    if (existingBudget) {
      throw new Error(`A ${data.period.toLowerCase()} budget already exists for this category`)
    }

    return prisma.budget.create({
      data: {
        userId,
        amount: Number(data.amount),
        period: data.period,
        categoryId: data.categoryId,
        startDate,
        endDate,
      },
    })
  },

  async update(id: string, userId: string, data: UpdateBudgetInput) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!budget) {
      throw new Error('Budget not found')
    }

    const updateData: any = {}

    if (data.amount !== undefined) {
      updateData.amount = data.amount
    }

    if (data.period !== undefined) {
      updateData.period = data.period
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId
    }

    if (data.startDate !== undefined) {
      const startDate = new Date(data.startDate)
      updateData.startDate = startDate

      const period = data.period || budget.period
      if (period === 'WEEKLY') {
        updateData.endDate = endOfWeek(startDate)
      } else {
        updateData.endDate = endOfMonth(startDate)
      }
    }

    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null
    }

    return prisma.budget.update({
      where: { id },
      data: updateData,
    })
  },

  async delete(id: string, userId: string): Promise<void> {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!budget) {
      throw new Error('Budget not found')
    }

    await prisma.budget.delete({
      where: { id },
    })
  },

  async calculateSpending(budget: Budget | BudgetWithCategory): Promise<{
    spent: number
    remaining: number
    percentageUsed: number
    status: 'safe' | 'warning' | 'exceeded'
  }> {
    let periodStart: Date
    let periodEnd: Date
    const now = new Date()

    if (budget.period === 'WEEKLY') {
      periodStart = startOfWeek(now)
      periodEnd = endOfWeek(now)
    } else {
      periodStart = startOfMonth(now)
      periodEnd = endOfMonth(now)
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: budget.userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        amount: true,
      },
    })

    const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
    const remaining = Number(budget.amount) - spent
    const percentageUsed = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0

    let status: 'safe' | 'warning' | 'exceeded' = 'safe'
    if (percentageUsed >= 100) {
      status = 'exceeded'
    } else if (percentageUsed >= 80) {
      status = 'warning'
    }

    return {
      spent,
      remaining,
      percentageUsed,
      status,
    }
  },

  async checkBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
    const budgets = await this.list(userId)
    const alerts: BudgetAlert[] = []

    for (const budget of budgets) {
      if (budget.status === 'exceeded') {
        alerts.push({
          budget,
          alertType: 'exceeded',
          message: `You've exceeded your ${budget.period.toLowerCase()} budget for ${budget.category.name} by ${formatCurrencyWithDecimals(Math.abs(budget.remaining))}`,
        })
      } else if (budget.status === 'warning') {
        alerts.push({
          budget,
          alertType: 'warning',
          message: `You've used ${budget.percentageUsed.toFixed(1)}% of your ${budget.period.toLowerCase()} budget for ${budget.category.name}`,
        })
      }
    }

    return alerts
  },
}
