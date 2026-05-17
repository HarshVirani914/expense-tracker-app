"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountFormDialog } from "@/features/accounts/components/account-form-dialog";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import {
  featureAccents,
  type FeatureAccentId,
} from "@/lib/feature-accents";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconPlus,
  IconReceipt,
  IconUserCircle,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type QuickAction = {
  id: string;
  accentId: FeatureAccentId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
};

export const QuickActions = () => {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const actions: QuickAction[] = [
    {
      id: "expense",
      accentId: "expenses",
      label: "Add Expense",
      icon: IconReceipt,
      onClick: () => setExpenseDialogOpen(true),
    },
    {
      id: "group",
      accentId: "groups",
      label: "Create Group",
      icon: IconUsers,
      onClick: () => setGroupDialogOpen(true),
    },
    {
      id: "contact",
      accentId: "contacts",
      label: "Add Contact",
      icon: IconUserCircle,
      onClick: () => setContactDialogOpen(true),
    },
    {
      id: "account",
      accentId: "accounts",
      label: "Add Account",
      icon: IconWallet,
      onClick: () => setAccountDialogOpen(true),
    },
  ];

  return (
    <>
      {isMobile ? (
        <div className="w-full">
          <div className="flex gap-3 pb-2 min-w-max px-1">
            {actions.map((action) => {
              const accent = featureAccents[action.accentId];
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  className="group flex w-full flex-col items-center gap-2 rounded-xl border border-border/70 bg-card/80 p-4 shadow-none backdrop-blur-sm transition-shadow hover:shadow-sm"
                >
                  <div
                    className={cn(
                      "flex shrink-0 rounded-full p-3 transition-colors",
                      accent.iconBg,
                      accent.icon,
                      accent.iconBgHover,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.label.split(" ")[0]}
                    <br />
                    {action.label.split(" ").slice(1).join(" ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
              size="lg"
            >
              <IconPlus className="h-5 w-5" />
              Create
              <IconChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                className="gap-2 cursor-pointer"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
      />

      <AccountFormDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
      />

      <GroupFormDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
      />

      <ContactFormDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </>
  );
};
