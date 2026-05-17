'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FeaturePageHero } from '@/components/layout/feature-page-hero'
import { GroupList } from '@/features/groups/components/group-list'
import { GroupFormDialog } from '@/features/groups/components/group-form-dialog'
import { GroupsSummaryCard } from '@/features/groups/components/groups-summary-card'
import { useGroupStats } from '@/features/groups/hooks/use-group-stats'
import type { GroupWithMembers, GroupFilters } from '@/features/groups/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Skeleton } from '@/components/ui/skeleton'

function GroupsPageContent() {
  const isMobile = useIsMobile()
  const searchParams = useSearchParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<
    GroupWithMembers | undefined
  >(undefined)
  
  const [filters, setFilters] = useState<GroupFilters>({
    page: 1,
    limit: 100,
    search: '',
  })

  const { stats, isLoading: isStatsLoading } = useGroupStats()

  const filtersWithParams = useMemo(() => {
    const contactId = searchParams.get('contact')
    
    return {
      ...filters,
      ...(contactId && { contactId }),
    }
  }, [filters, searchParams])

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
      {!isMobile && (
        <FeaturePageHero className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Groups</h1>
              <p className="text-muted-foreground text-base">
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
        </FeaturePageHero>
      )}

      {isStatsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : stats ? (
        <GroupsSummaryCard stats={stats} />
      ) : null}

      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <GroupList onEdit={handleEdit} filters={filtersWithParams} />

      <GroupFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        group={selectedGroup}
      />

      {isMobile && (
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="fixed bottom-26 right-6 h-14 w-14 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform"
        >
          <IconPlus className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}

export default function GroupsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    }>
      <GroupsPageContent />
    </Suspense>
  )
}
