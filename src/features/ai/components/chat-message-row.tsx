"use client";

import type { ChatAddToolApproveResponseFunction, ChatStatus } from "ai";
import { IconLoader, IconSparkles } from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/lib/ai/chat-message";
import { ChatMessageParts } from "@/features/ai/components/chat-message-parts";
import { cn } from "@/lib/utils";

type ChatMessageRowProps = {
  message: ChatMessage;
  lastMessageId: string | undefined;
  status: ChatStatus;
  toolActivityActive: boolean;
  toolActivityLabel: string;
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

export const ChatMessageRow = ({
  message,
  lastMessageId,
  status,
  toolActivityActive,
  toolActivityLabel,
  addToolApprovalResponse,
}: ChatMessageRowProps) => {
  const isUser = message.role === "user";
  const isStreaming = status === "streaming" && message.id === lastMessageId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" as const }}
      className={cn("flex items-end gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Gradient sparkle avatar — assistant only */}
      {!isUser && (
        <div
          aria-hidden
          className="flex h-8 w-8 shrink-0 self-end mb-0.5 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/30"
        >
          {isStreaming ? (
            <IconLoader className="h-3.5 w-3.5 animate-spin text-white" />
          ) : (
            <IconSparkles className="h-3.5 w-3.5 text-white" />
          )}
        </div>
      )}

      {/* Bubble content — user is narrow, assistant is wide */}
      <div className={cn("min-w-0", isUser ? "max-w-[78%]" : "max-w-[88%] w-full")}>
        <ChatMessageParts
          message={message}
          lastMessageId={lastMessageId}
          toolActivityActive={toolActivityActive}
          toolActivityLabel={toolActivityLabel}
          addToolApprovalResponse={addToolApprovalResponse}
        />
      </div>
    </motion.div>
  );
};
