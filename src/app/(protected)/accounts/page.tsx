'use client'

import { useState } from 'react'
import { AccountList } from '@/features/accounts/components/account-list'
import { AccountFormDialog } from '@/features/accounts/components/account-form-dialog'
import type { AccountWithBalance } from '@/features/accounts/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<
    AccountWithBalance | undefined
  >(undefined)

  const handleEdit = (account: AccountWithBalance) => {
    setSelectedAccount(account)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedAccount(undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your accounts and balances</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      <AccountList onEdit={handleEdit} />

      <AccountFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        account={selectedAccount}
      />
    </div>
  )
}
