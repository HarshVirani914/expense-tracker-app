import { z } from 'zod'
import { normalizeDate, normalizeAmount, normalizeType, normalizePaymentMethod } from './utils/normalize'

export const csvRowSchema = z.object({
  date: z.string().transform((val, ctx) => {
    const d = normalizeDate(val)
    if (!d) {
      ctx.addIssue({ code: "custom", message: `Unrecognized date format: "${val}"` })
      return z.NEVER
    }
    return d.toISOString()
  }),

  amount: z.union([z.number(), z.string()]).transform((val, ctx) => {
    const num = normalizeAmount(val)
    if (num === null || num <= 0) {
      ctx.addIssue({ code: "custom", message: `Invalid amount: "${val}"` })
      return z.NEVER
    }
    return num
  }),

  description: z.string().min(1, 'Description is required'),

  category: z.string().min(1, 'Category is required'),

  account: z.string().optional().transform(v => (v && v.trim() !== '' ? v.trim() : undefined)),

  type: z
    .string()
    .optional()
    .default('EXPENSE')
    .transform(val => normalizeType(val ?? 'EXPENSE')),

  method: z
    .string()
    .optional()
    .transform(v => (v && v.trim() !== '' ? normalizePaymentMethod(v) : 'OTHER')),

  notes: z.string().optional().transform(v => (v && v.trim() !== '' ? v.trim() : undefined)),
})

export const exportFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
})

export type CsvRowInput = z.infer<typeof csvRowSchema>

export const smartImportRowSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  description: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  type: z.enum(['EXPENSE', 'INCOME']),
  paymentMethod: z
    .enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'OTHER'])
    .optional(),
  merchant: z.string().optional(),
  confidence: z.number().min(0).max(1),
  included: z.boolean().optional().default(true),
  possibleDuplicate: z.boolean().optional().default(false),
})

export const confirmSmartImportSchema = z.object({
  sessionId: z.string().min(1),
  rows: z.array(smartImportRowSchema).min(1),
})

export type SmartImportRowInput = z.infer<typeof smartImportRowSchema>
export type ConfirmSmartImportInput = z.infer<typeof confirmSmartImportSchema>
