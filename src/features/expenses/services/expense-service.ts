import { Prisma } from '@/generated/prisma/client'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse } from '@/types/api'
import type {
  CreateExpenseInput,
  ExpenseFilters,
  ExpenseWithRelations,
  UpdateExpenseInput,
} from '../types'

export const expenseService = {
  async list(
    userId: string,
    filters: ExpenseFilters
  ): Promise<PaginatedResponse<ExpenseWithRelations>> {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        accountId,
        type,
        paymentMethod,
        startDate,
        endDate,
        search,
        sortBy = 'date',
        sortOrder = 'desc',
      } = filters

      const skip = (page - 1) * limit

      const where: Prisma.ExpenseWhereInput = {
        userId,
        ...(categoryId && { categoryId }),
        ...(accountId && { accountId }),
        ...(type && { type }),
        ...(paymentMethod && { paymentMethod }),
        ...(search && {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(startDate || endDate
          ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
          : {}),
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
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
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.expense.count({ where }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: expenses,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    } catch (error) {
      logger.error('Failed to list expenses', { error, userId, filters })
      throw new Error('Failed to fetch expenses')
    }
  },

  async get(userId: string, expenseId: string): Promise<ExpenseWithRelations> {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          userId,
        },
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
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      return expense
    } catch (error) {
      logger.error('Failed to get expense', { error, userId, expenseId })
      throw error
    }
  },

  async create(userId: string, data: CreateExpenseInput): Promise<ExpenseWithRelations> {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { isDefault: true, userId: null }],
        },
      })

      if (!category) {
        throw new Error('Category not found')
      }

      if (data.accountId) {
        const account = await prisma.account.findFirst({
          where: {
            id: data.accountId,
            userId,
          },
        })

        if (!account) {
          throw new Error('Account not found')
        }
      }

      const expense = await prisma.expense.create({
        data: {
          ...data,
          userId,
          date: data.date ? new Date(data.date) : new Date(),
        },
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
      })

      logger.info('Expense created', { userId, expenseId: expense.id })
      return expense
    } catch (error) {
      logger.error('Failed to create expense', { error, userId, data })
      throw error
    }
  },

  async update(
    userId: string,
    expenseId: string,
    data: UpdateExpenseInput
  ): Promise<ExpenseWithRelations> {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          userId,
        },
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      if (data.categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            id: data.categoryId,
            OR: [{ userId }, { isDefault: true, userId: null }],
          },
        })

        if (!category) {
          throw new Error('Category not found')
        }
      }

      if (data.accountId) {
        const account = await prisma.account.findFirst({
          where: {
            id: data.accountId,
            userId,
          },
        })

        if (!account) {
          throw new Error('Account not found')
        }
      }

      const updated = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          ...data,
          ...(data.date && { date: new Date(data.date) }),
        },
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
      })

      logger.info('Expense updated', { userId, expenseId })
      return updated
    } catch (error) {
      logger.error('Failed to update expense', { error, userId, expenseId, data })
      throw error
    }
  },

  async delete(userId: string, expenseId: string): Promise<void> {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          userId,
        },
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      await prisma.expense.delete({
        where: { id: expenseId },
      })

      logger.info('Expense deleted', { userId, expenseId })
    } catch (error) {
      logger.error('Failed to delete expense', { error, userId, expenseId })
      throw error
    }
  },
}
