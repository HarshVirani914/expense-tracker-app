"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MemberInfo } from "@/features/groups/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPercentage } from "@tabler/icons-react";
import { formatCurrencyWithDecimals } from "@/lib/format";

type PercentageSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  initialValues?: Record<string, number>;
  onChange: (percentages: Record<string, number>) => void;
};

export const PercentageSplit = ({
  members,
  totalAmount,
  initialValues = {},
  onChange,
}: PercentageSplitProps) => {
  const memberIds = useMemo(
    () => members.map((m) => m.userId || m.contactId || "").join(","),
    [members]
  );

  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const hasLoadedInitialValues = useRef(false);
  
  // Initialize when members change
  useEffect(() => {
    const newPercentages: Record<string, number> = {};
    
    members.forEach((member) => {
      const memberId = member.userId || member.contactId || "";
      newPercentages[memberId] = 0;
    });
    
    setPercentages(newPercentages);
    hasLoadedInitialValues.current = false; // Reset flag when members change
  }, [memberIds]);

  // Load initial values once when they become available
  useEffect(() => {
    if (hasLoadedInitialValues.current) return;
    
    const hasValues = Object.keys(initialValues).length > 0 && 
                     Object.values(initialValues).some(v => v !== 0);
    
    if (hasValues) {
      const newPercentages: Record<string, number> = {};
      members.forEach((member) => {
        const memberId = member.userId || member.contactId || "";
        newPercentages[memberId] = initialValues[memberId] ?? 0;
      });
      setPercentages(newPercentages);
      hasLoadedInitialValues.current = true;
    }
  }, [initialValues, members]);

  useEffect(() => {
    onChange(percentages);
  }, [percentages, onChange]);

  const handlePercentageChange = useCallback((memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPercentages((prev) => ({ ...prev, [memberId]: numValue }));
  }, []);

  const totalPercentage = useMemo(
    () => Object.values(percentages).reduce((sum, val) => sum + val, 0),
    [percentages]
  );

  const isValid = useMemo(
    () => Math.abs(totalPercentage - 100) < 0.01,
    [totalPercentage]
  );

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
      <div className="flex items-center gap-2 mb-2">
        <IconPercentage className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Percentage Split</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Percentages must add up to 100% to submit
      </p>

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
                  {formatCurrencyWithDecimals(amount)}
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
