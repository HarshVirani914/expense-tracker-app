import type { InferUITool, UIMessage } from "ai";
import {
  createExpenseTool,
  deleteExpenseTool,
  getSpendingSummaryTool,
  queryExpensesTool,
  updateExpenseTool,
} from "@/lib/ai/tools";

export type ExpenseChatTools = {
  queryExpenses: InferUITool<typeof queryExpensesTool>;
  createExpense: InferUITool<typeof createExpenseTool>;
  updateExpense: InferUITool<typeof updateExpenseTool>;
  deleteExpense: InferUITool<typeof deleteExpenseTool>;
  getSpendingSummary: InferUITool<typeof getSpendingSummaryTool>;
};

export type ChatMessage = UIMessage<
  Record<string, never>,
  Record<string, never>,
  ExpenseChatTools
>;
