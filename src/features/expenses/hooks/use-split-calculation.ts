import { useMemo } from 'react'
import type { MemberInfo } from '@/features/groups/types'
import type { ParticipantInput } from '../schemas'
import { SplitType } from '@/types/prisma'

type SplitValues = Record<string, number>

export const useSplitCalculation = (
  members: MemberInfo[],
  totalAmount: number,
  splitType: SplitType,
  splitValues: SplitValues,
  payerId?: string
): ParticipantInput[] => {
  return useMemo(() => {
    if (members.length === 0 || totalAmount <= 0) return []

    return members.map((member) => {
      const memberKey = member.userId || member.contactId || ''
      let oweAmount = 0

      switch (splitType) {
        case SplitType.EQUAL:
          oweAmount = totalAmount / members.length
          break

        case SplitType.EXACT:
          oweAmount = totalAmount / members.length
          break

        case SplitType.PERCENTAGE:
          const percentage = splitValues[memberKey] || 0
          oweAmount = (totalAmount * percentage) / 100
          break

        case SplitType.SHARES:
          const totalShares = Object.values(splitValues).reduce((sum, val) => sum + val, 0)
          const memberShares = splitValues[memberKey] || 0
          oweAmount = totalShares > 0 ? (totalAmount * memberShares) / totalShares : 0
          break
      }

      const paidAmount =
        splitType === SplitType.EXACT
          ? splitValues[memberKey] || 0
          : memberKey === payerId
          ? totalAmount
          : 0

      return {
        memberIdOrContact: memberKey,
        paidAmount,
        oweAmount,
        splitType,
        splitValue: splitValues[memberKey] || (splitType === SplitType.SHARES ? 1 : 0),
        isUser: member.isCurrentUser,
      }
    })
  }, [members, totalAmount, splitType, splitValues, payerId])
}
