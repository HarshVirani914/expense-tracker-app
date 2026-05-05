import type { Account, AccountType } from '@/types/prisma'

export { AccountType }

export type { Account }

export type AccountWithBalance = Account & {
  currentBalance: number
}

export type CreateAccountInput = {
  name: string
  type: AccountType
  initialBalance?: number
  currency?: string
}

export type UpdateAccountInput = Partial<CreateAccountInput>
