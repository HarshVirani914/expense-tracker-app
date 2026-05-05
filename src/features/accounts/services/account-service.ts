import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type {
  AccountWithBalance,
  CreateAccountInput,
  UpdateAccountInput,
} from '../types'
import { Prisma } from '@/generated/prisma/client'

export const accountService = {
  async list(userId: string): Promise<AccountWithBalance[]> {
    try {
      const accounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      const accountsWithBalance = await Promise.all(
        accounts.map(async (account) => ({
          ...account,
          currentBalance: await this.calculateBalance(account.id),
        }))
      )

      return accountsWithBalance
    } catch (error) {
      logger.error('Failed to list accounts', { error, userId })
      throw new Error('Failed to fetch accounts')
    }
  },

  async get(userId: string, accountId: string): Promise<AccountWithBalance> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
      })

      if (!account) {
        throw new Error('Account not found')
      }

      const currentBalance = await this.calculateBalance(accountId)

      return {
        ...account,
        currentBalance,
      }
    } catch (error) {
      logger.error('Failed to get account', { error, userId, accountId })
      throw error
    }
  },

  async create(userId: string, data: CreateAccountInput): Promise<AccountWithBalance> {
    try {
      const account = await prisma.account.create({
        data: {
          ...data,
          userId,
        },
      })

      logger.info('Account created', { userId, accountId: account.id })

      return {
        ...account,
        currentBalance: Number(account.initialBalance),
      }
    } catch (error) {
      logger.error('Failed to create account', { error, userId, data })
      throw new Error('Failed to create account')
    }
  },

  async update(
    userId: string,
    accountId: string,
    data: UpdateAccountInput
  ): Promise<AccountWithBalance> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
      })

      if (!account) {
        throw new Error('Account not found')
      }

      const updated = await prisma.account.update({
        where: { id: accountId },
        data,
      })

      const currentBalance = await this.calculateBalance(accountId)

      logger.info('Account updated', { userId, accountId })

      return {
        ...updated,
        currentBalance,
      }
    } catch (error) {
      logger.error('Failed to update account', { error, userId, accountId, data })
      throw error
    }
  },

  async delete(userId: string, accountId: string): Promise<void> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId,
        },
        include: {
          _count: {
            select: { expenses: true },
          },
        },
      })

      if (!account) {
        throw new Error('Account not found')
      }

      if (account._count.expenses > 0) {
        throw new Error(
          `Cannot delete account with ${account._count.expenses} associated expenses`
        )
      }

      await prisma.account.delete({
        where: { id: accountId },
      })

      logger.info('Account deleted', { userId, accountId })
    } catch (error) {
      logger.error('Failed to delete account', { error, userId, accountId })
      throw error
    }
  },

  async calculateBalance(accountId: string): Promise<number> {
    try {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
        select: { initialBalance: true },
      })

      if (!account) {
        return 0
      }

      const initialBalance = account.initialBalance

      const income = await prisma.expense.aggregate({
        where: {
          accountId,
          type: 'INCOME',
        },
        _sum: {
          amount: true,
        },
      })

      const incomeTotal = income._sum.amount || new Prisma.Decimal(0)

      const expenses = await prisma.expense.aggregate({
        where: {
          accountId,
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
      })

      const expensesTotal = expenses._sum.amount || new Prisma.Decimal(0)

      const balance = initialBalance
        .plus(incomeTotal)
        .minus(expensesTotal)

      return Number(balance)
    } catch (error) {
      logger.error('Failed to calculate balance', { error, accountId })
      return 0
    }
  },
}
