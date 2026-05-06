"use client";

import type { MemberInfo } from "@/features/groups/types";
import type { ParticipantInput } from "../../schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";

type SplitPreviewProps = {
  members: MemberInfo[];
  participants: ParticipantInput[];
  totalAmount: number;
};

export const SplitPreview = ({
  members,
  participants,
  totalAmount,
}: SplitPreviewProps) => {
  if (participants.length === 0) {
    return null;
  }

  const payers = participants.filter((p) => p.paidAmount > 0);
  const owes = participants.filter((p) => p.oweAmount > p.paidAmount + 0.01);

  const getMemberName = (memberIdOrContact: string) => {
    const member = members.find(
      (m) =>
        m.userId === memberIdOrContact || m.contactId === memberIdOrContact
    );
    return member?.name || "Unknown";
  };

  const totalPaid = participants.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOwed = participants.reduce((sum, p) => sum + p.oweAmount, 0);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Split Preview</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Who paid?
          </h4>
          {payers.length > 0 ? (
            <div className="space-y-2">
              {payers.map((payer, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <span className="font-medium">
                    {getMemberName(payer.memberIdOrContact)}
                  </span>
                  <Badge className="bg-green-600">
                    ${payer.paidAmount.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No payer selected
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Split breakdown:
          </h4>
          <div className="space-y-2">
            {participants.map((participant, idx) => {
              const netAmount = participant.oweAmount - participant.paidAmount;
              const isSettled = Math.abs(netAmount) < 0.01;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {getMemberName(participant.memberIdOrContact)}
                    </span>
                    {isSettled && (
                      <IconCheck className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {isSettled ? (
                    <Badge variant="secondary" className="text-xs">
                      Settled
                    </Badge>
                  ) : netAmount > 0 ? (
                    <Badge variant="destructive">
                      Owes ${netAmount.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600">
                      Gets ${Math.abs(netAmount).toFixed(2)}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Total expense:</span>
            <span className="font-semibold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Total paid:</span>
            <span className="font-semibold">${totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total split:</span>
            <Badge
              variant={
                Math.abs(totalOwed - totalAmount) < 0.01 ? "default" : "destructive"
              }
            >
              ${totalOwed.toFixed(2)}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
