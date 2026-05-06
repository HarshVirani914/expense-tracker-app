import type { FilterOptions } from '@/types/api'
import type {
  Account,
  Category,
  Expense,
  ExpenseType,
  PaymentMethod,
} from '@/types/prisma'

export { ExpenseType, PaymentMethod }

export type { Expense }

export type ExpenseWithRelations = Expense & {
  category: Category
  account: Account | null
  group: {
    id: string
    name: string
  } | null
  participants?: {
    id: string
    paidAmount: number
    oweAmount: number
  }[]
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
  groupId?: string
  type?: ExpenseType
  paymentMethod?: PaymentMethod
}
