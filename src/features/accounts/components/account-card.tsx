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
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
  },
  [AccountType.CURRENT]: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    icon: "text-purple-600 dark:text-purple-400",
  },
  [AccountType.WALLET]: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400",
  },
  [AccountType.CASH]: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  [AccountType.CREDIT_CARD]: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    icon: "text-orange-600 dark:text-orange-400",
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
                className="h-8 w-8"
              >
                <IconPencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(account.id, account.name)}
                className="h-8 w-8"
              >
                <IconTrash className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Current Balance
              </p>
              <p className={cn("text-2xl font-bold font-mono", colors.text)}>
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
