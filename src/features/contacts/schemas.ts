import { z } from 'zod'

const phoneRegex = /^[\d\s\-\(\)\+]+$/
const minDigits = 10

const phoneValidation = z
  .string()
  .optional()
  .nullable()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val === '') return true
      
      // Check if it matches allowed characters (digits, spaces, hyphens, parentheses, plus)
      if (!phoneRegex.test(val)) return false
      
      // Extract only digits to check minimum length
      const digits = val.replace(/\D/g, '')
      return digits.length >= minDigits
    },
    {
      message: 'Phone number must contain at least 10 digits and only numbers, spaces, hyphens, parentheses, or plus sign',
    }
  )

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: phoneValidation,
})

export const updateContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  email: z
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: phoneValidation,
})

export const contactFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type UpdateContactInput = z.infer<typeof updateContactSchema>
export type ContactFilters = z.infer<typeof contactFiltersSchema>
