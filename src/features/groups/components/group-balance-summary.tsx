"use client";

import { useState } from "react";
import { useGroupBalances } from "../hooks/use-group-balances";
import { simplifyDebts } from "../utils/simplify-debts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconArrowRight,
  IconCurrencyDollar,
  IconTrendingUp,
  IconTrendingDown,
  IconAdjustmentsAlt,
} from "@tabler/icons-react";

type GroupBalanceSummaryProps = {
  groupId: string;
};

export const GroupBalanceSummary = ({ groupId }: GroupBalanceSummaryProps) => {
  const { balances, isLoading } = useGroupBalances(groupId);
  const [showSimplified, setShowSimplified] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No expenses yet. Add an expense to see balances.
        </p>
      </Card>
    );
  }

  const currentUserBalance = balances.find((b) => b.isCurrentUser);
  const hasBalances = balances.some((b) => Math.abs(b.netBalance) > 0.01);
  const simplifiedDebts = simplifyDebts(balances);

  return (
    <div className="space-y-4">
      {currentUserBalance && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IconCurrencyDollar className="h-5 w-5 text-primary" />
            Your Balance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="font-semibold">
                {currentUserBalance.totalPaid.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Owed:</span>
              <span className="font-semibold">
                {currentUserBalance.totalOwed.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Net Balance:</span>
                <div className="flex items-center gap-2">
                  {currentUserBalance.netBalance > 0.01 ? (
                    <>
                      <IconTrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">
                        +
                        {currentUserBalance.netBalance.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </span>
                    </>
                  ) : currentUserBalance.netBalance < -0.01 ? (
                    <>
                      <IconTrendingDown className="h-4 w-4 text-red-600" />
                      <span className="font-bold text-red-600">
                        {currentUserBalance.netBalance.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-muted-foreground">
                      {(0.0).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {currentUserBalance.owesTo.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-red-600 mb-2">
                  You owe:
                </h4>
                <div className="space-y-2">
                  {currentUserBalance.owesTo.map((debt) => (
                    <div
                      key={debt.memberId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {debt.memberName}
                      </span>
                      <Badge variant="destructive">
                        {debt.amount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentUserBalance.owedBy.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-green-600 mb-2">
                  Owes you:
                </h4>
                <div className="space-y-2">
                  {currentUserBalance.owedBy.map((debt) => (
                    <div
                      key={debt.memberId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {debt.memberName}
                      </span>
                      <Badge className="bg-green-600">
                        {debt.amount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {hasBalances && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Balances</h3>
          <div className="space-y-3">
            {balances
              .filter((b) => Math.abs(b.netBalance) > 0.01)
              .map((balance) => (
                <div
                  key={balance.memberId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {balance.memberName}
                      {balance.isCurrentUser && (
                        <Badge variant="secondary" className="ml-2">
                          You
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {balance.netBalance > 0.01 ? (
                      <Badge className="bg-green-600">
                        +
                        {balance.netBalance.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {balance.netBalance.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Suggested Settlements</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSimplified(!showSimplified)}
                className="gap-2"
              >
                <IconAdjustmentsAlt className="h-4 w-4" />
                {showSimplified ? "Show Actual" : "Simplify"}
              </Button>
            </div>
            <div className="space-y-2">
              {showSimplified
                ? simplifiedDebts.map((debt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg"
                    >
                      <span className="font-medium">{debt.fromName}</span>
                      <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{debt.toName}</span>
                      <Badge variant="outline" className="ml-auto">
                        {debt.amount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Badge>
                    </div>
                  ))
                : balances
                    .filter((b) => b.owesTo.length > 0)
                    .map((balance) =>
                      balance.owesTo.map((debt) => (
                        <div
                          key={`${balance.memberId}-${debt.memberId}`}
                          className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg"
                        >
                          <span className="font-medium">
                            {balance.memberName}
                          </span>
                          <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{debt.memberName}</span>
                          <Badge variant="outline" className="ml-auto">
                            {debt.amount.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </Badge>
                        </div>
                      )),
                    )}
            </div>
            {showSimplified && simplifiedDebts.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Showing optimized settlements ({simplifiedDebts.length}{" "}
                transaction
                {simplifiedDebts.length !== 1 ? "s" : ""})
              </p>
            )}
          </div>
        </Card>
      )}

      {!hasBalances && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            All expenses are settled! No outstanding balances.
          </p>
        </Card>
      )}
    </div>
  );
};
