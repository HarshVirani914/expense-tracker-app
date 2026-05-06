"use client";

import { useState, useEffect } from "react";
import type { MemberInfo } from "@/features/groups/types";
import type { ParticipantInput } from "../../schemas";
import { SplitType } from "@/types/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCoins } from "@tabler/icons-react";

type ExactSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  participants: ParticipantInput[];
  onParticipantsChange: (participants: ParticipantInput[]) => void;
};

export const ExactSplit = ({
  members,
  totalAmount,
  participants,
  onParticipantsChange,
}: ExactSplitProps) => {
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialAmounts: Record<string, number> = {};
    members.forEach((member) => {
      const memberId = member.userId || member.contactId || "";
      initialAmounts[memberId] = 0;
    });
    setAmounts(initialAmounts);
  }, [members]);

  const handleAmountChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newAmounts = { ...amounts, [memberId]: numValue };
    setAmounts(newAmounts);

    const newParticipants: ParticipantInput[] = members.map((member) => {
      const memberKey = member.userId || member.contactId || "";
      return {
        memberIdOrContact: memberKey,
        paidAmount: 0,
        oweAmount: newAmounts[memberKey] || 0,
        splitType: SplitType.EXACT,
        splitValue: newAmounts[memberKey] || 0,
        isUser: member.isCurrentUser,
      };
    });

    onParticipantsChange(newParticipants);
  };

  const totalAssigned = Object.values(amounts).reduce((sum, val) => sum + val, 0);
  const remaining = totalAmount - totalAssigned;

  if (members.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Select group members to specify exact amounts
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <IconCoins className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Exact Amounts</h3>
      </div>
      
      <div className="space-y-3 mb-4">
        {members.map((member) => {
          const memberId = member.userId || member.contactId || "";
          return (
            <div key={member.id} className="space-y-2">
              <Label htmlFor={`amount-${memberId}`}>
                {member.name}
                {member.isCurrentUser && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    You
                  </Badge>
                )}
              </Label>
              <Input
                id={`amount-${memberId}`}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amounts[memberId] || ""}
                onChange={(e) => handleAmountChange(memberId, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Total assigned:</span>
          <span className="font-semibold">${totalAssigned.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Remaining:</span>
          <Badge variant={Math.abs(remaining) < 0.01 ? "default" : "destructive"}>
            ${remaining.toFixed(2)}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
