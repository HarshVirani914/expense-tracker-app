'use client'

import { useAccounts } from '../hooks/use-accounts'
import { useDeleteAccount } from '../hooks/use-delete-account'
import { toast } from 'sonner'
import type { AccountWithBalance } from '../types'
import { useConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState } from '@/components/empty-state'
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
      <EmptyState
        icon={IconWallet}
        title="No accounts yet"
        description="Create your first account to start tracking your balances and transactions"
        actionLabel="Add First Account"
        onAction={onAddAccount}
      />
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
