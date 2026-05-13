import type { Category } from '@/types/prisma'

export type Budget = {
  id: string
  amount: number
  period: 'WEEKLY' | 'MONTHLY'
  startDate: Date
  endDate: Date | null
  userId: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export type BudgetWithCategory = Budget & {
  category: Category
}

export type BudgetWithSpending = BudgetWithCategory & {
  spent: number
  remaining: number
  percentageUsed: number
  status: 'safe' | 'warning' | 'exceeded'
}

export type BudgetAlert = {
  budget: BudgetWithSpending
  alertType: 'warning' | 'exceeded'
  message: string
}
