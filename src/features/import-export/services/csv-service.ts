import Papa from 'papaparse'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { csvRowSchema } from '../schemas'
import type { CsvExpenseRow, ImportResult, ExportFilters } from '../types'
import { format } from 'date-fns'
import { normalizeHeader, findClosestCategory } from '../utils/normalize'
import type { PaymentMethod } from '@/generated/prisma/client'

// ExcelJS ships incomplete types — dataValidations exists at runtime
type WorksheetWithValidations = ExcelJS.Worksheet & {
  dataValidations: {
    add(sqref: string, validation: Record<string, unknown>): void
  }
}

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']

export const csvService = {
  async generateTemplate(userId: string): Promise<Buffer> {
    const [categories, accounts] = await Promise.all([
      prisma.category.findMany({
        where: { OR: [{ userId }, { isDefault: true }] },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.account.findMany({
        where: { userId },
        select: { name: true },
        orderBy: { name: 'asc' },
      }),
    ])

    const categoryNames = categories.map(c => c.name)
    const accountNames = accounts.map(a => a.name)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Expense Tracker'
    workbook.created = new Date()

    // ── Hidden reference sheet for dropdown lists ──────────────────────────
    const refSheet = workbook.addWorksheet('_lists', { state: 'veryHidden' })
    refSheet.getColumn(1).header = 'Categories'
    refSheet.getColumn(2).header = 'Accounts'

    const maxRows = Math.max(categoryNames.length, accountNames.length, 2)
    for (let i = 0; i < maxRows; i++) {
      refSheet.addRow([categoryNames[i] ?? '', accountNames[i] ?? ''])
    }

    // ── Main import sheet ──────────────────────────────────────────────────
    const sheet = workbook.addWorksheet('Expenses')

    sheet.columns = [
      { key: 'date',        width: 14 },
      { key: 'amount',      width: 14, style: { numFmt: '#,##0.00' } },
      { key: 'description', width: 32 },
      { key: 'category',    width: 20 },
      { key: 'account',     width: 20 },
      { key: 'type',        width: 12 },
      { key: 'method',      width: 16 },
      { key: 'notes',       width: 28 },
    ]

    // Header row
    const headerRow = sheet.addRow(['date', 'amount', 'description', 'category', 'account', 'type', 'method', 'notes'])
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF475569' } } }
    })
    sheet.getRow(1).height = 28

    // Sample rows — amount as actual numbers so Excel recognises them correctly
    const today = format(new Date(), 'yyyy-MM-dd')
    const sampleRows = [
      [today, 250,   'Groceries at D-Mart', categoryNames[0] ?? 'Food',      accountNames[0] ?? 'Cash', 'EXPENSE', 'CASH',          'Weekly shopping'],
      [today, 1500,  'Electricity bill',     categoryNames[1] ?? 'Utilities', accountNames[0] ?? 'Cash', 'EXPENSE', 'UPI',           ''],
      [today, 50000, 'Salary credit',        'Income',                        accountNames[0] ?? 'Bank', 'INCOME',  'BANK_TRANSFER', 'Monthly salary'],
    ]
    sampleRows.forEach(rowData => {
      const row = sheet.addRow(rowData)
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      })
      // Ensure amount cell is numeric type
      row.getCell(2).value = rowData[1] as number
    })

    const dataRowCount = 1000
    const sv = sheet as WorksheetWithValidations

    // Date column (A) — hint only, flexible formats accepted on import
    sv.dataValidations.add(`A2:A${dataRowCount}`, {
      type: 'whole',
      operator: 'greaterThan',
      formulae: [0],
      showInputMessage: true,
      promptTitle: 'Date',
      prompt: 'Enter date in any format, e.g. 25/06/2025 or 2025-06-25',
    })

    // Amount column (B) — must be a positive number
    sv.dataValidations.add(`B2:B${dataRowCount}`, {
      type: 'decimal',
      operator: 'greaterThan',
      formulae: [0],
      showInputMessage: true,
      promptTitle: 'Amount',
      prompt: 'Enter a positive number, e.g. 250 or 1234.50',
      showErrorMessage: true,
      errorTitle: 'Invalid amount',
      error: 'Amount must be a positive number',
    })

    // Category column (D) — dropdown from user's categories
    if (categoryNames.length > 0) {
      sv.dataValidations.add(`D2:D${dataRowCount}`, {
        type: 'list',
        allowBlank: false,
        formulae: [`_lists!$A$2:$A$${categoryNames.length + 1}`],
        showInputMessage: true,
        promptTitle: 'Category',
        prompt: 'Select a category from the dropdown',
        showErrorMessage: true,
        errorTitle: 'Invalid category',
        error: `Please select one of: ${categoryNames.slice(0, 5).join(', ')}${categoryNames.length > 5 ? '…' : ''}`,
      })
    }

    // Account column (E) — dropdown from user's accounts
    if (accountNames.length > 0) {
      sv.dataValidations.add(`E2:E${dataRowCount}`, {
        type: 'list',
        allowBlank: true,
        formulae: [`_lists!$B$2:$B$${accountNames.length + 1}`],
        showInputMessage: true,
        promptTitle: 'Account',
        prompt: 'Select an account (optional)',
      })
    }

    // Type column (F) — EXPENSE or INCOME
    sv.dataValidations.add(`F2:F${dataRowCount}`, {
      type: 'list',
      allowBlank: false,
      formulae: ['"EXPENSE,INCOME"'],
      showInputMessage: true,
      promptTitle: 'Type',
      prompt: 'Select EXPENSE or INCOME',
      showErrorMessage: true,
      errorTitle: 'Invalid type',
      error: 'Must be EXPENSE or INCOME',
    })

    // Method column (G) — payment method dropdown
    sv.dataValidations.add(`G2:G${dataRowCount}`, {
      type: 'list',
      allowBlank: true,
      formulae: [`"${PAYMENT_METHODS.join(',')}"`],
      showInputMessage: true,
      promptTitle: 'Payment Method',
      prompt: 'Select how this was paid (optional)',
      showErrorMessage: true,
      errorTitle: 'Invalid method',
      error: `Must be one of: ${PAYMENT_METHODS.join(', ')}`,
    })

    // Freeze header row and alternate row shading
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    for (let r = 2; r <= 20; r++) {
      if (r % 2 === 0) {
        sheet.getRow(r).eachCell({ includeEmpty: true }, cell => {
          if (!cell.value) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
          }
        })
      }
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>
  },

  parseCSV(csvText: string): CsvExpenseRow[] {
    const result = Papa.parse<CsvExpenseRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: normalizeHeader,
    })

    if (result.errors.length > 0) {
      const fatal = result.errors.find(e => e.type === 'Delimiter' || e.type === 'Quotes')
      if (fatal) throw new Error(`CSV parsing error: ${fatal.message}`)
    }

    return result.data
  },

  async parseXLSX(buffer: ArrayBuffer): Promise<CsvExpenseRow[]> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // Use first non-hidden sheet that isn't our reference sheet
    const sheet = workbook.worksheets.find(ws => ws.name !== '_lists' && ws.state !== 'veryHidden')
    if (!sheet) throw new Error('No data sheet found in the Excel file')

    const rows: CsvExpenseRow[] = []
    let headers: string[] = []

    sheet.eachRow((row, rowNumber) => {
      const values = row.values as (string | number | null | undefined)[]
      // ExcelJS row.values is 1-indexed (index 0 is empty)
      const cells = values.slice(1).map(v => (v === null || v === undefined ? '' : String(v).trim()))

      if (rowNumber === 1) {
        headers = cells.map(normalizeHeader)
        return
      }

      // Skip completely empty rows
      if (cells.every(c => c === '')) return

      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h] = cells[i] ?? ''
      })

      rows.push(obj as unknown as CsvExpenseRow)
    })

    return rows
  },

  async validateRows(rows: CsvExpenseRow[], userId: string): Promise<ImportResult> {
    const errors: ImportResult['errors'] = []
    const validRows: Array<{ row: CsvExpenseRow; rowNumber: number }> = []

    const [categories, accounts] = await Promise.all([
      prisma.category.findMany({
        where: { OR: [{ userId }, { isDefault: true }] },
        select: { id: true, name: true },
      }),
      prisma.account.findMany({
        where: { userId },
        select: { id: true, name: true },
      }),
    ])

    const categoryNames = categories.map(c => c.name)
    const accountNames = accounts.map(a => a.name)
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))
    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]))

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2
      try {
        const validatedRow = csvRowSchema.parse(rows[i])

        // Fuzzy category match
        if (!categoryMap.has(validatedRow.category.toLowerCase())) {
          const fuzzy = findClosestCategory(validatedRow.category, categoryNames)
          if (!fuzzy) {
            errors.push({
              row: rowNumber,
              error: `Category "${validatedRow.category}" not found. Available: ${categoryNames.join(', ')}`,
              data: rows[i],
            })
            continue
          }
          validatedRow.category = fuzzy
        }

        // Fuzzy account match
        if (validatedRow.account) {
          if (!accountMap.has(validatedRow.account.toLowerCase())) {
            const fuzzy = findClosestCategory(validatedRow.account, accountNames)
            if (!fuzzy) {
              errors.push({
                row: rowNumber,
                error: `Account "${validatedRow.account}" not found. Available: ${accountNames.join(', ')}`,
                data: rows[i],
              })
              continue
            }
            validatedRow.account = fuzzy
          }
        }

        validRows.push({ row: validatedRow, rowNumber })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid row data'
        errors.push({ row: rowNumber, error: message, data: rows[i] })
      }
    }

    return { success: validRows.length, failed: errors.length, errors }
  },

  async importExpenses(rows: CsvExpenseRow[], userId: string): Promise<ImportResult> {
    const validationResult = await this.validateRows(rows, userId)

    if (validationResult.success === 0) return validationResult

    const [categories, accounts] = await Promise.all([
      prisma.category.findMany({
        where: { OR: [{ userId }, { isDefault: true }] },
        select: { id: true, name: true },
      }),
      prisma.account.findMany({
        where: { userId },
        select: { id: true, name: true },
      }),
    ])

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))
    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]))

    const expensesToCreate = []

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2
      if (validationResult.errors.some(e => e.row === rowNumber)) continue

      try {
        const row = csvRowSchema.parse(rows[i])

        let categoryName = row.category
        if (!categoryMap.has(categoryName.toLowerCase())) {
          const fuzzy = findClosestCategory(categoryName, categories.map(c => c.name))
          if (fuzzy) categoryName = fuzzy
        }

        const categoryId = categoryMap.get(categoryName.toLowerCase())
        if (!categoryId) continue

        let accountId: string | null = null
        if (row.account) {
          const accName = accountMap.has(row.account.toLowerCase())
            ? row.account
            : (findClosestCategory(row.account, accounts.map(a => a.name)) ?? row.account)
          accountId = accountMap.get(accName.toLowerCase()) ?? null
        }

        expensesToCreate.push({
          userId,
          amount: Number(row.amount),
          description: row.description,
          type: row.type || 'EXPENSE',
          date: new Date(row.date),
          categoryId,
          accountId: accountId ?? undefined,
          paymentMethod: ((row.method as string | undefined) || 'OTHER') as PaymentMethod,
          notes: row.notes,
        })
      } catch {
        // row already counted as failed in validation
      }
    }

    if (expensesToCreate.length > 0) {
      await prisma.expense.createMany({ data: expensesToCreate })
    }

    return validationResult
  },

  async exportExpenses(userId: string, filters?: ExportFilters): Promise<string> {
    const where: Record<string, unknown> = { userId }

    if (filters) {
      if (filters.startDate && filters.endDate) {
        where.date = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) }
      }
      if (filters.categoryId) where.categoryId = filters.categoryId
      if (filters.groupId) {
        where.groupId = filters.groupId === 'personal' ? null : filters.groupId
      }
      if (filters.type) where.type = filters.type
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: { select: { name: true } },
        account: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })

    const csvData = expenses.map(expense => ({
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      amount: Number(expense.amount),
      description: expense.description || '',
      category: expense.category.name,
      account: expense.account?.name || '',
      type: expense.type,
      method: expense.paymentMethod || 'OTHER',
      notes: expense.notes || '',
    }))

    return Papa.unparse(csvData)
  },
}
