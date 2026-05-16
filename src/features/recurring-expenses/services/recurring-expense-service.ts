import { prisma } from '@/lib/prisma'
import type { RecurringExpenseWithRelations, UpcomingRecurrence, RecurringExpense } from '../types'
import type { CreateRecurringExpenseInput, UpdateRecurringExpenseInput } from '../schemas'
import { addDays, addWeeks, addMonths, addYears, differenceInDays } from 'date-fns'
import { logger } from '@/lib/logger'

export const recurringExpenseService = {
  calculateNextDate(frequency: string, currentDate: Date, customDays?: number | null): Date {
    const date = new Date(currentDate)

    switch (frequency) {
      case 'DAILY':
        return addDays(date, 1)
      case 'WEEKLY':
        return addWeeks(date, 1)
      case 'MONTHLY':
        return addMonths(date, 1)
      case 'YEARLY':
        return addYears(date, 1)
      case 'CUSTOM':
        return addDays(date, customDays || 1)
      default:
        return addDays(date, 1)
    }
  },

  async list(userId: string) {
    const results = await prisma.recurringExpense.findMany({
      where: { userId },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return results.map(r => ({ ...r, amount: Number(r.amount) }))
  },

  async getById(id: string, userId: string) {
    const result = await prisma.recurringExpense.findFirst({
      where: { id, userId },
      include: {
        category: true,
        account: true,
      },
    })
    return result ? { ...result, amount: Number(result.amount) } : null
  },

  async create(userId: string, data: CreateRecurringExpenseInput) {
    const startDate = new Date(data.startDate)
    const nextDate = this.calculateNextDate(data.frequency, startDate, data.customDays)

    return prisma.recurringExpense.create({
      data: {
        userId,
        amount: data.amount,
        description: data.description || null,
        type: data.type,
        frequency: data.frequency,
        customDays: data.customDays || null,
        startDate,
        endDate: data.endDate ? new Date(data.endDate) : null,
        nextDate,
        categoryId: data.categoryId,
        accountId: data.accountId || null,
        isActive: true,
      },
    })
  },

  async update(
    id: string,
    userId: string,
    data: UpdateRecurringExpenseInput
  ) {
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: { id, userId },
    })

    if (!recurringExpense) {
      throw new Error('Recurring expense not found')
    }

    const updateData: any = {}

    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.description !== undefined) updateData.description = data.description
    if (data.type !== undefined) updateData.type = data.type
    if (data.frequency !== undefined) updateData.frequency = data.frequency
    if (data.customDays !== undefined) updateData.customDays = data.customDays
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.accountId !== undefined) updateData.accountId = data.accountId
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    if (data.startDate !== undefined) {
      updateData.startDate = new Date(data.startDate)
    }

    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null
    }

    if (data.frequency !== undefined || data.customDays !== undefined || data.startDate !== undefined) {
      const frequency = data.frequency || recurringExpense.frequency
      const customDays = data.customDays !== undefined ? data.customDays : recurringExpense.customDays
      const baseDate = data.startDate ? new Date(data.startDate) : recurringExpense.nextDate

      updateData.nextDate = this.calculateNextDate(frequency, baseDate, customDays)
    }

    return prisma.recurringExpense.update({
      where: { id },
      data: updateData,
    })
  },

  async delete(id: string, userId: string): Promise<void> {
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: { id, userId },
    })

    if (!recurringExpense) {
      throw new Error('Recurring expense not found')
    }

    await prisma.recurringExpense.delete({
      where: { id },
    })
  },

  async toggleActive(id: string, userId: string): Promise<RecurringExpense> {
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: { id, userId },
    })

    if (!recurringExpense) {
      throw new Error('Recurring expense not found')
    }

    const updatedRecurringExpense = await prisma.recurringExpense.update({
      where: { id },
      data: {
        isActive: !recurringExpense.isActive,
      },
    })

    return { ...updatedRecurringExpense, amount: Number(updatedRecurringExpense.amount) }
  },

  async getUpcoming(userId: string, days = 7) {
    const now = new Date()
    const futureDate = addDays(now, days)

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        userId,
        isActive: true,
        nextDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        nextDate: 'asc',
      },
    })

    return recurringExpenses.map(re => ({
      recurringExpense: { ...re, amount: Number(re.amount) },
      dueDate: re.nextDate,
      daysUntil: differenceInDays(re.nextDate, now),
    }))
  },

  async processDueRecurringExpenses(): Promise<{ processed: number; errors: number }> {
    const now = new Date()

    const dueRecurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextDate: {
          lte: now,
        },
      },
    })

    let processed = 0
    let errors = 0

    for (const recurring of dueRecurringExpenses) {
      try {
        await prisma.expense.create({
          data: {
            userId: recurring.userId,
            amount: recurring.amount,
            description: recurring.description,
            type: recurring.type,
            date: recurring.nextDate,
            categoryId: recurring.categoryId,
            accountId: recurring.accountId,
            notes: `Auto-generated from recurring expense`,
          },
        })

        const nextDate = this.calculateNextDate(
          recurring.frequency,
          recurring.nextDate,
          recurring.customDays
        )

        let shouldDeactivate = false
        if (recurring.endDate && nextDate > recurring.endDate) {
          shouldDeactivate = true
        }

        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: {
            nextDate,
            isActive: shouldDeactivate ? false : recurring.isActive,
          },
        })

        processed++
      } catch (error) {
        logger.error(`Error processing recurring expense ${recurring.id}:`, error instanceof Error ? error : new Error(String(error)))
        errors++
      }
    }

    return { processed, errors }
  },
}
