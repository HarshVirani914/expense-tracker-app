"use client";

import type { ChatAddToolApproveResponseFunction, ToolUIPart } from "ai";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseChatTools } from "@/lib/ai/chat-message";
import { getToolDoneLabel } from "@/features/ai/lib/chat-tool-messages";

type UpdateExpenseToolPart = Extract<
  ToolUIPart<ExpenseChatTools>,
  { type: "tool-updateExpense" }
>;

type DeleteExpenseToolPart = Extract<
  ToolUIPart<ExpenseChatTools>,
  { type: "tool-deleteExpense" }
>;

export type ExpenseMutationToolPart =
  | UpdateExpenseToolPart
  | DeleteExpenseToolPart;

type ChatToolExpenseMutationProps = {
  part: ExpenseMutationToolPart;
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

const summarizeUpdate = (
  input: UpdateExpenseToolPart["input"] | undefined,
) => {
  if (!input) {
    return ["No field changes were specified."];
  }
  const lines: string[] = [];
  lines.push(`Entry ID: ${input.expenseId}`);
  if (input.amount !== undefined) {
    lines.push(`New amount (INR): ₹${input.amount.toFixed(2)}`);
  }
  if (input.description !== undefined) {
    lines.push(`New description: ${input.description}`);
  }
  if (input.categoryName !== undefined) {
    lines.push(`New category: ${input.categoryName}`);
  }
  if (input.date !== undefined) {
    lines.push(`New date: ${input.date}`);
  }
  return lines;
};

export const ChatToolExpenseMutation = ({
  part,
  addToolApprovalResponse,
}: ChatToolExpenseMutationProps) => {
  if (part.state === "approval-requested") {
    if (part.type === "tool-deleteExpense") {
      const { expenseId } = part.input;
      return (
        <div className="p-4 rounded-lg border bg-card mb-2">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <IconAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Confirm delete</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Remove expense record{" "}
                  <span className="font-mono text-xs text-foreground">
                    {expenseId}
                  </span>
                  . This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                type="button"
                variant="destructive"
                onClick={() =>
                  addToolApprovalResponse({
                    id: part.approval.id,
                    approved: true,
                  })
                }
                className="flex-1 gap-2"
              >
                <IconCheck className="w-4 h-4" />
                Delete
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

    const lines = summarizeUpdate(part.input);
    return (
      <div className="p-4 rounded-lg border bg-card mb-2">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <IconAlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Confirm update</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                {lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
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
    const output = part.output as {
      success?: boolean;
      error?: string;
      message?: string;
    };
    const isError = output.success === false || Boolean(output.error);
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
        Action cancelled. Nothing was changed.
      </div>
    );
  }

  return null;
};
