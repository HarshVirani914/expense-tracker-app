"use client";

import { motion } from "framer-motion";
import { IconSparkles } from "@tabler/icons-react";
import { AI_CHAT_STARTERS } from "@/features/ai/ai-chat-starters";
import { cn } from "@/lib/utils";

type AIChatEmptyStateProps = {
  onStarterSelect: (prompt: string) => void;
  isDisabled: boolean;
};

export const AIChatEmptyState = ({
  onStarterSelect,
  isDisabled,
}: AIChatEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[320px] text-center px-3 py-8 sm:px-6">

    {/* Animated gradient sparkle icon */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative mb-5"
      aria-hidden
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-violet-500/20 blur-md"
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
        <IconSparkles className="h-8 w-8 text-white" />
      </div>
    </motion.div>

    {/* Heading + sub */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="mb-6 space-y-1.5"
    >
      <h3 className="text-base font-semibold sm:text-lg">
        Ask anything about your money
      </h3>
      <p className="text-xs text-muted-foreground sm:text-sm max-w-xs mx-auto leading-relaxed">
        Explore spending, get insights, or describe a transaction to log.
        Try a suggestion or type your own.
      </p>
    </motion.div>

    {/* Starter grid — 2 columns on mobile, 4 on sm+ */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5"
      role="group"
      aria-label="Suggested prompts"
    >
      {AI_CHAT_STARTERS.map((starter, i) => (
        <motion.button
          key={starter.label}
          type="button"
          disabled={isDisabled}
          onClick={() => onStarterSelect(starter.prompt)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.045, duration: 0.22 }}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "flex flex-col items-start gap-1.5 rounded-xl border bg-card p-3 text-left",
            "transition-colors hover:bg-accent hover:border-border",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <span className="text-base leading-none">{starter.emoji}</span>
          <span className="text-xs font-medium leading-snug text-foreground">
            {starter.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  </div>
);
