'use client'

import { useAccounts } from '../hooks/use-accounts'
import { useDeleteAccount } from '../hooks/use-delete-account'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconPencil, IconTrash, IconWallet, IconCreditCard, IconBuildingBank, IconCurrencyDollar } from '@tabler/icons-react'
import { toast } from 'sonner'
import type { AccountWithBalance } from '../types'
import { AccountType } from '@/types/prisma'
import { useConfirmDialog } from '@/components/confirm-dialog'
import { GridSkeleton } from '@/components/skeletons'

type AccountListProps = {
  onEdit: (account: AccountWithBalance) => void
}

const ACCOUNT_ICONS = {
  [AccountType.SAVINGS]: IconBuildingBank,
  [AccountType.CURRENT]: IconBuildingBank,
  [AccountType.WALLET]: IconWallet,
  [AccountType.CASH]: IconCurrencyDollar,
  [AccountType.CREDIT_CARD]: IconCreditCard,
}

export const AccountList = ({ onEdit }: AccountListProps) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return <GridSkeleton count={6} />
  }

  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No accounts found. Create your first account to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const Icon = ACCOUNT_ICONS[account.type]
        return (
          <Card key={account.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{account.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {account.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(account)}
                  >
                    <IconPencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(account.id, account.name)}
                  >
                    <IconTrash className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Initial: {formatCurrency(Number(account.initialBalance))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
