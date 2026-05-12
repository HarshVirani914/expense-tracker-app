"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@tabler/icons-react";

type Member = {
  id: string;
  role: string;
  user?: { name: string | null; email?: string } | null;
  contact?: { name: string; email?: string | null } | null;
};

type GroupMembersCardProps = {
  members: Member[];
  showAll: boolean;
  onToggleShowAll: () => void;
};

export const GroupMembersCard = ({
  members,
  showAll,
  onToggleShowAll,
}: GroupMembersCardProps) => {
  const visibleMembers = showAll ? members : members.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Members</h3>
          {members.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={onToggleShowAll}
            >
              {showAll ? "Show Less" : `Show All (${members.length})`}
              <IconChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showAll && "rotate-180",
                )}
              />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visibleMembers.map((member) => {
            const name = member.user?.name || member.contact?.name || "Unknown";
            const email = member.user?.email || member.contact?.email;

            return (
              <TooltipProvider key={member.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-default">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-semibold text-base shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-center gap-1 min-w-0 w-full">
                        <span className="text-sm font-medium truncate w-full text-center">
                          {name}
                        </span>
                        {member.role === "admin" && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  {email && (
                    <TooltipContent>
                      <p>{email}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
