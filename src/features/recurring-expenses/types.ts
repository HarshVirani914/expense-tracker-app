import type { Category, Account } from '@/types/prisma'

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'

export type RecurringExpense = {
  id: string
  amount: number
  description: string | null
  type: 'EXPENSE' | 'INCOME'
  frequency: RecurrenceFrequency
  customDays: number | null
  startDate: Date
  endDate: Date | null
  nextDate: Date
  isActive: boolean
  userId: string
  categoryId: string
  accountId: string | null
  createdAt: Date
  updatedAt: Date
}

export type RecurringExpenseWithRelations = RecurringExpense & {
  category: Category
  account: Account | null
}

export type UpcomingRecurrence = {
  recurringExpense: RecurringExpenseWithRelations
  dueDate: Date
  daysUntil: number
}
