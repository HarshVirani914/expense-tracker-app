import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useGroup } from './use-group'
import { getMembersInfo } from '../utils/member-info'
import type { MemberInfo } from '../types'

export const useGroupMembers = (groupId?: string) => {
  const { userId } = useAuth()
  const { group, isLoading, error, refetch } = useGroup(groupId)

  const members = useMemo<MemberInfo[]>(() => {
    if (!group) return []
    return getMembersInfo(group, userId || '')
  }, [group, userId])

  return {
    members,
    isLoading,
    error,
    refetch,
  }
}
