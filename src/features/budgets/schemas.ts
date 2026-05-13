import { z } from 'zod'

export const createBudgetSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  period: z.enum(['WEEKLY', 'MONTHLY'], { message: 'Period is required' }),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  startDate: z.string().or(z.date()),
})

export const updateBudgetSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than 0' }).optional(),
  period: z.enum(['WEEKLY', 'MONTHLY']).optional(),
  categoryId: z.string().min(1, { message: 'Category is required' }).optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).nullable().optional(),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
