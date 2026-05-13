import { ExpenseType, PaymentMethod, SplitType } from '@/types/prisma'
import { z } from 'zod'

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
  groupId: z.cuid2().optional(),
  type: z.enum(ExpenseType).optional(),
  paymentMethod: z.enum(PaymentMethod).optional(),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
  search: z.string().max(200).trim().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const participantSchema = z.object({
  memberIdOrContact: z.string().min(1, 'Member is required'),
  paidAmount: z.number().min(0, 'Paid amount cannot be negative').default(0),
  oweAmount: z.number().min(0, 'Owe amount cannot be negative'),
  splitType: z.enum(SplitType),
  splitValue: z.number().min(0, 'Split value cannot be negative'),
  isUser: z.boolean().default(false),
})

export const createGroupExpenseSchema = z
  .object({
    amount: z.number().positive('Amount must be greater than 0'),
    description: z.string().max(500, 'Description is too long').trim().optional(),
    date: z.union([z.string(), z.date()]).optional().default(() => new Date()),
    categoryId: z.cuid2('select a category'),
    groupId: z.cuid2('select a group'),
    participants: z.array(participantSchema).min(1, 'At least one participant is required'),
  })
  .refine(
    (data) => {
      const totalOwed = data.participants.reduce((sum, p) => sum + p.oweAmount, 0)
      return Math.abs(totalOwed - data.amount) < 0.01
    },
    {
      message: 'Total split amounts must equal the expense amount',
    }
  )

export const updateGroupExpenseSchema = z
  .object({
    amount: z.number().positive('Amount must be greater than 0').optional(),
    description: z.string().max(500, 'Description is too long').trim().optional(),
    date: z.union([z.string(), z.date()]).optional(),
    categoryId: z.cuid2('Invalid category').optional(),
    participants: z.array(participantSchema).min(1, 'At least one participant is required').optional(),
  })
  .refine(
    (data) => {
      if (data.participants && data.amount) {
        const totalOwed = data.participants.reduce((sum, p) => sum + p.oweAmount, 0)
        return Math.abs(totalOwed - data.amount) < 0.01
      }
      return true
    },
    {
      message: 'Total split amounts must equal the expense amount',
    }
  )

export type CreateExpenseInput = z.input<typeof createExpenseSchema>
export type CreateExpenseSchema = z.output<typeof createExpenseSchema>
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>
export type ExpenseFiltersSchema = z.infer<typeof expenseFiltersSchema>
export type ParticipantInput = z.infer<typeof participantSchema>
export type CreateGroupExpenseInput = z.input<typeof createGroupExpenseSchema>
export type UpdateGroupExpenseInput = z.input<typeof updateGroupExpenseSchema>
