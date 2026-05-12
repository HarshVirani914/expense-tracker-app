"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  IconReceipt,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

type GroupStatsCardProps = {
  memberCount: number;
  expenseCount: number;
  totalSpent: number;
};

export const GroupStatsCard = ({
  memberCount,
  expenseCount,
  totalSpent,
}: GroupStatsCardProps) => {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconUsers className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Members
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight">{memberCount}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconReceipt className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Expenses
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight">{expenseCount}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconTrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Total Spent
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold tracking-tight truncate">
            {formatCurrency(totalSpent)}
          </p>
        </div>
      </div>
    </Card>
  );
};
