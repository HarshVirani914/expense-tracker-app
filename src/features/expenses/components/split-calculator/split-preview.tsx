"use client";

import type { MemberInfo } from "@/features/groups/types";
import type { ParticipantInput } from "../../schemas";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCheck } from "@tabler/icons-react";
import { memo, useMemo, useCallback } from "react";
import { formatCurrencyWithDecimals } from "@/lib/format";

type SplitPreviewProps = {
  members: MemberInfo[];
  participants: ParticipantInput[];
  totalAmount: number;
};

export const SplitPreview = memo(
  ({ members, participants, totalAmount }: SplitPreviewProps) => {
    const getMemberName = useCallback(
      (memberIdOrContact: string) => {
        const member = members.find(
          (m) =>
            m.userId === memberIdOrContact || m.contactId === memberIdOrContact,
        );
        return member?.name || "Unknown";
      },
      [members],
    );

    const payers = useMemo(
      () => participants.filter((p) => p.paidAmount > 0),
      [participants],
    );

    const totalPaid = useMemo(
      () => participants.reduce((sum, p) => sum + p.paidAmount, 0),
      [participants],
    );

    const totalOwed = useMemo(
      () => participants.reduce((sum, p) => sum + p.oweAmount, 0),
      [participants],
    );

    if (participants.length === 0) {
      return null;
    }

    return (
      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-medium text-sm">Settlement Summary</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Who owes whom after this expense
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {participants.map((participant, idx) => {
              const netAmount = participant.oweAmount - participant.paidAmount;
              const isSettled = Math.abs(netAmount) < 0.01;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
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
                    <Badge variant="destructive" className="text-xs">
                      Owes {formatCurrencyWithDecimals(netAmount)}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-600 text-xs">
                      Gets {formatCurrencyWithDecimals(Math.abs(netAmount))}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total expense:</span>
              <span className="font-semibold">
                {formatCurrencyWithDecimals(totalAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total allocated:</span>
              <Badge
                variant={
                  Math.abs(totalOwed - totalAmount) < 0.01
                    ? "default"
                    : "destructive"
                }
                className="text-xs"
              >
                {formatCurrencyWithDecimals(totalOwed)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

SplitPreview.displayName = "SplitPreview";
