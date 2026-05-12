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
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 py-3 bg-muted/50 rounded-lg">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <IconUsers className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-2xl font-bold tabular-nums">{memberCount}</span>
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          members
        </span>
      </div>
      
      <Separator orientation="vertical" className="h-10 hidden sm:block" />
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <IconReceipt className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-2xl font-bold tabular-nums">{expenseCount}</span>
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          expenses
        </span>
      </div>
      
      <Separator orientation="vertical" className="h-10 hidden sm:block" />
      
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <IconTrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-lg sm:text-xl font-semibold tabular-nums truncate">
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          total spent
        </span>
      </div>
    </div>
  );
};
