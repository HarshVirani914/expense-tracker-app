import { toast } from 'sonner'

export const useDownloadTemplate = () => {
  const downloadTemplate = () => {
    try {
      const a = document.createElement('a')
      a.href = '/api/import-export/template'
      a.download = 'expense-template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      toast.success('Template downloaded', {
        description: 'Use this template to import your expenses'
      })
    } catch (error) {
      toast.error('Download failed', {
        description: 'Failed to download template'
      })
    }
  }

  return { downloadTemplate }
}
