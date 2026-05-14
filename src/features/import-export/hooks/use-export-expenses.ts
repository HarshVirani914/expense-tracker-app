import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ExportFilters } from '../types'
import { format } from 'date-fns'

export const useExportExpenses = () => {
  const { mutateAsync, isPending, error } = useMutation({
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
      
      // Generate filename based on filters
      let filename = 'expenses'
      if (filters?.groupId) {
        filename += '-group'
      }
      if (filters?.categoryId) {
        filename += '-filtered'
      }
      filename += `-${format(new Date(), 'yyyy-MM-dd')}.csv`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Export successful', {
        description: 'Your expenses have been exported to CSV'
      })
    },
    onError: (error: Error) => {
      toast.error('Export failed', {
        description: error.message || 'Failed to export expenses'
      })
    },
  })

  const exportExpenses = async (filters?: ExportFilters) => {
    return await mutateAsync(filters)
  }

  return {
    exportExpenses,
    isExporting: isPending,
    error,
  }
}
