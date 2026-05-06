import type { Contact } from '@/types/prisma'
import type { FilterOptions } from '@/types/api'

export type { Contact }

export type ContactWithRelations = Contact & {
  _count?: {
    groupMemberships: number
    expenseParticipants: number
  }
}

export type CreateContactInput = {
  name: string
  email?: string | null
  phone?: string | null
}

export type UpdateContactInput = {
  name?: string
  email?: string | null
  phone?: string | null
}

export type ContactFilters = FilterOptions & {
  search?: string
}
