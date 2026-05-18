"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import {
  IconAlertCircle,
  IconHelp,
  IconPlus,
  IconProgressX,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { ArrowDown } from "lucide-react";
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { useRotatingToolActivityLabel } from "@/features/ai/hooks/use-rotating-tool-activity-label";
import type { ChatMessage } from "@/lib/ai/chat-message";
import { getChatErrorDisplay } from "@/lib/ai/chat-client-error-display";
import { AIChatEmptyState } from "@/features/ai/components/ai-chat-empty-state";
import { AIChatThinkingIndicator } from "@/features/ai/components/ai-chat-thinking-indicator";
import { ChatMessageRow } from "@/features/ai/components/chat-message-row";
import { cn } from "@/lib/utils";

type AIChatProps = {
  className?: string;
};

export const AIChat = ({ className }: AIChatProps) => {
  const [input, setInput] = useState("");
  const [chatId] = useState(() => crypto.randomUUID());
  const helpTriggerRef = useRef<HTMLButtonElement | null>(null);

  const {
    messages,
    status,
    error,
    clearError,
    sendMessage,
    stop,
    addToolApprovalResponse,
    setMessages,
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

  const handleSendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) {
      return;
    }
    clearError();
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text: trimmed }],
    });
    scrollToBottom("smooth");
  };

  const handleNewConversation = () => {
    if (isBusy || messages.length === 0) {
      return;
    }
    clearError();
    setInput("");
    setMessages([]);
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
    <div
      className={cn(
        "flex min-w-0 flex-col min-h-[min(520px,calc(100dvh-14rem))] md:min-h-[min(640px,calc(100dvh-12rem))] rounded-xl border bg-card shadow-sm relative overflow-hidden",
        className,
      )}
    >
      <header className="shrink-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b bg-muted/25 px-4 py-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold leading-tight">
            Financial assistant
          </p>
          <p className="text-xs text-muted-foreground">
            Uses the accounts and expenses you added in this app so answers fit
            your situation. You’ll be asked to confirm before anything new is
            saved.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
          <Tooltip
            onOpenChange={(open) => {
              if (!open) {
                requestAnimationFrame(() =>
                  helpTriggerRef.current?.focus(),
                );
              }
            }}
          >
            <TooltipTrigger asChild>
              <Button
                ref={helpTriggerRef}
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground"
                aria-label="How to use this assistant"
              >
                <IconHelp className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="end"
              className="max-w-xs text-xs"
            >
              Ask in your own words. The assistant can sum up spending, find past
              expenses, or help you add new ones. If it might change your data,
              it will ask you to approve first.
            </TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={handleNewConversation}
            disabled={isBusy || messages.length === 0}
            aria-label="Start a new conversation"
          >
            <IconPlus className="size-3.5" />
            New chat
          </Button>
        </div>
      </header>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-auto p-4 sm:p-5 scroll-smooth"
        >
          <div className="space-y-4 min-h-full">
            {messages.length === 0 && (
              <AIChatEmptyState
                onStarterSelect={handleSendText}
                isDisabled={isBusy}
              />
            )}

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
          aria-label="Scroll to latest messages"
          className={cn(
            "absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-full border border-border/50 bg-card/95 shadow-md backdrop-blur-md transition-all duration-200 h-9 w-9",
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

      <div className="shrink-0 border-t bg-card px-4 pt-3 pb-0 space-y-2">
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

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 items-start pb-3"
          aria-label="Message the assistant"
        >
          <div className="flex-1 space-y-1.5 min-w-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your assistant..."
              disabled={isBusy}
              className="min-h-[48px] max-h-[160px] resize-none text-sm"
              rows={1}
              aria-label="Message"
            />
            <p className="text-[11px] text-muted-foreground px-0.5">
              Enter to send · Shift+Enter for a new line
            </p>
          </div>
          {status === "streaming" ? (
            <Button
              type="button"
              onClick={stop}
              variant="outline"
              size="icon"
              className="shrink-0 size-11"
              aria-label="Stop generating"
            >
              <IconProgressX className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isBusy || !input.trim()}
              size="icon"
              className="shrink-0 size-11"
              aria-label="Send message"
            >
              <IconSend className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};
