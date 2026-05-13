import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { csvRowSchema } from '../schemas'
import type { CsvExpenseRow, ImportResult, ExportFilters } from '../types'
import { format } from 'date-fns'

export const csvService = {
  generateTemplate(): string {
    const headers = ['date', 'amount', 'description', 'category', 'account', 'type', 'notes']
    const sampleRow = [
      format(new Date(), 'yyyy-MM-dd'),
      '100.00',
      'Sample expense',
      'Food',
      'Cash',
      'EXPENSE',
      'Optional notes',
    ]
    
    const csv = Papa.unparse({
      fields: headers,
      data: [sampleRow],
    })
    
    return csv
  },

  parseCSV(csvText: string): CsvExpenseRow[] {
    const result = Papa.parse<CsvExpenseRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    })

    if (result.errors.length > 0) {
      throw new Error(`CSV parsing error: ${result.errors[0].message}`)
    }

    return result.data
  },

  async validateRows(rows: CsvExpenseRow[], userId: string): Promise<ImportResult> {
    const errors: ImportResult['errors'] = []
    const validRows: Array<{ row: CsvExpenseRow; rowNumber: number }> = []

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { isDefault: true },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    })

    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
    })

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))
    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]))

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2
      try {
        const validatedRow = csvRowSchema.parse(rows[i])
        
        if (!categoryMap.has(validatedRow.category.toLowerCase())) {
          errors.push({
            row: rowNumber,
            error: `Category "${validatedRow.category}" not found`,
            data: rows[i],
          })
          continue
        }

        if (validatedRow.account && !accountMap.has(validatedRow.account.toLowerCase())) {
          errors.push({
            row: rowNumber,
            error: `Account "${validatedRow.account}" not found`,
            data: rows[i],
          })
          continue
        }

        validRows.push({ row: validatedRow, rowNumber })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid row data'
        errors.push({
          row: rowNumber,
          error: message,
          data: rows[i],
        })
      }
    }

    return {
      success: validRows.length,
      failed: errors.length,
      errors,
    }
  },

  async importExpenses(rows: CsvExpenseRow[], userId: string): Promise<ImportResult> {
    const validationResult = await this.validateRows(rows, userId)

    if (validationResult.success === 0) {
      return validationResult
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { isDefault: true },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    })

    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
    })

    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))
    const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]))

    const expensesToCreate = []

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2
      const hasError = validationResult.errors.some(e => e.row === rowNumber)
      
      if (hasError) continue

      const row = rows[i]
      const categoryId = categoryMap.get(row.category.toLowerCase())
      const accountId = row.account ? accountMap.get(row.account.toLowerCase()) : null

      if (categoryId) {
        expensesToCreate.push({
          userId,
          amount: Number(row.amount),
          description: row.description,
          type: row.type || 'EXPENSE',
          date: new Date(row.date),
          categoryId,
          accountId: accountId || undefined,
          notes: row.notes,
        })
      }
    }

    if (expensesToCreate.length > 0) {
      await prisma.expense.createMany({
        data: expensesToCreate,
      })
    }

    return validationResult
  },

  async exportExpenses(userId: string, filters?: ExportFilters): Promise<string> {
    const where: any = {
      userId,
    }

    if (filters) {
      if (filters.startDate && filters.endDate) {
        where.date = {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        }
      }

      if (filters.categoryId) {
        where.categoryId = filters.categoryId
      }

      if (filters.groupId) {
        if (filters.groupId === 'personal') {
          where.groupId = null
        } else {
          where.groupId = filters.groupId
        }
      }

      if (filters.type) {
        where.type = filters.type
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        account: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const csvData = expenses.map(expense => ({
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      amount: Number(expense.amount),
      description: expense.description || '',
      category: expense.category.name,
      account: expense.account?.name || '',
      type: expense.type,
      notes: expense.notes || '',
    }))

    const csv = Papa.unparse(csvData)
    return csv
  },
}
