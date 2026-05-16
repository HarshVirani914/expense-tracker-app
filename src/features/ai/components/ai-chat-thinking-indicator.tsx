"use client";

import type { ChatStatus } from "ai";
import { IconLoader } from "@tabler/icons-react";
import type { ChatMessage } from "@/lib/ai/chat-message";

type AIChatThinkingIndicatorProps = {
  status: ChatStatus;
  lastMessageRole: ChatMessage["role"] | undefined;
};

export const AIChatThinkingIndicator = ({
  status,
  lastMessageRole,
}: AIChatThinkingIndicatorProps) => {
  if (status !== "submitted" || lastMessageRole === "assistant") {
    return null;
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
        <IconLoader className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
      </div>
      <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
        Thinking...
      </div>
    </div>
  );
};
