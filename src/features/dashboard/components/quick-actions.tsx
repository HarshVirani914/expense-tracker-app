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
  IconChevronDown,
  IconPlus,
  IconReceipt,
  IconUserCircle,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { useState } from "react";

export const QuickActions = () => {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <>
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
          <DropdownMenuItem
            onClick={() => setExpenseDialogOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <IconReceipt className="h-4 w-4" />
            <span>Expense</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setGroupDialogOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <IconUsers className="h-4 w-4" />
            <span>Group</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setContactDialogOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <IconUserCircle className="h-4 w-4" />
            <span>Contact</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setAccountDialogOpen(true)}
            className="gap-2 cursor-pointer"
          >
            <IconWallet className="h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
