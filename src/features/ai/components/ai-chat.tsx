"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import {
  IconAlertCircle,
  IconCheck,
  IconLoader,
  IconProgressX,
  IconRobot,
  IconSend,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { ArrowDown, X } from "lucide-react";
import { useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { useRotatingToolActivityLabel } from "@/hooks/use-rotating-tool-activity-label";
import type { ChatMessage } from "@/lib/ai/chat-message";
import {
  getToolDoneLabel,
  isToolPartRunning,
} from "@/features/ai/lib/chat-tool-messages";
import { ChatAssistantMarkdown } from "@/features/ai/components/chat-assistant-markdown";
import { toast } from "sonner";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";

export const AIChat = () => {
  const [input, setInput] = useState("");
  const [chatId] = useState(() => crypto.randomUUID());

  const { messages, status, sendMessage, stop, addToolApprovalResponse } =
    useChat<ChatMessage>({
      id: chatId,
      generateId: () => crypto.randomUUID(),
      sendAutomaticallyWhen:
        lastAssistantMessageIsCompleteWithApprovalResponses,
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
      onError: (error) => {
        if (error instanceof AppError) {
          toast.error(error.message);
        } else {
          toast.error(
            error.message || "An error occurred while processing your message.",
          );
        }
      },
    });

  const { containerRef, endRef, isAtBottom, scrollToBottom } = useMessages();
  const { active: toolActivityActive, label: toolActivityLabel } =
    useRotatingToolActivityLabel(status, messages);
  const lastMessageId = messages.at(-1)?.id;

  const handleSubmit = async (
    e: React.SubmitEvent | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== "ready") {
      return;
    }
    await sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
    setInput("");
    scrollToBottom("smooth");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col min-h-[500px] rounded-lg border bg-card relative">
      {/* Chat Messages */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-auto p-4"
        >
          <div className="space-y-4 min-h-full">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <IconSparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Start a Conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me to show expenses, add transactions, or get spending
                  insights
                </p>
                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium">Try asking:</p>
                  <div className="space-y-1 text-left">
                    <p>• &quot;Add ₹50 for groceries today&quot;</p>
                    <p>• &quot;Show my food expenses this month&quot;</p>
                    <p>• &quot;What&apos;s my spending summary?&quot;</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      {status === "streaming" &&
                      message === messages[messages.length - 1] ? (
                        <IconLoader className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                      ) : (
                        <IconRobot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user" ? "" : "w-full"
                    }`}
                  >
                    {/* Render message parts */}
                    {message.parts.map((part, index) => {
                      // Text parts
                      if (part.type === "text") {
                        if (message.role === "user") {
                          return (
                            <div
                              key={index}
                              className="p-3 rounded-lg mb-2 bg-primary text-primary-foreground"
                            >
                              <span className="whitespace-pre-wrap text-sm">
                                {part.text}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={index}
                            className="p-3 rounded-lg mb-2 bg-muted"
                          >
                            <ChatAssistantMarkdown>
                              {part.text}
                            </ChatAssistantMarkdown>
                          </div>
                        );
                      }

                      if (part.type?.startsWith("tool-")) {
                        const toolPart = part as {
                          state?: string;
                          type: string;
                          input?: unknown;
                          output?: unknown;
                          errorText?: string;
                          approval?: {
                            id: string;
                            approved: boolean;
                            reason?: string;
                          };
                        };

                        if (isToolPartRunning(toolPart.state)) {
                          return null;
                        }

                        if (
                          part.type === "tool-createExpense" &&
                          toolPart.state === "approval-requested"
                        ) {
                          const input = toolPart.input as {
                            amount: number;
                            description: string;
                            categoryName: string;
                            date?: string;
                            type: string;
                          };

                          return (
                            <div
                              key={index}
                              className="p-4 rounded-lg border bg-card mb-2"
                            >
                              <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                  <IconSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">
                                      Confirm{" "}
                                      {input.type === "EXPENSE"
                                        ? "Expense"
                                        : "Income"}
                                    </p>
                                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                      <p>
                                        <strong className="text-foreground">
                                          Amount:
                                        </strong>{" "}
                                        ₹{input.amount.toFixed(2)}
                                      </p>
                                      <p>
                                        <strong className="text-foreground">
                                          Description:
                                        </strong>{" "}
                                        {input.description}
                                      </p>
                                      <p>
                                        <strong className="text-foreground">
                                          Category:
                                        </strong>{" "}
                                        {input.categoryName}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      addToolApprovalResponse({
                                        id: toolPart.approval!.id,
                                        approved: true,
                                      })
                                    }
                                    className="flex-1 gap-2"
                                  >
                                    <IconCheck className="w-4 h-4" />
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      addToolApprovalResponse({
                                        id: toolPart.approval!.id,
                                        approved: false,
                                        reason: "User declined",
                                      })
                                    }
                                    className="flex-1 gap-2"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (
                          part.type === "tool-createExpense" &&
                          toolPart.state === "output-available"
                        ) {
                          const output = toolPart.output as {
                            message?: string;
                            success?: boolean;
                            error?: string;
                          };
                          const isError =
                            output.success === false || output.error;
                          return (
                            <div
                              key={index}
                              className="p-3 rounded-lg border bg-card mb-2 text-sm"
                            >
                              <div
                                className={`flex items-center gap-2 ${isError ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
                              >
                                {isError ? (
                                  <IconAlertCircle className="w-4 h-4 shrink-0" />
                                ) : (
                                  <IconCheck className="w-4 h-4 shrink-0" />
                                )}
                                <span className="font-medium">
                                  {output.error ||
                                    output.message ||
                                    getToolDoneLabel(part.type)}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        if (
                          toolPart.state === "output-error" &&
                          toolPart.errorText
                        ) {
                          return (
                            <div
                              key={index}
                              className="rounded-lg border border-destructive/40 bg-destructive/10 mb-2 px-3 py-2 text-sm text-destructive"
                            >
                              {toolPart.errorText}
                            </div>
                          );
                        }

                        if (toolPart.state === "output-denied") {
                          return (
                            <div
                              key={index}
                              className="rounded-lg border bg-muted/50 mb-2 px-3 py-2 text-xs text-muted-foreground"
                            >
                              Action cancelled.
                            </div>
                          );
                        }

                        if (toolPart.state === "approval-responded") {
                          return null;
                        }

                        if (toolPart.state === "output-available") {
                          return null;
                        }

                        return null;
                      }

                      if (part.type === "dynamic-tool") {
                        return null;
                      }

                      return null;
                    })}
                    {message.role === "assistant" &&
                      message.id === lastMessageId &&
                      toolActivityActive && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/80 text-sm border border-border/50 border-dashed">
                          <IconLoader className="w-4 h-4 shrink-0 animate-spin text-purple-600 dark:text-purple-400" />
                          <span className="text-muted-foreground">
                            {toolActivityLabel}
                          </span>
                        </div>
                      )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <IconUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {status === "submitted" &&
              messages.at(-1)?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <IconLoader className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}

            {/* Scroll anchor */}
            <div ref={endRef} className="h-px" />
          </div>
        </div>

        {/* Scroll to bottom button */}
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

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex gap-2 items-center"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your expenses..."
          disabled={status !== "ready"}
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
            disabled={status !== "ready" || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            <IconSend className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
};
