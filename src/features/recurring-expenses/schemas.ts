import { z } from 'zod'

export const createRecurringExpenseSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  description: z.string().optional(),
  type: z.enum(['EXPENSE', 'INCOME']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'], {
    message: 'Frequency is required',
  }),
  customDays: z.number().positive().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  accountId: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.frequency === 'CUSTOM' && !data.customDays) {
      return false
    }
    return true
  },
  {
    message: 'Custom days is required when frequency is CUSTOM',
    path: ['customDays'],
  }
)

export const updateRecurringExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM']).optional(),
  customDays: z.number().positive().optional().nullable(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional().nullable(),
  categoryId: z.string().optional(),
  accountId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export type CreateRecurringExpenseInput = z.infer<typeof createRecurringExpenseSchema>
export type UpdateRecurringExpenseInput = z.infer<typeof updateRecurringExpenseSchema>
