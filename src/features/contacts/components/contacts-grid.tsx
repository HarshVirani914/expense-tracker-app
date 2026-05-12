"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  IconMail,
  IconPhone,
  IconUsers,
  IconReceipt,
} from "@tabler/icons-react";
import type { ContactWithRelations } from "../types";
import { cn } from "@/lib/utils";

type ContactsGridProps = {
  contacts: ContactWithRelations[];
  onContactClick: (contact: ContactWithRelations) => void;
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

export const ContactsGrid = ({
  contacts,
  onContactClick,
}: ContactsGridProps) => {
  if (contacts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <IconUsers className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No contacts yet</h3>
          <p className="text-muted-foreground max-w-md">
            Add your first contact to start splitting expenses with friends and
            family
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">All Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onContactClick(contact)}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left w-full cursor-pointer"
            >
              <Avatar
                className={cn(
                  "h-12 w-12 shrink-0",
                  getAvatarColor(contact.name),
                )}
              >
                <AvatarFallback className="text-white font-semibold bg-transparent">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-base truncate">
                  {contact.name}
                </h3>

                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  {contact.email && (
                    <div className="flex items-center gap-1 truncate">
                      <IconMail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1">
                      <IconPhone className="h-3 w-3 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {contact._count && contact._count.groupMemberships > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1 h-5">
                      <IconUsers className="h-2.5 w-2.5" />
                      {contact._count.groupMemberships}
                    </Badge>
                  )}
                  {contact._count && contact._count.expenseParticipants > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1 h-5">
                      <IconReceipt className="h-2.5 w-2.5" />
                      {contact._count.expenseParticipants}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
