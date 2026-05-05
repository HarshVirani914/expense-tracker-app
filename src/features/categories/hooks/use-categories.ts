import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Category } from '../types'
import type { ApiResponse } from '@/types/api'

const CATEGORIES_KEY = ['categories'] as const

export const useCategories = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category[]>>('/api/categories')
      return response.data
    },
  })

  return {
    categories: data,
    isLoading,
    error,
    refetch,
  }
}
