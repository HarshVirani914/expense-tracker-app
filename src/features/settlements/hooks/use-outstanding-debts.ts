import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

type OutstandingDebt = {
  groupId: string
  groupName: string
  memberName: string
  memberId: string
  isUser: boolean
  amount: number
  type: 'owes' | 'owed'
}

export const useOutstandingDebts = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['outstanding-debts'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: OutstandingDebt[] }>(
        '/api/settlements/outstanding'
      )
      return response.data
    },
  })

  return {
    debts: data || [],
    isLoading,
    error,
  }
}
