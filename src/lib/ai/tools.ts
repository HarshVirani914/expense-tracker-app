import { categoryService } from "@/features/categories/services/category-service";
import { expenseService } from "@/features/expenses/services/expense-service";
import type { UpdateExpenseInput } from "@/features/expenses/types";
import { tool } from "ai";
import { z } from "zod";

/**
 * Factory that creates all expense tools with userId captured in closures.
 * This is the stable AI SDK v6 pattern — no experimental_context needed.
 *
 * Architecture: AI Tool (userId from closure) → Service → Database
 */
export const getExpenseTools = (userId: string) => ({
  queryExpenses: tool({
    description:
      "Search through the user's expenses with filters like category, date range, or amount (all amounts in INR). Use this to answer questions about their spending history.",
    inputSchema: z.object({
      category: z
        .string()
        .optional()
        .describe("Filter by category name (e.g., 'Food', 'Transport')"),
      startDate: z.iso.datetime().optional().describe("Start date (ISO format)"),
      endDate: z.iso.datetime().optional().describe("End date (ISO format)"),
      minAmount: z.number().optional().describe("Minimum amount in INR"),
      maxAmount: z.number().optional().describe("Maximum amount in INR"),
      limit: z.number().default(20).describe("Maximum number of results to return"),
    }),
    execute: async ({ category, startDate, endDate, minAmount, maxAmount, limit }) => {
      try {
        const categories = await categoryService.list(userId);
        const result = await expenseService.list(userId, {
          categoryId: category
            ? categories.find((c) => c.name.toLowerCase() === category.toLowerCase())?.id
            : undefined,
          startDate,
          endDate,
          minAmount,
          maxAmount,
          page: 1,
          limit,
        });
        return {
          count: result.data.length,
          expenses: result.data.map((e) => ({
            id: e.id,
            amount: Number(e.amount),
            description: e.description,
            date: e.date.toISOString(),
            category: e.category.name,
            type: e.type,
            account: e.account?.name,
          })),
        };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to query expenses" };
      }
    },
  }),

  createExpense: tool({
    description:
      "Add a new expense or income transaction for the user. Amounts are always in Indian Rupees (INR).",
    inputSchema: z.object({
      amount: z.number().positive().describe("Amount in Indian Rupees (INR), e.g. 45.5 means ₹45.50"),
      description: z.string().describe("What the expense was for (e.g., 'Groceries at local market')"),
      categoryName: z
        .string()
        .describe("Category name (e.g., 'Food', 'Transport', 'Entertainment')"),
      date: z
        .iso.datetime()
        .optional()
        .describe("When the expense occurred (ISO format, defaults to today)"),
      type: z
        .enum(["EXPENSE", "INCOME"])
        .default("EXPENSE")
        .describe("Is this spending money (EXPENSE) or receiving money (INCOME)?"),
    }),
    needsApproval: true,
    execute: async ({ amount, description, categoryName, date, type }) => {
      try {
        const categories = await categoryService.list(userId);
        const category = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
        );
        if (!category) {
          return {
            success: false,
            error: `Category '${categoryName}' not found. Available categories: ${categories.map((c) => c.name).join(", ")}`,
          };
        }
        const expense = await expenseService.create(userId, {
          amount,
          description: description || "",
          categoryId: category.id,
          type,
          date: date || new Date().toISOString(),
          paymentMethod: "OTHER",
        });
        return {
          success: true,
          message: `Successfully added ${type === "EXPENSE" ? "expense" : "income"} of ₹${amount.toFixed(2)}!`,
          expense: {
            id: expense.id,
            amount: Number(expense.amount),
            description: expense.description,
            category: expense.category.name,
            date: expense.date.toISOString(),
            type: expense.type,
          },
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to create expense" };
      }
    },
  }),

  updateExpense: tool({
    description:
      "Modify an existing expense transaction. Use this when the user wants to change details of a recorded expense.",
    inputSchema: z.object({
      expenseId: z.string().describe("ID of the expense to update"),
      amount: z.number().positive().optional().describe("New amount in INR"),
      description: z.string().optional().describe("New description"),
      categoryName: z.string().optional().describe("New category name"),
      date: z.iso.datetime().optional().describe("New date (ISO format)"),
    }),
    needsApproval: true,
    execute: async ({ expenseId, amount, description, categoryName, date }) => {
      try {
        const updateData: UpdateExpenseInput = {};
        if (amount !== undefined) updateData.amount = amount;
        if (description !== undefined) updateData.description = description;
        if (date !== undefined) updateData.date = date;
        if (categoryName) {
          const categories = await categoryService.list(userId);
          const category = categories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
          );
          if (!category) {
            return { success: false, error: `Category '${categoryName}' not found` };
          }
          updateData.categoryId = category.id;
        }
        const expense = await expenseService.update(expenseId, userId, updateData);
        return {
          success: true,
          expense: {
            id: expense.id,
            amount: Number(expense.amount),
            description: expense.description,
            category: expense.category.name,
            date: expense.date.toISOString(),
            type: expense.type,
          },
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update expense" };
      }
    },
  }),

  deleteExpense: tool({
    description:
      "Remove an expense from the user's records. IMPORTANT: Always confirm with the user before deleting.",
    inputSchema: z.object({
      expenseId: z.string().describe("ID of the expense to delete"),
    }),
    needsApproval: true,
    execute: async ({ expenseId }) => {
      try {
        await expenseService.delete(expenseId, userId);
        return { success: true, message: "Expense deleted successfully" };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete expense" };
      }
    },
  }),

  getSpendingSummary: tool({
    description:
      "Get an overview of the user's spending and income for a time period. All totals are in Indian Rupees (INR). Use this to answer questions about their financial summary.",
    inputSchema: z.object({
      period: z
        .enum(["week", "month", "year"])
        .default("month")
        .describe("Time period: 'week' for last 7 days, 'month' for last 30 days, 'year' for last 365 days"),
      startDate: z.iso.datetime().optional().describe("Custom start date (ISO format)"),
      endDate: z.iso.datetime().optional().describe("Custom end date (ISO format)"),
    }),
    execute: async ({ period, startDate, endDate }) => {
      try {
        const now = new Date();
        let start = new Date();
        if (startDate) {
          start = new Date(startDate);
        } else if (period === "week") {
          start.setDate(now.getDate() - 7);
        } else if (period === "month") {
          start.setMonth(now.getMonth() - 1);
        } else {
          start.setFullYear(now.getFullYear() - 1);
        }
        const end = endDate ? new Date(endDate) : now;
        const summary = await expenseService.getSummary(userId, {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });
        return { period, dateRange: { start: start.toISOString(), end: end.toISOString() }, ...summary };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to get spending summary" };
      }
    },
  }),
});
