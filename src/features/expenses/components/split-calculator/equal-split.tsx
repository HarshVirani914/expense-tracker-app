"use client";

import { useEffect } from "react";
import type { MemberInfo } from "@/features/groups/types";
import type { ParticipantInput } from "../../schemas";
import { SplitType } from "@/types/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconUsersGroup } from "@tabler/icons-react";

type EqualSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  participants: ParticipantInput[];
  onParticipantsChange: (participants: ParticipantInput[]) => void;
};

export const EqualSplit = ({
  members,
  totalAmount,
  participants,
  onParticipantsChange,
}: EqualSplitProps) => {
  useEffect(() => {
    if (members.length === 0 || totalAmount <= 0) return;

    const splitAmount = totalAmount / members.length;

    const newParticipants: ParticipantInput[] = members.map((member) => ({
      memberIdOrContact: member.userId || member.contactId || "",
      paidAmount: 0,
      oweAmount: splitAmount,
      splitType: SplitType.EQUAL,
      splitValue: 1,
      isUser: member.isCurrentUser,
    }));

    onParticipantsChange(newParticipants);
  }, [members, totalAmount, onParticipantsChange]);

  if (members.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Select group members to see the split
        </p>
      </Card>
    );
  }

  const splitAmount = totalAmount / members.length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <IconUsersGroup className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Equal Split</h3>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{member.name}</span>
              {member.isCurrentUser && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <Badge variant="outline">
              ${splitAmount.toFixed(2)}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
