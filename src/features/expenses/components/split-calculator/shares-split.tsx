"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MemberInfo } from "@/features/groups/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconScale } from "@tabler/icons-react";
import { formatCurrencyWithDecimals } from "@/lib/format";

type SharesSplitProps = {
  members: MemberInfo[];
  totalAmount: number;
  initialValues?: Record<string, number>;
  onChange: (shares: Record<string, number>) => void;
};

export const SharesSplit = ({ 
  members, 
  totalAmount, 
  initialValues = {},
  onChange 
}: SharesSplitProps) => {
  const memberIds = useMemo(
    () => members.map((m) => m.userId || m.contactId || "").join(","),
    [members]
  );

  const [shares, setShares] = useState<Record<string, number>>({});
  const hasLoadedInitialValues = useRef(false);

  // Initialize when members change
  useEffect(() => {
    const newShares: Record<string, number> = {};
    
    members.forEach((member) => {
      const memberId = member.userId || member.contactId || "";
      newShares[memberId] = 1;
    });
    
    setShares(newShares);
    hasLoadedInitialValues.current = false; // Reset flag when members change
  }, [memberIds]);

  // Load initial values once when they become available
  useEffect(() => {
    if (hasLoadedInitialValues.current) return;
    
    const hasValues = Object.keys(initialValues).length > 0 && 
                     Object.values(initialValues).some(v => v !== 1);
    
    if (hasValues) {
      const newShares: Record<string, number> = {};
      members.forEach((member) => {
        const memberId = member.userId || member.contactId || "";
        newShares[memberId] = initialValues[memberId] ?? 1;
      });
      setShares(newShares);
      hasLoadedInitialValues.current = true;
    }
  }, [initialValues, members]);

  useEffect(() => {
    onChange(shares);
  }, [shares, onChange]);

  const handleShareChange = useCallback((memberId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setShares((prev) => ({ ...prev, [memberId]: numValue }));
  }, []);

  const totalShares = useMemo(
    () => Object.values(shares).reduce((sum, val) => sum + val, 0),
    [shares]
  );

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
      <div className="flex items-center gap-2 mb-2">
        <IconScale className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Shares Split</h3>
        <Badge variant="secondary" className="text-xs">
          1:2:3 ratio
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Split by ratio (e.g., 1:2:1:4 for different proportions)
      </p>

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
                  {formatCurrencyWithDecimals(amount)}
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
