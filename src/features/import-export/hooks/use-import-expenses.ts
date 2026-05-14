import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ImportResult } from '../types'

const EXPENSES_KEY = ['expenses'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const
const DASHBOARD_KEY = ['dashboard'] as const

export const useImportExpenses = () => {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import-export/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to import expenses')
      }

      const result = await response.json()
      return result.data as ImportResult
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })

      if (result.failed > 0) {
        toast.warning(
          `Imported ${result.success} expense${result.success !== 1 ? 's' : ''}. ${result.failed} row${result.failed !== 1 ? 's' : ''} failed.`,
          { description: 'Check the error details for more information' }
        )
      } else {
        toast.success(
          `Successfully imported ${result.success} expense${result.success !== 1 ? 's' : ''}`
        )
      }
    },
    onError: (error: Error) => {
      toast.error('Import failed', {
        description: error.message || 'Failed to import expenses'
      })
    },
  })

  const importExpenses = async (file: File) => {
    return await mutateAsync(file)
  }

  return {
    importExpenses,
    isImporting: isPending,
    error,
  }
}
