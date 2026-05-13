import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { RecurringExpenseWithRelations, RecurringExpense, UpcomingRecurrence } from '../types'
import type { CreateRecurringExpenseInput, UpdateRecurringExpenseInput } from '../schemas'
import type { ApiResponse } from '@/types/api'

const RECURRING_EXPENSES_KEY = ['recurring-expenses'] as const

export const useRecurringExpenses = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: RECURRING_EXPENSES_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecurringExpenseWithRelations[]>>(
        '/api/recurring-expenses'
      )
      return response.data
    },
  })

  return {
    recurringExpenses: data,
    isLoading,
    error,
    refetch,
  }
}

export const useRecurringExpense = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...RECURRING_EXPENSES_KEY, id] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<RecurringExpenseWithRelations>>(
        `/api/recurring-expenses/${id}`
      )
      return response.data
    },
    enabled: !!id,
  })

  return {
    recurringExpense: data,
    isLoading,
    error,
    refetch,
  }
}

export const useCreateRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRecurringExpenseInput) => {
      const response = await apiClient.post<ApiResponse<RecurringExpense>>(
        '/api/recurring-expenses',
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      toast.success('Recurring expense created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create recurring expense')
    },
  })
}

export const useUpdateRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRecurringExpenseInput }) => {
      const response = await apiClient.patch<ApiResponse<RecurringExpense>>(
        `/api/recurring-expenses/${id}`,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: [...RECURRING_EXPENSES_KEY, variables.id] })
      toast.success('Recurring expense updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update recurring expense')
    },
  })
}

export const useDeleteRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/api/recurring-expenses/${id}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      toast.success('Recurring expense deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete recurring expense')
    },
  })
}

export const useToggleRecurringExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<ApiResponse<RecurringExpense>>(
        `/api/recurring-expenses/${id}/toggle`,
        {}
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECURRING_EXPENSES_KEY })
      toast.success('Recurring expense status updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle recurring expense')
    },
  })
}

export const useUpcomingRecurringExpenses = (days = 7) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...RECURRING_EXPENSES_KEY, 'upcoming', days] as const,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UpcomingRecurrence[]>>(
        '/api/recurring-expenses/upcoming',
        { days }
      )
      return response.data
    },
  })

  return {
    upcoming: data,
    isLoading,
    error,
    refetch,
  }
}
