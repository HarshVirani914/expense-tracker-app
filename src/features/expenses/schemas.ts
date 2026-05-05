import { z } from 'zod'
import { ExpenseType, PaymentMethod } from '@/types/prisma'

export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  type: z.enum(ExpenseType).optional().default(ExpenseType.EXPENSE),
  date: z.union([z.string(), z.date()]).optional().default(() => new Date()),
  paymentMethod: z.enum(PaymentMethod).optional().default(PaymentMethod.OTHER),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim()
    .optional(),
  categoryId: z.cuid2('Invalid category ID'),
  accountId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      // Handle "none" or empty strings as null
      if (!val || val === 'none' || val === '') return null
      // Validate as CUID2 if present
      if (!val.match(/^c[^\s-]{24,}$/)) {
        throw new Error('Invalid account ID')
      }
      return val
    }),
})

export const updateExpenseSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(999999999.99, 'Amount is too large')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  type: z.enum(ExpenseType).optional(),
  date: z.union([z.string(), z.date()]).optional(),
  paymentMethod: z.enum(PaymentMethod).optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim()
    .optional(),
  categoryId: z.cuid2('Invalid category ID').optional(),
  accountId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      // Handle "none" or empty strings as null
      if (!val || val === 'none' || val === '') return null
      // Validate as CUID2 if present
      if (!val.match(/^c[^\s-]{24,}$/)) {
        throw new Error('Invalid account ID')
      }
      return val
    }),
})

export const expenseFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  categoryId: z.cuid2().optional(),
  accountId: z.cuid2().optional(),
  type: z.enum(ExpenseType).optional(),
  paymentMethod: z.enum(PaymentMethod).optional(),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
  search: z.string().max(200).trim().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type CreateExpenseInput = z.input<typeof createExpenseSchema>
export type CreateExpenseSchema = z.output<typeof createExpenseSchema>
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>
export type ExpenseFiltersSchema = z.infer<typeof expenseFiltersSchema>
