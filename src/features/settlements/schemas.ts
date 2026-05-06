import { z } from 'zod'

export const createSettlementSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.union([z.string(), z.date()]).optional().default(() => new Date()),
  notes: z.string().max(500, 'Notes are too long').trim().optional().nullable().or(z.literal('')),
  groupId: z.cuid2('Invalid group ID'),
  payerUserId: z.string().optional().nullable(),
  payerContactId: z.string().optional().nullable(),
  receiverUserId: z.string().optional().nullable(),
  receiverContactId: z.string().optional().nullable(),
}).refine(
  (data) => data.payerUserId || data.payerContactId,
  {
    message: 'Payer is required',
  }
).refine(
  (data) => data.receiverUserId || data.receiverContactId,
  {
    message: 'Receiver is required',
  }
)

export const settlementFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  groupId: z.cuid2().optional(),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateSettlementInput = z.input<typeof createSettlementSchema>
export type SettlementFilters = z.infer<typeof settlementFiltersSchema>
