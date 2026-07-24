import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  SmartImportAnalyzeResult,
  SmartImportConfirmResult,
  SmartImportRow,
} from '../types'

const EXPENSES_KEY = ['expenses'] as const
const EXPENSE_SUMMARY_KEY = ['expense-summary'] as const
const DASHBOARD_KEY = ['dashboard'] as const
const ACCOUNTS_KEY = ['accounts'] as const

export const useSmartImport = () => {
  const queryClient = useQueryClient()

  const analyzeMutation = useMutation({
    mutationFn: async ({
      text,
      images,
    }: {
      text?: string
      images?: File[]
    }): Promise<SmartImportAnalyzeResult> => {
      const formData = new FormData()

      if (text) {
        formData.append('mode', 'text')
        formData.append('text', text)
      } else if (images && images.length > 0) {
        formData.append('mode', 'image')
        images.forEach((image) => formData.append('images', image))
      } else {
        throw new Error('Provide text or images to analyze')
      }

      const response = await fetch('/api/import-export/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to analyze import data')
      }

      const result = await response.json()
      return result.data as SmartImportAnalyzeResult
    },
    onError: (error: Error) => {
      toast.error('Analysis failed', { description: error.message })
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async ({
      sessionId,
      rows,
    }: {
      sessionId: string
      rows: SmartImportRow[]
    }): Promise<SmartImportConfirmResult> => {
      const response = await fetch('/api/import-export/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rows }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to confirm import')
      }

      const result = await response.json()
      return result.data as SmartImportConfirmResult
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_KEY })
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })

      if (result.failed > 0) {
        toast.warning(
          `Imported ${result.imported} expense${result.imported !== 1 ? 's' : ''}. ${result.failed} failed.`,
        )
      } else {
        toast.success(
          `Successfully imported ${result.imported} expense${result.imported !== 1 ? 's' : ''}`,
        )
      }
    },
    onError: (error: Error) => {
      toast.error('Import failed', { description: error.message })
    },
  })

  return {
    analyzeText: (text: string) => analyzeMutation.mutateAsync({ text }),
    analyzeImages: (images: File[]) => analyzeMutation.mutateAsync({ images }),
    confirmImport: (sessionId: string, rows: SmartImportRow[]) =>
      confirmMutation.mutateAsync({ sessionId, rows }),
    isAnalyzing: analyzeMutation.isPending,
    isConfirming: confirmMutation.isPending,
    analyzeError: analyzeMutation.error,
    confirmError: confirmMutation.error,
  }
}
