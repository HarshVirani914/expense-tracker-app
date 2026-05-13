import { z } from 'zod'

export const csvRowSchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  amount: z.number().or(z.string().transform(val => {
    const num = parseFloat(val)
    if (isNaN(num)) throw new Error('Invalid amount')
    return num
  })),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  account: z.string().optional(),
  type: z.enum(['EXPENSE', 'INCOME']).optional().default('EXPENSE'),
  notes: z.string().optional(),
})

export const exportFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
})

export type CsvRowInput = z.infer<typeof csvRowSchema>
