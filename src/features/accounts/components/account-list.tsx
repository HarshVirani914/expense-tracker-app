'use client'

import { useAccounts } from '../hooks/use-accounts'
import { useDeleteAccount } from '../hooks/use-delete-account'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import type { AccountWithBalance } from '../types'
import { useConfirmDialog } from '@/components/confirm-dialog'
import { GridSkeleton } from '@/components/skeletons'
import { AccountCard } from './account-card'
import { IconWallet } from '@tabler/icons-react'

type AccountListProps = {
  onEdit: (account: AccountWithBalance) => void
  onAddAccount?: () => void
}

export const AccountList = ({ onEdit, onAddAccount }: AccountListProps) => {
  const { accounts, isLoading } = useAccounts()
  const { deleteAccount } = useDeleteAccount()
  const { confirm } = useConfirmDialog()

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Account',
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (confirmed) {
      try {
        await deleteAccount(id)
        toast.success('Account deleted successfully')
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete account'
        toast.error(message)
      }
    }
  }

  if (isLoading) {
    return <GridSkeleton count={6} />
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <IconWallet className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create your first account to start tracking your balances and transactions
          </p>
          {onAddAccount && (
            <Button onClick={onAddAccount} size="lg">
              Add First Account
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
