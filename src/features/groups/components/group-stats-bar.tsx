"use client";

import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  IconReceipt,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

type GroupStatsBarProps = {
  memberCount: number;
  expenseCount: number;
  totalSpent: number;
};

export const GroupStatsBar = ({
  memberCount,
  expenseCount,
  totalSpent,
}: GroupStatsBarProps) => {
  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-muted/50 rounded-lg">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <IconUsers className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">{memberCount}</span>
        </div>
        <span className="text-xs text-muted-foreground">members</span>
      </div>
      <Separator orientation="vertical" className="h-10" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <IconReceipt className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">{expenseCount}</span>
        </div>
        <span className="text-xs text-muted-foreground">expenses</span>
      </div>
      <Separator orientation="vertical" className="h-10" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">{formatCurrency(totalSpent)}</span>
        </div>
        <span className="text-xs text-muted-foreground">total spent</span>
      </div>
    </div>
  );
};
