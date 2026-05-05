import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .trim(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color format. Use hex color (e.g., #FF0000)')
    .default('#9333EA'),
})

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color format. Use hex color (e.g., #FF0000)')
    .optional(),
})

export type CreateCategoryInput = z.input<typeof createCategorySchema>
export type CreateCategorySchema = z.output<typeof createCategorySchema>
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>
