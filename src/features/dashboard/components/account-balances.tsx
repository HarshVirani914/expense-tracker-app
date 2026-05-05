'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AccountWithBalance } from '@/features/accounts/types'
import { Wallet, CreditCard, Landmark, DollarSign } from 'lucide-react'

type AccountBalancesProps = {
  accounts: AccountWithBalance[]
}

const ACCOUNT_ICONS = {
  SAVINGS: Landmark,
  CURRENT: Landmark,
  WALLET: Wallet,
  CASH: DollarSign,
  CREDIT_CARD: CreditCard,
}

export const AccountBalances = ({ accounts }: AccountBalancesProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No accounts yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type]
            return (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {account.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(account.currentBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Initial: {formatCurrency(Number(account.initialBalance))}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
