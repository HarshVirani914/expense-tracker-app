"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";
import { IconHelp } from "@tabler/icons-react";

export const MoneySemanticsHelp = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground shrink-0"
        aria-label={MONEY_SEMANTICS.glossaryDialogTitle}
      >
        <IconHelp className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">
          {MONEY_SEMANTICS.glossaryDialogTitle}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 sm:w-96" align="start">
      <div className="space-y-3 text-sm">
        <p className="font-semibold text-foreground">
          {MONEY_SEMANTICS.glossaryDialogTitle}
        </p>
        <p className="text-muted-foreground text-xs">{MONEY_SEMANTICS.currency}</p>
        <dl className="space-y-2.5 text-xs">
          <div>
            <dt className="font-medium text-foreground">Your accounts in the app</dt>
            <dd className="text-muted-foreground mt-0.5">
              {MONEY_SEMANTICS.glossaryAccountBalance}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">This month only</dt>
            <dd className="text-muted-foreground mt-0.5">
              {MONEY_SEMANTICS.glossaryMonthCashflow}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Groups and shared bills</dt>
            <dd className="text-muted-foreground mt-0.5">
              {MONEY_SEMANTICS.glossaryGroupIoU}
            </dd>
          </div>
        </dl>
      </div>
    </PopoverContent>
  </Popover>
);
