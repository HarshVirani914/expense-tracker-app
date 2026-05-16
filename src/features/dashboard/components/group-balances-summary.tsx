"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupBalances } from "@/features/groups/hooks/use-group-balances";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { IconArrowRight, IconLoader2, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export const GroupBalancesSummary = () => {
  const { groups, isLoading: groupsLoading } = useGroups({});

  if (groupsLoading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Group Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            Group Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-sm text-muted-foreground text-center">
              No groups yet. Create a group to split expenses with friends and
              family.
            </p>
            <Button asChild size="sm">
              <Link href="/groups">
                <IconUsers className="h-4 w-4 mr-2" />
                Create Group
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeGroups = groups.slice(0, 3);

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <IconUsers className="h-5 w-5" />
          Group Balances
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/groups" className="flex items-center gap-1">
            View All
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {activeGroups.map((group) => (
            <GroupBalanceItem
              key={group.id}
              groupId={group.id}
              groupName={group.name}
              memberCount={group.members.length}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const GroupBalanceItem = ({
  groupId,
  groupName,
  memberCount,
}: {
  groupId: string;
  groupName: string;
  memberCount: number;
}) => {
  const { balances, isLoading } = useGroupBalances(groupId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <IconUsers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{groupName}</p>
            <p className="text-xs text-muted-foreground">
              {memberCount} members
            </p>
          </div>
        </div>
        <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const userBalance = balances?.find((m) => m.isCurrentUser);
  const owedAmount = userBalance?.netBalance || 0;

  return (
    <Link href={`/groups/${groupId}`}>
      <div className="flex items-center justify-between p-3 rounded-lg border hover:border-primary hover:text-primary transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <IconUsers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{groupName}</p>
            <p className="text-xs text-muted-foreground">
              {memberCount} members
            </p>
          </div>
        </div>
        <div className="text-right">
          {owedAmount === 0 ? (
            <Badge variant="secondary">Settled up</Badge>
          ) : (
            <>
              <p
                className={`font-semibold ${
                  owedAmount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {owedAmount > 0 ? "+" : ""}
                {formatCurrency(owedAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {owedAmount > 0 ? "you're owed" : "you owe"}
              </p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
