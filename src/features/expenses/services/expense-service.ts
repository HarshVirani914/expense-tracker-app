import { Prisma } from '@/generated/prisma/client'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import type { PaginatedResponse } from '@/types/api'
import type {
  CreateExpenseInput,
  ExpenseFilters,
  ExpenseWithRelations,
  UpdateExpenseInput,
  ExpenseSummary,
} from '../types'

export const expenseService = {
  async getSummary(userId: string, filters: ExpenseFilters): Promise<ExpenseSummary> {
    try {
      const {
        categoryId,
        accountId,
        groupId,
        type,
        paymentMethod,
        startDate,
        endDate,
        search,
        minAmount,
        maxAmount,
      } = filters

      const where: Prisma.ExpenseWhereInput = {
        userId,
        ...(categoryId && { categoryId }),
        ...(accountId && { accountId }),
        ...(groupId && (groupId === 'personal' 
          ? { groupId: null }
          : { groupId }
        )),
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
        ...(minAmount !== undefined || maxAmount !== undefined
          ? {
            amount: {
              ...(minAmount !== undefined && { gte: minAmount }),
              ...(maxAmount !== undefined && { lte: maxAmount }),
            },
          }
          : {}),
      }

      const [expensesAgg, incomeAgg, expenseCount, incomeCount] = await Promise.all([
        prisma.expense.aggregate({
          where: {
            ...where,
            type: 'EXPENSE',
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.expense.aggregate({
          where: {
            ...where,
            type: 'INCOME',
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.expense.count({
          where: {
            ...where,
            type: 'EXPENSE',
          },
        }),
        prisma.expense.count({
          where: {
            ...where,
            type: 'INCOME',
          },
        }),
      ])

      const totalExpenses = Number(expensesAgg._sum.amount || 0)
      const totalIncome = Number(incomeAgg._sum.amount || 0)

      return {
        totalExpenses,
        totalIncome,
        netAmount: totalIncome - totalExpenses,
        expenseCount,
        incomeCount,
        totalCount: expenseCount + incomeCount,
      }
    } catch (error) {
      logger.error('Failed to get expense summary', { error, userId, filters })
      throw new Error('Failed to fetch expense summary')
    }
  },

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
        groupId,
        type,
        paymentMethod,
        startDate,
        endDate,
        search,
        minAmount,
        maxAmount,
        sortBy = 'date',
        sortOrder = 'desc',
      } = filters

      const skip = (page - 1) * limit

      const where: Prisma.ExpenseWhereInput = {
        userId,
        ...(categoryId && { categoryId }),
        ...(accountId && { accountId }),
        ...(groupId && (groupId === 'personal' 
          ? { groupId: null }
          : { groupId }
        )),
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
        ...(minAmount !== undefined || maxAmount !== undefined
          ? {
            amount: {
              ...(minAmount !== undefined && { gte: minAmount }),
              ...(maxAmount !== undefined && { lte: maxAmount }),
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
            participants: {
              select: {
                id: true,
                userId: true,
                contactId: true,
                paidAmount: true,
                oweAmount: true,
                splitType: true,
                splitValue: true,
                contact: { select: { name: true } },
              },
            },
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.expense.count({ where }),
      ])

      // Transform Decimal to number for participants
      const transformedExpenses = expenses.map(expense => ({
        ...expense,
        participants: expense.participants?.map(p => ({
          ...p,
          paidAmount: Number(p.paidAmount),
          oweAmount: Number(p.oweAmount),
          splitValue: Number(p.splitValue),
        })),
      }))

      const totalPages = Math.ceil(total / limit)

      return {
        data: transformedExpenses,
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
          participants: {
            select: {
              id: true,
              userId: true,
              contactId: true,
              paidAmount: true,
              oweAmount: true,
              splitType: true,
              splitValue: true,
              contact: { select: { name: true } },
            },
          },
        },
      })

      if (!expense) {
        throw new Error('Expense not found')
      }

      // Transform Decimal to number for participants
      return {
        ...expense,
        participants: expense.participants?.map(p => ({
          ...p,
          paidAmount: Number(p.paidAmount),
          oweAmount: Number(p.oweAmount),
          splitValue: Number(p.splitValue),
        })),
      }
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

  async updateGroupExpense(
    userId: string,
    expenseId: string,
    data: UpdateExpenseInput & { participants?: Array<{
      memberIdOrContact: string
      paidAmount: number
      oweAmount: number
      splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'
      splitValue: number
      isUser: boolean
    }> }
  ): Promise<ExpenseWithRelations> {
    try {
      // Verify expense belongs to user
      const existingExpense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          userId,
          groupId: { not: null },
        },
        include: {
          group: {
            include: {
              members: true,
            },
          },
        },
      })

      if (!existingExpense) {
        throw new Error('Group expense not found')
      }

      // Verify user is still a member of the group
      const isMember = existingExpense.group?.members.some(m => m.userId === userId)
      if (!isMember) {
        throw new Error('You are no longer a member of this group')
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

      if (data.participants && data.amount) {
        const totalOwed = data.participants.reduce((sum, p) => sum + p.oweAmount, 0)
        if (Math.abs(totalOwed - data.amount) > 0.01) {
          throw new Error('Total split amounts must equal expense amount')
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        const expense = await tx.expense.update({
          where: { id: expenseId },
          data: {
            ...(data.amount !== undefined && { amount: data.amount }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.date && { date: new Date(data.date) }),
            ...(data.categoryId && { categoryId: data.categoryId }),
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

        if (data.participants) {
          await tx.expenseParticipant.deleteMany({
            where: { expenseId },
          })

          const participantData = data.participants.map((p) => ({
            expenseId: expense.id,
            userId: p.isUser ? p.memberIdOrContact : null,
            contactId: !p.isUser ? p.memberIdOrContact : null,
            paidAmount: p.paidAmount,
            oweAmount: p.oweAmount,
            splitType: p.splitType,
            splitValue: p.splitValue,
          }))

          await tx.expenseParticipant.createMany({
            data: participantData,
          })
        }

        return expense
      })

      logger.info('Group expense updated', { userId, expenseId })
      return result
    } catch (error) {
      logger.error('Failed to update group expense', { error, userId, expenseId, data })
      throw error
    }
  },

  async deleteGroupExpense(userId: string, expenseId: string): Promise<void> {
    try {
      // Verify expense belongs to user
      const existingExpense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          userId,
          groupId: { not: null },
        },
        include: {
          group: {
            include: {
              members: true,
            },
          },
        },
      })

      if (!existingExpense) {
        throw new Error('Group expense not found')
      }

      // Verify user is still a member of the group
      const isMember = existingExpense.group?.members.some(m => m.userId === userId)
      if (!isMember) {
        throw new Error('You are no longer a member of this group')
      }

      await prisma.$transaction(async (tx) => {
        await tx.expenseParticipant.deleteMany({
          where: { expenseId },
        })

        await tx.expense.delete({
          where: { id: expenseId },
        })
      })

      logger.info('Group expense deleted', { userId, expenseId })
    } catch (error) {
      logger.error('Failed to delete group expense', { error, userId, expenseId })
      throw error
    }
  },
}
