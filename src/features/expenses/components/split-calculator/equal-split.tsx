"use client";

import { useMemo } from "react";
import type { MemberInfo } from "@/features/groups/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconUsersGroup } from "@tabler/icons-react";
import { formatCurrencyWithDecimals } from "@/lib/format";

type EqualSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
};

export const EqualSplit = ({ members, totalAmount }: EqualSplitProps) => {
  const splitAmount = useMemo(
    () => (members.length > 0 ? totalAmount / members.length : 0),
    [totalAmount, members.length],
  );

  if (members.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Select group members to see the split
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <IconUsersGroup className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Equal Split</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Amount split equally among all members
        </p>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{member.name}</span>
                {member.isCurrentUser && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <span className="text-sm font-semibold">
                {formatCurrencyWithDecimals(splitAmount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
