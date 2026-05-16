"use client";

import type { ChatAddToolApproveResponseFunction, ToolUIPart } from "ai";
import {
  IconAlertCircle,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseChatTools } from "@/lib/ai/chat-message";
import { getToolDoneLabel } from "@/features/ai/lib/chat-tool-messages";

export type CreateExpenseToolPart = Extract<
  ToolUIPart<ExpenseChatTools>,
  { type: "tool-createExpense" }
>;

type ChatToolCreateExpenseProps = {
  part: CreateExpenseToolPart;
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

export const ChatToolCreateExpense = ({
  part,
  addToolApprovalResponse,
}: ChatToolCreateExpenseProps) => {
  if (part.state === "approval-requested") {
    const input = part.input;

    return (
      <div className="p-4 rounded-lg border bg-card mb-2">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <IconSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                Confirm {input.type === "EXPENSE" ? "Expense" : "Income"}
              </p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Amount:</strong> ₹
                  {input.amount.toFixed(2)}
                </p>
                <p>
                  <strong className="text-foreground">Description:</strong>{" "}
                  {input.description}
                </p>
                <p>
                  <strong className="text-foreground">Category:</strong>{" "}
                  {input.categoryName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              type="button"
              onClick={() =>
                addToolApprovalResponse({
                  id: part.approval.id,
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
              type="button"
              variant="outline"
              onClick={() =>
                addToolApprovalResponse({
                  id: part.approval.id,
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

  if (part.state === "output-available") {
    const output = part.output;
    const isError = output.success === false || output.error;
    return (
      <div className="p-3 rounded-lg border bg-card mb-2 text-sm">
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

  if (part.state === "output-error" && part.errorText) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 mb-2 px-3 py-2 text-sm text-destructive">
        {part.errorText}
      </div>
    );
  }

  if (part.state === "output-denied") {
    return (
      <div className="rounded-lg border bg-muted/50 mb-2 px-3 py-2 text-xs text-muted-foreground">
        Action cancelled.
      </div>
    );
  }

  return null;
};
