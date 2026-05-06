import type { Settlement } from '@/types/prisma'
import type { FilterOptions } from '@/types/api'

export type { Settlement }

export type SettlementWithRelations = Settlement & {
  group: {
    id: string
    name: string
  }
  payerUser?: {
    id: string
    name: string | null
  } | null
  payerContact?: {
    id: string
    name: string
  } | null
  receiverUser?: {
    id: string
    name: string | null
  } | null
  receiverContact?: {
    id: string
    name: string
  } | null
}

export type CreateSettlementInput = {
  amount: number
  date?: Date | string
  notes?: string | null
  groupId: string
  payerUserId?: string | null
  payerContactId?: string | null
  receiverUserId?: string | null
  receiverContactId?: string | null
}

export type SettlementFilters = FilterOptions & {
  groupId?: string
}
