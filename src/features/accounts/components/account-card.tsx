"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  IconBuildingBank,
  IconCash,
  IconCreditCard,
  IconCurrencyDollar,
  IconPencil,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";
import { AccountType } from "@/types/prisma";
import type { AccountWithBalance } from "../types";

type AccountCardProps = {
  account: AccountWithBalance;
  onEdit: (account: AccountWithBalance) => void;
  onDelete: (id: string, name: string) => void;
};

const ACCOUNT_ICONS = {
  [AccountType.SAVINGS]: IconBuildingBank,
  [AccountType.CURRENT]: IconBuildingBank,
  [AccountType.WALLET]: IconWallet,
  [AccountType.CASH]: IconCurrencyDollar,
  [AccountType.CREDIT_CARD]: IconCreditCard,
};

const ACCOUNT_COLORS = {
  [AccountType.SAVINGS]: {
    bg: "bg-chart-3/10",
    text: "text-chart-3",
    icon: "text-chart-3",
  },
  [AccountType.CURRENT]: {
    bg: "bg-chart-1/10",
    text: "text-chart-1",
    icon: "text-chart-1",
  },
  [AccountType.WALLET]: {
    bg: "bg-chart-2/10",
    text: "text-chart-2",
    icon: "text-chart-2",
  },
  [AccountType.CASH]: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  [AccountType.CREDIT_CARD]: {
    bg: "bg-chart-4/10",
    text: "text-chart-4",
    icon: "text-chart-4",
  },
};

export const AccountCard = ({
  account,
  onEdit,
  onDelete,
}: AccountCardProps) => {
  const Icon = ACCOUNT_ICONS[account.type];
  const colors = ACCOUNT_COLORS[account.type];

  return (
    <Card className="shadow-none hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full p-2.5", colors.bg)}>
                <Icon className={cn("h-5 w-5", colors.icon)} />
              </div>
              <div>
                <h3 className="font-semibold text-base">{account.name}</h3>
                <Badge variant="secondary" className="text-xs mt-1 capitalize">
                  {account.type.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(account)}
                aria-label="Edit account"
                className="h-8 w-8 max-sm:h-9 max-sm:w-9"
              >
                <IconPencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(account.id, account.name)}
                aria-label="Delete account"
                className="h-8 w-8 max-sm:h-9 max-sm:w-9"
              >
                <IconTrash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Current Balance
              </p>
              <p className={cn("text-2xl font-bold font-display", colors.text)}>
                {formatCurrency(account.currentBalance)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Initial Balance
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(Number(account.initialBalance))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
