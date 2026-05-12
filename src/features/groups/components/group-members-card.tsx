"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const GroupMembersCard = ({
  members,
  showAll,
  onToggleShowAll,
}: GroupMembersCardProps) => {
  const displayLimit = 8;
  const visibleMembers = showAll ? members : members.slice(0, displayLimit);
  const hasMore = members.length > displayLimit;

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Members</CardTitle>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={onToggleShowAll}
            >
              <span className="text-sm">
                {showAll
                  ? "Show Less"
                  : `+${members.length - displayLimit} more`}
              </span>
              {showAll ? (
                <IconChevronUp className="h-4 w-4" />
              ) : (
                <IconChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {visibleMembers.map((member) => {
            const name = member.user?.name || member.contact?.name || "Unknown";
            const email = member.user?.email || member.contact?.email;
            const isAdmin = member.role === "admin";

            return (
              <TooltipProvider key={member.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2.5 p-3 rounded-lg border shadow-none bg-card hover:bg-foreground/5 transition-colors cursor-default group">
                      <Avatar
                        className={cn(
                          "h-14 w-14 transition-transform group-hover:scale-105",
                          getAvatarColor(name),
                        )}
                      >
                        <AvatarFallback className="text-white font-semibold text-lg bg-transparent">
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center gap-1.5 min-w-0 w-full">
                        <span className="text-sm font-medium truncate w-full text-center leading-tight">
                          {name}
                        </span>
                        {isAdmin && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  {email && (
                    <TooltipContent>
                      <p className="text-sm">{email}</p>
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
