"use client";

import type { ChatAddToolApproveResponseFunction, ChatStatus } from "ai";
import {
  IconLoader,
  IconRobot,
  IconUser,
} from "@tabler/icons-react";
import type { ChatMessage } from "@/lib/ai/chat-message";
import { ChatMessageParts } from "@/features/ai/components/chat-message-parts";

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
}: ChatMessageRowProps) => (
  <div
    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
  >
    {message.role === "assistant" && (
      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
        {status === "streaming" && message.id === lastMessageId ? (
          <IconLoader className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
        ) : (
          <IconRobot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        )}
      </div>
    )}
    <div
      className={`max-w-[80%] ${message.role === "user" ? "" : "w-full"}`}
    >
      <ChatMessageParts
        message={message}
        lastMessageId={lastMessageId}
        toolActivityActive={toolActivityActive}
        toolActivityLabel={toolActivityLabel}
        addToolApprovalResponse={addToolApprovalResponse}
      />
    </div>
    {message.role === "user" && (
      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
        <IconUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
    )}
  </div>
);
