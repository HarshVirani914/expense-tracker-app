import { z } from 'zod'
import { AccountType } from '@/types/prisma'

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim(),
  type: z.enum(AccountType),
  initialBalance: z
    .number()
    .min(0, 'Initial balance cannot be negative')
    .default(0),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g., USD, EUR, INR)')
    .toUpperCase()
    .default('INR'),
})

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters')
    .trim()
    .optional(),
  type: z.enum(AccountType).optional(),
  initialBalance: z
    .number()
    .min(0, 'Initial balance cannot be negative')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g., USD, EUR, INR)')
    .toUpperCase()
    .optional(),
})

export type CreateAccountInput = z.input<typeof createAccountSchema>
export type CreateAccountSchema = z.output<typeof createAccountSchema>
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>
