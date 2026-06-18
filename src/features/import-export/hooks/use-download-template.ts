import { toast } from 'sonner'

export const useDownloadTemplate = () => {
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/import-export/template')

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'expense-import-template.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Template downloaded', {
        description: 'Open in Excel or Google Sheets — dropdowns are pre-filled with your categories and accounts',
      })
    } catch {
      toast.error('Download failed', {
        description: 'Failed to generate template',
      })
    }
  }

  return { downloadTemplate }
}
