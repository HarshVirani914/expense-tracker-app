"use client";

import { useState, useEffect } from "react";
import type { MemberInfo } from "@/features/groups/types";
import type { ParticipantInput } from "../../schemas";
import { SplitType } from "@/types/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPercentage } from "@tabler/icons-react";

type PercentageSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  participants: ParticipantInput[];
  onParticipantsChange: (participants: ParticipantInput[]) => void;
};

export const PercentageSplit = ({
  members,
  totalAmount,
  participants,
  onParticipantsChange,
}: PercentageSplitProps) => {
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialPercentages: Record<string, number> = {};
    members.forEach((member) => {
      const memberId = member.userId || member.contactId || "";
      initialPercentages[memberId] = 0;
    });
    setPercentages(initialPercentages);
  }, [members]);

  const handlePercentageChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newPercentages = { ...percentages, [memberId]: numValue };
    setPercentages(newPercentages);

    const newParticipants: ParticipantInput[] = members.map((member) => {
      const memberKey = member.userId || member.contactId || "";
      const percentage = newPercentages[memberKey] || 0;
      const oweAmount = (totalAmount * percentage) / 100;

      return {
        memberIdOrContact: memberKey,
        paidAmount: 0,
        oweAmount,
        splitType: SplitType.PERCENTAGE,
        splitValue: percentage,
        isUser: member.isCurrentUser,
      };
    });

    onParticipantsChange(newParticipants);
  };

  const totalPercentage = Object.values(percentages).reduce(
    (sum, val) => sum + val,
    0
  );
  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  if (members.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Select group members to specify percentages
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <IconPercentage className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Percentage Split</h3>
      </div>

      <div className="space-y-3 mb-4">
        {members.map((member) => {
          const memberId = member.userId || member.contactId || "";
          const percentage = percentages[memberId] || 0;
          const amount = (totalAmount * percentage) / 100;

          return (
            <div key={member.id} className="space-y-2">
              <Label htmlFor={`percentage-${memberId}`}>
                {member.name}
                {member.isCurrentUser && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    You
                  </Badge>
                )}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`percentage-${memberId}`}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={percentages[memberId] || ""}
                  onChange={(e) => handlePercentageChange(memberId, e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total percentage:</span>
          <Badge variant={isValid ? "default" : "destructive"}>
            {totalPercentage.toFixed(2)}%
          </Badge>
        </div>
        {!isValid && (
          <p className="text-xs text-destructive mt-2">
            Total must equal 100%
          </p>
        )}
      </div>
    </Card>
  );
};
