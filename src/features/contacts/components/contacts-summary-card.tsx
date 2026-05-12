"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IconReceipt, IconUserCheck, IconUsers } from "@tabler/icons-react";
import { memo } from "react";
import type { ContactStats } from "../types";

type ContactsSummaryCardProps = {
  stats: ContactStats;
};

export const ContactsSummaryCard = memo(
  ({ stats }: ContactsSummaryCardProps) => {
    const { totalContacts, activeContacts, totalExpenses } = stats;

    const statItems = [
      {
        label: "Total Contacts",
        value: totalContacts,
        icon: IconUsers,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "Active Contacts",
        value: activeContacts,
        icon: IconUserCheck,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
      },
      {
        label: "Total Expenses",
        value: totalExpenses,
        icon: IconReceipt,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
      },
    ];

    return (
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-none">
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(white,transparent_70%)]" />

        <div className="relative p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Contact Overview
              </p>
              <div className="text-4xl font-bold tracking-tight">
                {totalContacts}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeContacts} active in groups or expenses
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <IconUsers className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {statItems.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={cn("rounded-lg p-3 space-y-2", bg)}>
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", color)} />
                  <p className="text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  },
);

ContactsSummaryCard.displayName = "ContactsSummaryCard";
