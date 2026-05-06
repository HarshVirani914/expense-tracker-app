'use client'

import { useState } from 'react'
import { GroupList } from '@/features/groups/components/group-list'
import { GroupFormDialog } from '@/features/groups/components/group-form-dialog'
import type { GroupWithMembers, GroupFilters } from '@/features/groups/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconPlus, IconUsers, IconSearch } from '@tabler/icons-react'

export default function GroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<
    GroupWithMembers | undefined
  >(undefined)
  
  const [filters, setFilters] = useState<GroupFilters>({
    page: 1,
    limit: 20,
    search: '',
  })

  const handleEdit = (group: GroupWithMembers) => {
    setSelectedGroup(group)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedGroup(undefined)
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <IconUsers className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Groups</h1>
          </div>
          <p className="text-muted-foreground text-base pl-[52px]">
            Manage groups and split expenses
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <IconPlus className="h-5 w-5" />
          Create Group
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <GroupList onEdit={handleEdit} filters={filters} />

      <GroupFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        group={selectedGroup}
      />
    </div>
  )
}
