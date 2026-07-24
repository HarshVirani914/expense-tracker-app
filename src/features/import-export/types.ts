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

export type SmartImportRow = {
  id: string
  date: string
  description: string
  amount: number
  category: string
  type: 'EXPENSE' | 'INCOME'
  paymentMethod?: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER'
  merchant?: string
  confidence: number
  included: boolean
  possibleDuplicate: boolean
}

export type SmartImportAnalyzeResult = {
  sessionId: string
  rows: SmartImportRow[]
}

export type SmartImportConfirmResult = {
  imported: number
  failed: number
}
