import type { ExpenseWithRelations } from '@/features/expenses/types'
import type { AccountWithBalance } from '@/features/accounts/types'

export type TopCategory = {
  categoryId: string
  name: string
  color: string
  total: number
}

export type MonthlyStats = {
  totalExpenses: number
  totalIncome: number
  netBalance: number
  topCategories: TopCategory[]
}

export type DashboardStats = {
  currentMonth: MonthlyStats
  recentExpenses: ExpenseWithRelations[]
  accounts: AccountWithBalance[]
}
