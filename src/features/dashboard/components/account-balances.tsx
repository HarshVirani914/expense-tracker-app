"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AccountWithBalance } from "@/features/accounts/types";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import {
  IconWallet,
  IconCreditCard,
  IconBuildingBank,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { memo } from "react";
import { formatCurrency } from "@/lib/format";

type AccountBalancesProps = {
  accounts: AccountWithBalance[];
};

const ACCOUNT_ICONS = {
  SAVINGS: IconBuildingBank,
  CURRENT: IconBuildingBank,
  WALLET: IconWallet,
  CASH: IconCurrencyRupee,
  CREDIT_CARD: IconCreditCard,
};

export const AccountBalances = memo(({ accounts }: AccountBalancesProps) => {
  if (accounts.length === 0) {
    return (
      <Card className="@container/acct shadow-none mb-3 sm:mb-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWallet className="h-5 w-5 shrink-0 text-primary" />
            Accounts
          </CardTitle>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.accountsCardSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No accounts yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/acct shadow-none mb-3 sm:mb-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconWallet className="h-5 w-5 shrink-0 text-primary" />
          Accounts
        </CardTitle>
        <CardDescription className="text-xs">
          {MONEY_SEMANTICS.accountsCardSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type];
            return (
              <div
                key={account.id}
                className="flex flex-col gap-3 rounded-lg border p-3 @lg/acct:flex-row @lg/acct:items-center @lg/acct:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-full bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium wrap-break-word">{account.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {account.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 @lg/acct:items-end">
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(account.currentBalance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Initial: {formatCurrency(Number(account.initialBalance))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

AccountBalances.displayName = "AccountBalances";
