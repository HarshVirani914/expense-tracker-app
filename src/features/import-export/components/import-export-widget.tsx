"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconFileImport, IconFileExport } from "@tabler/icons-react"
import { ImportDialog } from "./import-dialog"
import { ExportDialog } from "./export-dialog"

export const ImportExportWidget = () => {
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Import & Export</h3>
          <p className="text-sm text-muted-foreground">
            Import expenses from CSV or export your data
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setImportOpen(true)}
            >
              <IconFileImport className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setExportOpen(true)}
            >
              <IconFileExport className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </>
  )
}
