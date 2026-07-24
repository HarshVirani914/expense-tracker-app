import { prisma } from '@/lib/prisma'
import {
  analyzeBulkImportFile,
  analyzeBulkImportImages,
  type BulkImportExpense,
} from '@/lib/ai/bulk-import-parser'
import { checkRateLimit } from '@/lib/ai/rate-limiter'
import type { SmartImportRowInput } from '../schemas'
import type {
  SmartImportAnalyzeResult,
  SmartImportConfirmResult,
  SmartImportRow,
} from '../types'
import { PaymentMethod } from '@/types/prisma'

const MAX_TEXT_LENGTH = 10_000
const MAX_IMAGES = 4
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

type AnalyzeTextInput = {
  mode: 'text'
  text: string
  fileName?: string
}

type AnalyzeImageInput = {
  mode: 'image'
  images: Array<{ data: Uint8Array; mediaType: string; name: string }>
}

type AnalyzeInput = AnalyzeTextInput | AnalyzeImageInput

const resolveCategoryId = (
  categoryName: string,
  categories: Array<{ id: string; name: string }>,
): string => {
  const match = categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
  )
  if (match) return match.id

  const other = categories.find((c) => c.name.toLowerCase() === 'other')
  if (other) return other.id

  return categories[0]?.id ?? ''
}

const toSmartImportRow = (
  expense: BulkImportExpense,
  index: number,
  possibleDuplicate: boolean,
): SmartImportRow => ({
  id: `row-${index}-${Date.now()}`,
  date: expense.date,
  description: expense.merchant
    ? `${expense.description} (${expense.merchant})`.trim()
    : expense.description,
  amount: expense.amount,
  category: expense.category,
  type: expense.type,
  paymentMethod: expense.paymentMethod,
  merchant: expense.merchant,
  confidence: expense.confidence,
  included: !possibleDuplicate,
  possibleDuplicate,
})

const flagPossibleDuplicates = async (
  userId: string,
  expenses: BulkImportExpense[],
): Promise<SmartImportRow[]> => {
  if (expenses.length === 0) return []

  const dates = expenses.map((e) => new Date(e.date))
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  minDate.setDate(minDate.getDate() - 1)
  maxDate.setDate(maxDate.getDate() + 1)

  const existingExpenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: minDate,
        lte: maxDate,
      },
    },
    select: {
      amount: true,
      date: true,
    },
  })

  return expenses.map((expense, index) => {
    const expenseDate = new Date(expense.date)
    const possibleDuplicate = existingExpenses.some((existing) => {
      const existingDate = new Date(existing.date)
      const dayDiff = Math.abs(
        (expenseDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      const existingAmount = Number(existing.amount)
      return dayDiff <= 1 && Math.abs(existingAmount - expense.amount) < 0.01
    })

    return toSmartImportRow(expense, index, possibleDuplicate)
  })
}

export const smartImportService = {
  async analyzeForImport(
    userId: string,
    input: AnalyzeInput,
  ): Promise<SmartImportAnalyzeResult> {
    if (!checkRateLimit(userId, 10)) {
      throw new Error('Rate limit exceeded. Try again in a minute.')
    }

    const categories = await prisma.category.findMany({
      where: { OR: [{ userId }, { isDefault: true }] },
      select: { id: true, name: true },
    })

    if (categories.length === 0) {
      throw new Error('No categories available. Please add categories first.')
    }

    const categoryNames = categories.map((c) => c.name)

    let extractedExpenses: BulkImportExpense[] = []
    let fileName = 'pasted-text.txt'
    let fileType = 'text'

    if (input.mode === 'text') {
      const text = input.text.trim()
      if (!text) {
        throw new Error('No text provided')
      }
      if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Text exceeds ${MAX_TEXT_LENGTH} character limit`)
      }

      fileName = input.fileName ?? 'pasted-text.txt'
      extractedExpenses = await analyzeBulkImportFile(
        text,
        'text',
        categoryNames,
      )
    } else {
      if (input.images.length === 0) {
        throw new Error('No images provided')
      }
      if (input.images.length > MAX_IMAGES) {
        throw new Error(`Maximum ${MAX_IMAGES} images allowed`)
      }

      for (const image of input.images) {
        if (image.data.byteLength > MAX_IMAGE_SIZE_BYTES) {
          throw new Error(`Image "${image.name}" exceeds 5MB limit`)
        }
      }

      fileName = input.images.map((img) => img.name).join(', ')
      fileType = 'image'
      extractedExpenses = await analyzeBulkImportImages(
        input.images.map(({ data, mediaType }) => ({ data, mediaType })),
        categoryNames,
      )
    }

    if (extractedExpenses.length === 0) {
      throw new Error(
        'No transactions found. Try pasting bank SMS or payment notification text.',
      )
    }

    const rows = await flagPossibleDuplicates(userId, extractedExpenses)

    const session = await prisma.bulkImportSession.create({
      data: {
        userId,
        fileName,
        fileType,
        mappedData: rows,
        status: 'reviewing',
      },
    })

    return { sessionId: session.id, rows }
  },

  async confirmSmartImport(
    userId: string,
    sessionId: string,
    rows: SmartImportRowInput[],
  ): Promise<SmartImportConfirmResult> {
    const session = await prisma.bulkImportSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== userId) {
      throw new Error('Invalid import session')
    }

    if (session.status !== 'reviewing') {
      throw new Error('Import session is no longer active')
    }

    const categories = await prisma.category.findMany({
      where: { OR: [{ userId }, { isDefault: true }] },
      select: { id: true, name: true },
    })

    if (categories.length === 0) {
      throw new Error('No categories available')
    }

    const includedRows = rows.filter((row) => row.included !== false)

    if (includedRows.length === 0) {
      throw new Error('Select at least one expense to import')
    }

    let imported = 0
    let failed = 0

    await prisma.$transaction(async (tx) => {
      for (const row of includedRows) {
        try {
          const categoryId = resolveCategoryId(row.category, categories)
          if (!categoryId) {
            failed++
            continue
          }

          await tx.expense.create({
            data: {
              amount: row.amount,
              description: row.description,
              type: row.type,
              date: new Date(row.date),
              paymentMethod: (row.paymentMethod ??
                PaymentMethod.OTHER) as PaymentMethod,
              userId,
              categoryId,
            },
          })
          imported++
        } catch {
          failed++
        }
      }

      await tx.bulkImportSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          importedCount: imported,
          errorCount: failed,
          mappedData: rows,
        },
      })
    })

    return { imported, failed }
  },
}
