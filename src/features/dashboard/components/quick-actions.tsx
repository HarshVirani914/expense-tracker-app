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
import { featureAccents, type FeatureAccentId } from "@/lib/feature-accents";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconPlus,
  IconReceipt,
  IconUserCircle,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type QuickAction = {
  id: string;
  accentId: FeatureAccentId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: "expense" | "account" | "group" | "contact";
};

type QuickActionsContextValue = {
  openExpense: () => void;
  openAccount: () => void;
  openGroup: () => void;
  openContact: () => void;
};

const QuickActionsContext = createContext<QuickActionsContextValue | null>(
  null,
);

const useQuickActionsContext = () => {
  const ctx = useContext(QuickActionsContext);
  if (!ctx) {
    throw new Error(
      "Quick actions must be used within QuickActionsProvider on the dashboard.",
    );
  }
  return ctx;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "expense",
    accentId: "expenses",
    label: "Add Expense",
    icon: IconReceipt,
    action: "expense",
  },
  {
    id: "group",
    accentId: "groups",
    label: "Create Group",
    icon: IconUsers,
    action: "group",
  },
  {
    id: "contact",
    accentId: "contacts",
    label: "Add Contact",
    icon: IconUserCircle,
    action: "contact",
  },
  {
    id: "account",
    accentId: "accounts",
    label: "Add Account",
    icon: IconWallet,
    action: "account",
  },
];

export const QuickActionsProvider = ({ children }: { children: ReactNode }) => {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const openExpense = useCallback(() => setExpenseDialogOpen(true), []);
  const openAccount = useCallback(() => setAccountDialogOpen(true), []);
  const openGroup = useCallback(() => setGroupDialogOpen(true), []);
  const openContact = useCallback(() => setContactDialogOpen(true), []);

  const value = useMemo(
    () => ({
      openExpense,
      openAccount,
      openGroup,
      openContact,
    }),
    [openExpense, openAccount, openGroup, openContact],
  );

  return (
    <QuickActionsContext.Provider value={value}>
      {children}
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
    </QuickActionsContext.Provider>
  );
};

const runAction = (
  ctx: QuickActionsContextValue,
  action: QuickAction["action"],
) => {
  switch (action) {
    case "expense":
      ctx.openExpense();
      break;
    case "account":
      ctx.openAccount();
      break;
    case "group":
      ctx.openGroup();
      break;
    case "contact":
      ctx.openContact();
      break;
  }
};

export const QuickActionsDesktopTrigger = ({
  className,
}: {
  className?: string;
}) => {
  const ctx = useQuickActionsContext();

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="gap-2 shadow-lg transition-shadow hover:shadow-xl"
            size="lg"
          >
            <IconPlus className="h-5 w-5" />
            Create
            <IconChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {QUICK_ACTIONS.map((actionDef) => (
            <DropdownMenuItem
              key={actionDef.id}
              onClick={() => runAction(ctx, actionDef.action)}
              className="cursor-pointer gap-2"
            >
              <actionDef.icon className="h-4 w-4" />
              <span>{actionDef.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const QuickActionsMobileTiles = ({ className }: { className?: string }) => {
  const ctx = useQuickActionsContext();

  return (
    <div
      className={cn(
        "grid w-full min-w-0 max-w-full grid-cols-2 gap-2 pb-2 min-[400px]:gap-3",
        className,
      )}
    >
      {QUICK_ACTIONS.map((actionDef) => {
        const accent = featureAccents[actionDef.accentId];
        const Icon = actionDef.icon;
        return (
          <button
            key={actionDef.id}
            type="button"
            onClick={() => runAction(ctx, actionDef.action)}
            aria-label={actionDef.label}
            className={cn(
              "group flex w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-card/80 p-2.5 shadow-none backdrop-blur-sm transition-shadow min-[400px]:gap-2 min-[400px]:p-3",
              "hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            <div
              className={cn(
                "flex shrink-0 rounded-full p-2.5 transition-colors min-[400px]:p-3",
                accent.iconBg,
                accent.icon,
                accent.iconBgHover,
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <span className="max-w-full px-0.5 text-center text-[11px] font-medium leading-tight wrap-break-word min-[400px]:text-xs">
              {actionDef.label.split(" ")[0]}
              <br />
              {actionDef.label.split(" ").slice(1).join(" ")}
            </span>
          </button>
        );
      })}
    </div>
  );
};
