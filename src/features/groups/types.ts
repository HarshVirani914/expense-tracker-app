import type { Group, GroupMember, Contact } from '@/types/prisma'
import type { FilterOptions } from '@/types/api'

export type { Group, GroupMember }

export type MemberInfo = {
  id: string
  name: string
  email?: string | null
  isCurrentUser: boolean
  userId?: string | null
  contactId?: string | null
}

export type GroupWithMembers = Group & {
  members: (GroupMember & {
    user?: { id: string; name: string | null; email: string } | null
    contact?: Contact | null
  })[]
  _count?: {
    expenses: number
  }
}

export type GroupBalance = {
  memberId: string
  memberName: string
  isCurrentUser: boolean
  totalPaid: number
  totalOwed: number
  netBalance: number
  owesTo: {
    memberId: string
    memberName: string
    amount: number
  }[]
  owedBy: {
    memberId: string
    memberName: string
    amount: number
  }[]
}

export type CreateGroupInput = {
  name: string
  description?: string | null
  memberIds: string[]
}

export type UpdateGroupInput = {
  name?: string
  description?: string | null
}

export type AddMemberInput = {
  contactId: string
}

export type GroupFilters = FilterOptions & {
  search?: string
}
