"use client";

import { Button } from "@/components/ui/button";
import { IconSparkles } from "@tabler/icons-react";
import { AI_CHAT_STARTERS } from "@/features/ai/ai-chat-starters";

type AIChatEmptyStateProps = {
  onStarterSelect: (prompt: string) => void;
  isDisabled: boolean;
};

export const AIChatEmptyState = ({
  onStarterSelect,
  isDisabled,
}: AIChatEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[280px] text-center px-4 py-10">
    <div
      className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-4"
      aria-hidden
    >
      <IconSparkles className="w-7 h-7 text-purple-600 dark:text-purple-400" />
    </div>
    <h3 className="font-semibold text-base sm:text-lg mb-1">
      Ask anything about your money
    </h3>
    <p className="text-sm text-muted-foreground max-w-md mb-6">
      Use natural language to explore spending, get insights, or describe a
      transaction to log. Start with a suggestion below or type your own
      question.
    </p>
    <div
      className="flex flex-wrap justify-center gap-2 max-w-lg w-full"
      role="group"
      aria-label="Suggested prompts"
    >
      {AI_CHAT_STARTERS.map((starter) => (
        <Button
          key={starter.label}
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full text-xs sm:text-sm h-9 font-normal"
          disabled={isDisabled}
          onClick={() => onStarterSelect(starter.prompt)}
        >
          {starter.label}
        </Button>
      ))}
    </div>
  </div>
);
