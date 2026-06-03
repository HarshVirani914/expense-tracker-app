"use client";

import type { ChatAddToolApproveResponseFunction } from "ai";
import { isTextUIPart, isToolUIPart } from "ai";
import type { ChatMessage } from "@/lib/ai/chat-message";
import { ChatAssistantMarkdown } from "@/features/ai/components/chat-assistant-markdown";
import { ChatToolCreateExpense } from "@/features/ai/components/chat-tool-create-expense";
import { ChatToolExpenseMutation } from "@/features/ai/components/chat-tool-expense-mutation";
import { ChatToolActivityCard } from "@/features/ai/components/chat-tool-activity-card";
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
                className="mb-1 rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm"
              >
                <span className="whitespace-pre-wrap text-sm leading-relaxed">{part.text}</span>
              </div>
            );
          }
          return (
            <div key={key} className="mb-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
              <ChatAssistantMarkdown>{part.text}</ChatAssistantMarkdown>
            </div>
          );
        }

        if (isToolUIPart(part)) {
          if (part.type === "dynamic-tool") {
            return null;
          }

          if (isToolPartRunning(part.state)) {
            // Show shimmer card instead of nothing — prevents the "blink" on fast tools
            return (
              <div key={key} className="mb-1">
                <ChatToolActivityCard part={part} isRunning />
              </div>
            );
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
            // Show expandable completed card for non-approval tools
            return (
              <div key={key} className="mb-1">
                <ChatToolActivityCard part={part} isRunning={false} />
              </div>
            );
          }

          return null;
        }

        return null;
      })}
      {/* Rotating label shown below the last message's parts while a tool is in-flight.
          The per-part shimmer cards above handle the visual, this adds extra context. */}
      {message.role === "assistant" &&
        message.id === lastMessageId &&
        toolActivityActive && (
          <p className="text-[11px] text-muted-foreground px-1 pt-0.5 italic">
            {toolActivityLabel}
          </p>
        )}
    </>
  );
};
