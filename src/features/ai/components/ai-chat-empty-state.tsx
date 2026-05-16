"use client";

import { IconSparkles } from "@tabler/icons-react";

export const AIChatEmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
      <IconSparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
    </div>
    <h3 className="font-semibold text-lg mb-2">Start a Conversation</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Ask me to show expenses, add transactions, or get spending insights
    </p>
    <div className="mt-6 space-y-2 text-sm text-muted-foreground">
      <p className="font-medium">Try asking:</p>
      <div className="space-y-1 text-left">
        <p>• &quot;Add ₹50 for groceries today&quot;</p>
        <p>• &quot;Show my food expenses this month&quot;</p>
        <p>• &quot;What&apos;s my spending summary?&quot;</p>
      </div>
    </div>
  </div>
);
