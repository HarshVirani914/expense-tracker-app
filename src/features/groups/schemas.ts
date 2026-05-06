import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().nullable().or(z.literal('')),
  memberIds: z.array(z.string()).min(1, 'At least one member is required'),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Name is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional().nullable().or(z.literal('')),
  memberIds: z.array(z.string()).optional(),
})

export const addMemberSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
})

export const groupFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
export type AddMemberInput = z.infer<typeof addMemberSchema>
export type GroupFilters = z.infer<typeof groupFiltersSchema>
