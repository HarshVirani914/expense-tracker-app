"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MemberInfo } from "@/features/groups/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCoins } from "@tabler/icons-react";
import { formatCurrencyWithDecimals } from "@/lib/format";

type ExactSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  initialValues?: Record<string, number>;
  onChange: (amounts: Record<string, number>) => void;
};

export const ExactSplit = ({ 
  members, 
  totalAmount, 
  initialValues = {},
  onChange 
}: ExactSplitProps) => {
  const memberIds = useMemo(
    () => members.map((m) => m.userId || m.contactId || "").join(","),
    [members]
  );

  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const hasLoadedInitialValues = useRef(false);

  // Initialize when members change
  useEffect(() => {
    const newAmounts: Record<string, number> = {};
    
    members.forEach((member) => {
      const memberId = member.userId || member.contactId || "";
      newAmounts[memberId] = 0;
    });
    
    setAmounts(newAmounts);
    hasLoadedInitialValues.current = false; // Reset flag when members change
  }, [memberIds]);

  // Load initial values once when they become available
  useEffect(() => {
    if (hasLoadedInitialValues.current) return;
    
    const hasValues = Object.keys(initialValues).length > 0 && 
                     Object.values(initialValues).some(v => v !== 0);
    
    if (hasValues) {
      const newAmounts: Record<string, number> = {};
      members.forEach((member) => {
        const memberId = member.userId || member.contactId || "";
        newAmounts[memberId] = initialValues[memberId] ?? 0;
      });
      setAmounts(newAmounts);
      hasLoadedInitialValues.current = true;
    }
  }, [initialValues, members]);

  useEffect(() => {
    onChange(amounts);
  }, [amounts, onChange]);

  const handleAmountChange = useCallback((memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmounts((prev) => ({ ...prev, [memberId]: numValue }));
  }, []);

  const totalPaid = useMemo(
    () => Object.values(amounts).reduce((sum, val) => sum + val, 0),
    [amounts]
  );

  const remaining = useMemo(
    () => totalAmount - totalPaid,
    [totalAmount, totalPaid]
  );

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
      <div className="flex items-center gap-2 mb-2">
        <IconCoins className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Exact Amounts</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Enter how much each person paid. Expense will be split equally among all members.
      </p>

      <div className="space-y-3 mb-4">
        {members.map((member) => {
          const memberId = member.userId || member.contactId || "";
          return (
            <div key={member.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`amount-${memberId}`}>
                  {member.name}
                  {member.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs ml-2">
                      You
                    </Badge>
                  )}
                </Label>
                <span className="text-xs text-muted-foreground">paid</span>
              </div>
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
          <span className="text-muted-foreground">Total expense:</span>
          <span className="font-semibold">{formatCurrencyWithDecimals(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Total paid:</span>
          <span className="font-semibold">{formatCurrencyWithDecimals(totalPaid)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={Math.abs(remaining) < 0.01 ? "default" : "destructive"}>
            {Math.abs(remaining) < 0.01
              ? "Balanced"
              : `${formatCurrencyWithDecimals(Math.abs(remaining))} ${remaining > 0 ? "short" : "over"}`}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
