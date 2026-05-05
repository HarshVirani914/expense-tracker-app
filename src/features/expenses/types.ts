import type {
  Expense,
  ExpenseType,
  PaymentMethod,
  Category,
  Account,
} from '@/types/prisma'
import type { FilterOptions } from '@/types/api'

export { ExpenseType, PaymentMethod }

export type { Expense }

export type ExpenseWithRelations = Expense & {
  category: Category
  account: Account | null
}

export type CreateExpenseInput = {
  amount: number
  description?: string
  type?: ExpenseType
  date?: Date | string
  paymentMethod?: PaymentMethod
  notes?: string
  categoryId: string
  accountId?: string | null
}

export type UpdateExpenseInput = {
  amount?: number
  description?: string
  type?: ExpenseType
  date?: Date | string
  paymentMethod?: PaymentMethod
  notes?: string
  categoryId?: string
  accountId?: string | null
}

export type ExpenseFilters = FilterOptions & {
  categoryId?: string
  accountId?: string
  type?: ExpenseType
  paymentMethod?: PaymentMethod
}
