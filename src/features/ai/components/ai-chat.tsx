"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import {
  IconAlertCircle,
  IconProgressX,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { ArrowDown } from "lucide-react";
import { useState } from "react";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useRotatingToolActivityLabel } from "@/features/ai/hooks/use-rotating-tool-activity-label";
import type { ChatMessage } from "@/lib/ai/chat-message";
import { getChatErrorDisplay } from "@/lib/ai/chat-client-error-display";
import { AIChatEmptyState } from "@/features/ai/components/ai-chat-empty-state";
import { AIChatThinkingIndicator } from "@/features/ai/components/ai-chat-thinking-indicator";
import { ChatMessageRow } from "@/features/ai/components/chat-message-row";
import { cn } from "@/lib/utils";

export const AIChat = () => {
  const [input, setInput] = useState("");
  const [chatId] = useState(() => crypto.randomUUID());

  const {
    messages,
    status,
    error,
    clearError,
    sendMessage,
    stop,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    id: chatId,
    generateId: () => crypto.randomUUID(),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    transport: new DefaultChatTransport<ChatMessage>({
      api: "/api/chat",
      prepareSendMessagesRequest: ({
        id,
        messages: requestMessages,
        body,
        trigger,
        messageId,
      }) => ({
        body: {
          id,
          messages: requestMessages,
          trigger,
          messageId,
          ...body,
        },
      }),
    }),
  });

  const { containerRef, endRef, isAtBottom, scrollToBottom } =
    useScrollToBottom();
  const { active: toolActivityActive, label: toolActivityLabel } =
    useRotatingToolActivityLabel(status, messages);
  const lastMessageId = messages.at(-1)?.id;
  const chatErrorDisplay = getChatErrorDisplay(error);
  const isBusy = status === "streaming" || status === "submitted";

  const handleSubmit = async (
    e: React.FormEvent | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) {
      return;
    }
    clearError();
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
    setInput("");
    scrollToBottom("smooth");
  };

  const handleDismissError = () => {
    clearError();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col min-h-[500px] rounded-lg border bg-card relative">
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-auto p-4"
        >
          <div className="space-y-4 min-h-full">
            {messages.length === 0 && <AIChatEmptyState />}

            {messages.map((message) => (
              <ChatMessageRow
                key={message.id}
                message={message}
                lastMessageId={lastMessageId}
                status={status}
                toolActivityActive={toolActivityActive}
                toolActivityLabel={toolActivityLabel}
                addToolApprovalResponse={addToolApprovalResponse}
              />
            ))}

            <AIChatThinkingIndicator
              status={status}
              lastMessageRole={messages.at(-1)?.role}
            />

            <div ref={endRef} className="h-px" />
          </div>
        </div>

        <button
          aria-label="Scroll to bottom"
          className={cn(
            "absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-full border border-border/50 bg-card/90 shadow-lg backdrop-blur-lg transition-all duration-200 h-8 w-8",
            isAtBottom
              ? "pointer-events-none scale-90 opacity-0"
              : "pointer-events-auto scale-100 opacity-100",
          )}
          onClick={() => scrollToBottom("smooth")}
          type="button"
        >
          <ArrowDown className="size-4 text-muted-foreground" />
        </button>
      </div>

      <div className="border-t px-4 pt-3 pb-0 space-y-3">
        {chatErrorDisplay && (
          <Alert
            variant={
              chatErrorDisplay.variant === "generic" ? "destructive" : "default"
            }
            className="relative pr-10"
          >
            <IconAlertCircle aria-hidden className="size-4" />
            <AlertTitle>{chatErrorDisplay.title}</AlertTitle>
            <AlertDescription>{chatErrorDisplay.description}</AlertDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 size-7 shrink-0 rounded-full"
              onClick={handleDismissError}
              aria-label="Dismiss error"
            >
              <IconX className="size-4" />
            </Button>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="pb-4 flex gap-2 items-center">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your expenses..."
          disabled={isBusy}
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        {status === "streaming" ? (
          <Button
            type="button"
            onClick={stop}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <IconProgressX className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isBusy || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            <IconSend className="h-4 w-4" />
          </Button>
        )}
        </form>
      </div>
    </div>
  );
};
