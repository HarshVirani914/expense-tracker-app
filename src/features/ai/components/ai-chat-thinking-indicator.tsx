"use client";

import type { ChatStatus } from "ai";
import { motion } from "framer-motion";
import { IconSparkles } from "@tabler/icons-react";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2.5"
    >
      {/* Gradient sparkle avatar matches message rows */}
      <div
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/30"
      >
        <IconSparkles className="h-3.5 w-3.5 text-white" />
      </div>

      {/* Bouncing dots — iMessage typing style */}
      <div
        role="status"
        aria-label="Assistant is thinking"
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.55,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: i * 0.14,
            }}
            className="block h-2 w-2 rounded-full bg-muted-foreground/50"
          />
        ))}
      </div>
    </motion.div>
  );
};
