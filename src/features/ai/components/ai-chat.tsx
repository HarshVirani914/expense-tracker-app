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
  IconSparkles,
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
      {/* ── Compact header with live status dot ─────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between gap-3 border-b bg-muted/20 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Gradient sparkle avatar */}
          <div
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-600 shadow-sm"
          >
            <IconSparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold leading-none">PocketPulse AI</p>
              {/* Live status indicator */}
              <span
                className={cn(
                  "inline-flex h-1.5 w-1.5 rounded-full",
                  isBusy
                    ? "animate-pulse bg-amber-500"
                    : "bg-emerald-500",
                )}
                aria-label={isBusy ? "Generating" : "Ready"}
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
              Powered by Gemini · data stays in your account
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip
            onOpenChange={(open) => {
              if (!open) requestAnimationFrame(() => helpTriggerRef.current?.focus());
            }}
          >
            <TooltipTrigger asChild>
              <Button
                ref={helpTriggerRef}
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label="How to use this assistant"
              >
                <IconHelp className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="max-w-xs text-xs">
              Ask in plain language. The assistant knows your spending and can help
              log new expenses — it’ll always ask before saving anything.
            </TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 shrink-0 text-xs font-normal text-muted-foreground hover:text-foreground px-2.5"
            onClick={handleNewConversation}
            disabled={isBusy || messages.length === 0}
            aria-label="Start a new conversation"
          >
            <IconPlus className="size-3" />
            New
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
            "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/60 bg-card/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md backdrop-blur-md transition-all duration-200",
            isAtBottom
              ? "pointer-events-none translate-y-2 opacity-0"
              : "pointer-events-auto translate-y-0 opacity-100",
          )}
          onClick={() => scrollToBottom("smooth")}
          type="button"
        >
          <ArrowDown className="size-3" />
          New messages
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
          className="flex items-end gap-2 pb-3"
          aria-label="Message the assistant"
        >
          {/* Input — pill shape that expands with content */}
          <div className="relative flex-1 min-w-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your financial assistant..."
              disabled={isBusy}
              className="min-h-[44px] max-h-[160px] resize-none text-sm rounded-2xl pr-3 py-3 leading-snug"
              rows={1}
              aria-label="Message"
            />
            <p className="mt-1 text-[10px] text-muted-foreground px-1">
              Enter to send · Shift+Enter for new line
            </p>
          </div>

          {/* Send / Stop button */}
          {status === "streaming" ? (
            <Button
              type="button"
              onClick={stop}
              variant="outline"
              size="icon"
              className="shrink-0 h-11 w-11 rounded-2xl mb-5 border-destructive/40 text-destructive hover:bg-destructive/10"
              aria-label="Stop generating"
            >
              <IconProgressX className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isBusy || !input.trim()}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-2xl mb-5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
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
