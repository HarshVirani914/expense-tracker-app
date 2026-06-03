import type { InferUITool, UIMessage } from "ai";
import type { getExpenseTools } from "@/lib/ai/tools";

// Derive tool types from the factory's return type — no dummy userId needed.
type ToolMap = ReturnType<typeof getExpenseTools>;

export type ExpenseChatTools = {
  queryExpenses: InferUITool<ToolMap["queryExpenses"]>;
  createExpense: InferUITool<ToolMap["createExpense"]>;
  updateExpense: InferUITool<ToolMap["updateExpense"]>;
  deleteExpense: InferUITool<ToolMap["deleteExpense"]>;
  getSpendingSummary: InferUITool<ToolMap["getSpendingSummary"]>;
};

export type ChatMessage = UIMessage<
  Record<string, never>,
  Record<string, never>,
  ExpenseChatTools
>;
