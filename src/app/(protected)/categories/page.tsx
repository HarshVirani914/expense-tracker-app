'use client'

import { useState } from 'react'
import { CategoryList } from '@/features/categories/components/category-list'
import { CategoryFormDialog } from '@/features/categories/components/category-form-dialog'
import type { Category } from '@/features/categories/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(
    undefined
  )

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedCategory(undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your expense categories</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoryList onEdit={handleEdit} />

      <CategoryFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        category={selectedCategory}
      />
    </div>
  )
}
