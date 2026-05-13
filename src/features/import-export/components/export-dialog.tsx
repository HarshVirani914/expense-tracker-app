"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useExportExpenses } from "../hooks"
import type { ExportFilters } from "../types"

type ExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ExportDialog = ({ open, onOpenChange }: ExportDialogProps) => {
  const [filters, setFilters] = useState<ExportFilters>({})
  const { categories } = useCategories()
  const exportExpenses = useExportExpenses()

  const handleExport = async () => {
    await exportExpenses.mutateAsync(filters)
    onOpenChange(false)
    setFilters({})
  }

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: date?.toISOString(),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Expenses</DialogTitle>
          <DialogDescription>
            Configure filters and download your expenses as CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-start-date">Start Date</Label>
              <DatePicker
                date={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => handleDateChange('startDate', date)}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-end-date">End Date</Label>
              <DatePicker
                date={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => handleDateChange('endDate', date)}
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-category">Category</Label>
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(value) =>
                setFilters(prev => ({
                  ...prev,
                  categoryId: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-type">Type</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters(prev => ({
                  ...prev,
                  type: value === 'all' ? undefined : (value as 'EXPENSE' | 'INCOME'),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="EXPENSE">Expenses Only</SelectItem>
                <SelectItem value="INCOME">Income Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exportExpenses.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportExpenses.isPending}
          >
            {exportExpenses.isPending ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
