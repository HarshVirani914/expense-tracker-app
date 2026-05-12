import type { Contact } from '@/types/prisma'
import type { FilterOptions } from '@/types/api'

export type { Contact }

export type ContactWithRelations = Contact & {
  _count?: {
    groupMemberships: number
    expenseParticipants: number
  }
}

export type ContactDeletionCheck = {
  canDelete: boolean
  reasons: {
    activeGroups: { id: string; name: string }[]
    unsettledExpenses: number
    totalOwed: number
    totalOwing: number
  }
}

export type ContactSharedExpense = {
  id: string
  amount: number
  description: string | null
  date: Date
  groupId: string
  groupName: string
  categoryName: string
  categoryColor: string
  userPaid: number
  userOwes: number
  contactPaid: number
  contactOwes: number
}

export type ContactStats = {
  totalContacts: number
  activeContacts: number
  totalGroupMemberships: number
  totalExpenses: number
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
