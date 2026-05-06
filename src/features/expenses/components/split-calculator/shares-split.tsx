"use client";

import { useState, useEffect } from "react";
import type { MemberInfo } from "@/features/groups/types";
import type { ParticipantInput } from "../../schemas";
import { SplitType } from "@/types/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconScale } from "@tabler/icons-react";

type SharesSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  participants: ParticipantInput[];
  onParticipantsChange: (participants: ParticipantInput[]) => void;
};

export const SharesSplit = ({
  members,
  totalAmount,
  participants,
  onParticipantsChange,
}: SharesSplitProps) => {
  const [shares, setShares] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialShares: Record<string, number> = {};
    members.forEach((member) => {
      const memberId = member.userId || member.contactId || "";
      initialShares[memberId] = 1;
    });
    setShares(initialShares);
  }, [members]);

  const handleShareChange = (memberId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const newShares = { ...shares, [memberId]: numValue };
    setShares(newShares);

    const totalShares = Object.values(newShares).reduce((sum, val) => sum + val, 0);

    if (totalShares === 0) return;

    const newParticipants: ParticipantInput[] = members.map((member) => {
      const memberKey = member.userId || member.contactId || "";
      const memberShares = newShares[memberKey] || 0;
      const oweAmount = (totalAmount * memberShares) / totalShares;

      return {
        memberIdOrContact: memberKey,
        paidAmount: 0,
        oweAmount,
        splitType: SplitType.SHARES,
        splitValue: memberShares,
        isUser: member.isCurrentUser,
      };
    });

    onParticipantsChange(newParticipants);
  };

  const totalShares = Object.values(shares).reduce((sum, val) => sum + val, 0);

  if (members.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Select group members to specify shares
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <IconScale className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Shares Split</h3>
        <Badge variant="secondary" className="text-xs">
          1:2:3 ratio
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {members.map((member) => {
          const memberId = member.userId || member.contactId || "";
          const memberShares = shares[memberId] || 0;
          const amount =
            totalShares > 0 ? (totalAmount * memberShares) / totalShares : 0;

          return (
            <div key={member.id} className="space-y-2">
              <Label htmlFor={`shares-${memberId}`}>
                {member.name}
                {member.isCurrentUser && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    You
                  </Badge>
                )}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`shares-${memberId}`}
                  type="number"
                  step="1"
                  min="0"
                  placeholder="1"
                  value={shares[memberId] || ""}
                  onChange={(e) => handleShareChange(memberId, e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-20">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total shares:</span>
          <Badge variant="outline">{totalShares}</Badge>
        </div>
      </div>
    </Card>
  );
};
