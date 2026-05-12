"use client";

import { useState } from "react";
import { AccountList } from "@/features/accounts/components/account-list";
import { AccountFormDialog } from "@/features/accounts/components/account-form-dialog";
import type { AccountWithBalance } from "@/features/accounts/types";
import { Button } from "@/components/ui/button";
import { IconPlus, IconWallet } from "@tabler/icons-react";

export default function AccountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AccountWithBalance | undefined
  >(undefined);

  const handleEdit = (account: AccountWithBalance) => {
    setSelectedAccount(account);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAccount(undefined);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <IconWallet className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Accounts</h1>
          </div>
          <p className="text-muted-foreground text-base pl-[52px]">
            Manage your accounts and track balances
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <IconPlus className="h-5 w-5" />
          Add Account
        </Button>
      </div>

      <AccountList onEdit={handleEdit} />

      <AccountFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        account={selectedAccount}
      />
    </div>
  );
}
