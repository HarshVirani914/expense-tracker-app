import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ImportResult, ExportFilters } from '../types'

export const useImportExpenses = () => {
  const queryClient = useQueryClient()

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      if (result.failed > 0) {
        toast.warning(`Imported ${result.success} expenses. ${result.failed} rows failed.`)
      } else {
        toast.success(`Successfully imported ${result.success} expenses`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import expenses')
    },
  })
}

export const useExportExpenses = () => {
  return useMutation({
    mutationFn: async (filters?: ExportFilters) => {
      const response = await fetch('/api/import-export/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters || {}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to export expenses')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onSuccess: () => {
      toast.success('Expenses exported successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export expenses')
    },
  })
}

export const useDownloadTemplate = () => {
  const downloadTemplate = () => {
    const a = document.createElement('a')
    a.href = '/api/import-export/template'
    a.download = 'expense-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Template downloaded')
  }

  return { downloadTemplate }
}
