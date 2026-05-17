"use client";

import type { ChatAddToolApproveResponseFunction } from "ai";
import { isTextUIPart, isToolUIPart } from "ai";
import { IconLoader } from "@tabler/icons-react";
import type { ChatMessage } from "@/lib/ai/chat-message";
import { ChatAssistantMarkdown } from "@/features/ai/components/chat-assistant-markdown";
import { ChatToolCreateExpense } from "@/features/ai/components/chat-tool-create-expense";
import { ChatToolExpenseMutation } from "@/features/ai/components/chat-tool-expense-mutation";
import { getChatMessagePartReactKey } from "@/features/ai/lib/chat-message-part-key";
import { isToolPartRunning } from "@/features/ai/lib/chat-tool-messages";

type ChatMessagePartsProps = {
  message: ChatMessage;
  lastMessageId: string | undefined;
  toolActivityActive: boolean;
  toolActivityLabel: string;
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

export const ChatMessageParts = ({
  message,
  lastMessageId,
  toolActivityActive,
  toolActivityLabel,
  addToolApprovalResponse,
}: ChatMessagePartsProps) => {
  return (
    <>
      {message.parts.map((part, index) => {
        const key = getChatMessagePartReactKey(message.id, part, index);

        if (isTextUIPart(part)) {
          if (message.role === "user") {
            return (
              <div
                key={key}
                className="p-3 rounded-lg mb-2 bg-primary text-primary-foreground"
              >
                <span className="whitespace-pre-wrap text-sm">{part.text}</span>
              </div>
            );
          }
          return (
            <div key={key} className="p-3 rounded-lg mb-2 bg-muted">
              <ChatAssistantMarkdown>{part.text}</ChatAssistantMarkdown>
            </div>
          );
        }

        if (isToolUIPart(part)) {
          if (part.type === "dynamic-tool") {
            return null;
          }

          if (isToolPartRunning(part.state)) {
            return null;
          }

          if (part.type === "tool-createExpense") {
            return (
              <ChatToolCreateExpense
                key={key}
                part={part}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            );
          }

          if (
            part.type === "tool-updateExpense" ||
            part.type === "tool-deleteExpense"
          ) {
            return (
              <ChatToolExpenseMutation
                key={key}
                part={part}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            );
          }

          if (part.state === "output-error" && part.errorText) {
            return (
              <div
                key={key}
                className="rounded-lg border border-destructive/40 bg-destructive/10 mb-2 px-3 py-2 text-sm text-destructive"
              >
                {part.errorText}
              </div>
            );
          }

          if (part.state === "output-denied") {
            return (
              <div
                key={key}
                className="rounded-lg border bg-muted/50 mb-2 px-3 py-2 text-xs text-muted-foreground"
              >
                Action cancelled. Nothing was saved.
              </div>
            );
          }

          if (part.state === "approval-responded") {
            return null;
          }

          if (part.state === "output-available") {
            return null;
          }

          return null;
        }

        return null;
      })}
      {message.role === "assistant" &&
        message.id === lastMessageId &&
        toolActivityActive && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/80 text-sm border border-border/50 border-dashed">
            <IconLoader className="w-4 h-4 shrink-0 animate-spin text-purple-600 dark:text-purple-400" />
            <span className="text-muted-foreground">{toolActivityLabel}</span>
          </div>
        )}
    </>
  );
};
