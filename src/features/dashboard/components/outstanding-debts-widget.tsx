"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroup } from "@/features/groups/hooks/use-group";
import { getMembersInfo } from "@/features/groups/utils/member-info";
import { SettlementFormDialog } from "@/features/settlements/components/settlement-form-dialog";
import { useOutstandingDebts } from "@/features/settlements/hooks/use-outstanding-debts";
import { formatCurrency } from "@/lib/format";
import {
  IconArrowDown,
  IconArrowUp,
  IconCash,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

export const OutstandingDebtsWidget = () => {
  const { debts, isLoading } = useOutstandingDebts();
  const [settlementDialog, setSettlementDialog] = useState<{
    open: boolean;
    groupId: string;
    prefilledData?: {
      payerId: string;
      receiverId: string;
      amount: number;
    };
  }>({
    open: false,
    groupId: "",
  });

  const { group } = useGroup(settlementDialog.groupId, {
    enabled: settlementDialog.open && !!settlementDialog.groupId,
  });

  if (isLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5" />
            Outstanding Debts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (debts.length === 0) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5" />
            Outstanding Debts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">All settled up!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You have no outstanding debts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSettleUp = (debt: (typeof debts)[0]) => {
    setSettlementDialog({
      open: true,
      groupId: debt.groupId,
      prefilledData: {
        payerId: debt.type === "owes" ? "currentUser" : debt.memberId,
        receiverId: debt.type === "owes" ? debt.memberId : "currentUser",
        amount: debt.amount,
      },
    });
  };

  const members = group ? getMembersInfo(group, "") : [];

  return (
    <>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5" />
            Outstanding Debts
            <Badge variant="secondary" className="ml-auto">
              {debts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {debts.slice(0, 5).map((debt, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div
                  className={`rounded-full p-2 ${
                    debt.type === "owes"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-green-500/10 text-green-600 dark:text-green-400"
                  }`}
                >
                  {debt.type === "owes" ? (
                    <IconArrowUp className="h-4 w-4" />
                  ) : (
                    <IconArrowDown className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {debt.type !== "owes" ? (
                        <>
                          <span className="text-primary">
                            {debt.memberName}
                          </span>{" "}
                          owes you
                        </>
                      ) : (
                        <>
                          You owe{" "}
                          <span className="text-primary">
                            {debt.memberName}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/groups/${debt.groupId}`}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5"
                  >
                    {debt.groupName}
                    <IconChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      debt.type === "owes"
                        ? "text-destructive border-destructive/50"
                        : "text-green-600 dark:text-green-400 border-green-600/50 dark:border-green-400/50"
                    }
                  >
                    {formatCurrency(debt.amount)}
                  </Badge>
                  {debt.type === "owes" && (
                    <Button
                      size="sm"
                      onClick={() => handleSettleUp(debt)}
                      className="gap-1"
                    >
                      <IconCash className="h-3.5 w-3.5" />
                      Settle Up
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {debts.length > 5 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                And {debts.length - 5} more...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {group && (
        <SettlementFormDialog
          open={settlementDialog.open}
          onOpenChange={(open) =>
            setSettlementDialog((prev) => ({ ...prev, open }))
          }
          groupId={settlementDialog.groupId}
          members={members}
          prefilledData={settlementDialog.prefilledData}
        />
      )}
    </>
  );
};
