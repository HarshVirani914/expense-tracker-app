import { z } from 'zod'

export const analyticsFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeRange: z.enum(['this-month', 'last-month', 'this-year', 'last-year', 'all-time', 'custom']).optional(),
  categoryId: z.string().optional(),
})

export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>
