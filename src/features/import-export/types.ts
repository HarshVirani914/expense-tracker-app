export type CsvExpenseRow = {
  date: string
  amount: number
  description: string
  category: string
  account?: string
  type: 'EXPENSE' | 'INCOME'
  method?: string
  notes?: string
}

export type ImportResult = {
  success: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data?: Partial<CsvExpenseRow>
  }>
}

export type ExportFilters = {
  startDate?: string
  endDate?: string
  categoryId?: string
  groupId?: string
  type?: 'EXPENSE' | 'INCOME'
}
