import type { Category } from '@/types/prisma'

export type { Category }

export type CategoryWithUsage = Category & {
  _count?: {
    expenses: number
  }
}

export type CreateCategoryInput = {
  name: string
  color: string
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export const DEFAULT_CATEGORIES = [
  { name: 'Family', color: '#EF4444' },
  { name: 'Friends', color: '#F59E0B' },
  { name: 'Lifestyle', color: '#10B981' },
  { name: 'Food', color: '#3B82F6' },
  { name: 'Transportation', color: '#6366F1' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Shopping', color: '#EC4899' },
  { name: 'Bills & Utilities', color: '#14B8A6' },
  { name: 'Healthcare', color: '#F43F5E' },
  { name: 'Other', color: '#6B7280' },
] as const
