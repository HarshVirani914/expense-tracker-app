"use client";

import { useState } from "react";
import { FeaturePageHero } from "@/components/layout/feature-page-hero";
import { AccountFormDialog } from "@/features/accounts/components/account-form-dialog";
import { AccountList } from "@/features/accounts/components/account-list";
import { AccountsSummaryCard } from "@/features/accounts/components/accounts-summary-card";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import type { AccountWithBalance } from "@/features/accounts/types";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsPage() {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    AccountWithBalance | undefined
  >(undefined);

  const { accounts, isLoading } = useAccounts();

  const handleEdit = (account: AccountWithBalance) => {
    setSelectedAccount(account);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAccount(undefined);
  };

  const handleAddAccount = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-6">
      {!isMobile && (
        <FeaturePageHero className="p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Accounts</h1>
              <p className="text-muted-foreground text-base">
                Manage your accounts and track balances
              </p>
            </div>
            <Button
              onClick={handleAddAccount}
              className="gap-2 shadow-lg hover:shadow-xl transition-shadow shrink-0"
              size="lg"
            >
              <IconPlus className="h-5 w-5" />
              Add Account
            </Button>
          </div>
        </FeaturePageHero>
      )}

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : accounts && accounts.length > 0 ? (
        <AccountsSummaryCard accounts={accounts} />
      ) : null}

      <AccountList onEdit={handleEdit} onAddAccount={handleAddAccount} />

      <AccountFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        account={selectedAccount}
      />

      {isMobile && accounts && accounts.length > 0 && (
        <Button
          onClick={handleAddAccount}
          size="lg"
          className="fixed bottom-26 right-6 h-14 w-14 rounded-full shadow-2xl z-40 hover:scale-110 transition-transform"
        >
          <IconPlus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
