import { categoryService } from "@/features/categories/services/category-service";
import { expenseService } from "@/features/expenses/services/expense-service";
import { tool } from "ai";
import { z } from "zod";

/**
 * Reusable AI tools for expense management
 * These tools call existing services to maintain consistency and reuse business logic
 *
 * Architecture: AI Tool → Service → Database
 *
 * Context injection: userId is passed via experimental_context in ToolExecutionOptions
 */

interface ToolContext {
  userId: string;
}

export const queryExpensesTool = tool({
  description: "Search through the user's expenses with filters like category, date range, or amount (all amounts in INR). Use this to answer questions about their spending history.",
  inputSchema: z.object({
    category: z.string().optional().describe("Filter by category name (e.g., 'Food', 'Transport')"),
    startDate: z.iso.datetime().optional().describe("Start date (ISO format)"),
    endDate: z.iso.datetime().optional().describe("End date (ISO format)"),
    minAmount: z.number().optional().describe("Minimum amount in INR"),
    maxAmount: z.number().optional().describe("Maximum amount in INR"),
    limit: z
      .number()
      .default(20)
      .describe("Maximum number of results to return"),
  }),
  execute: async (
    { category, startDate, endDate, minAmount, maxAmount, limit },
    options,
  ) => {
    try {
      const context = options.experimental_context as ToolContext;
      if (!context?.userId) {
        return { error: "User context required" };
      }

      const categories = await categoryService.list(context.userId);

      const result = await expenseService.list(context.userId, {
        categoryId: category
          ? categories.find(
            (c) => c.name.toLowerCase() === category.toLowerCase(),
          )?.id
          : undefined,
        startDate: startDate,
        endDate: endDate,
        minAmount: minAmount,
        maxAmount: maxAmount,
        page: 1,
        limit: limit,
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
      return {
        error:
          error instanceof Error ? error.message : "Failed to query expenses",
      };
    }
  },
});

export const createExpenseTool = tool({
  description: "Add a new expense or income transaction for the user. Amounts are always in Indian Rupees (INR).",
  inputSchema: z.object({
    amount: z.number().positive().describe("Amount in Indian Rupees (INR), e.g. 45.5 means ₹45.50"),
    description: z.string().describe("What the expense was for (e.g., 'Groceries at local market')"),
    categoryName: z.string().describe("Category name (e.g., 'Food', 'Transport', 'Entertainment')"),
    date: z
      .iso.datetime()
      .optional()
      .describe("When the expense occurred (ISO format, defaults to today)"),
    type: z
      .enum(["EXPENSE", "INCOME"])
      .default("EXPENSE")
      .describe("Is this spending money (EXPENSE) or receiving money (INCOME)?"),
  }),
  // Enable approval requirement - user must confirm before execution
  needsApproval: true,
  execute: async (
    { amount, description, categoryName, date, type },
    options,
  ) => {
    try {
      const context = options.experimental_context as ToolContext;
      if (!context?.userId) {
        return { error: "User context required" };
      }

      const categories = await categoryService.list(context.userId);
      const category = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
      );

      if (!category) {
        return {
          success: false,
          error: `Category '${categoryName}' not found. Available categories: ${categories.map((c) => c.name).join(", ")}`,
        };
      }

      const expense = await expenseService.create(context.userId, {
        amount: amount,
        description: description || "",
        categoryId: category.id,
        type: type,
        date: date || new Date().toISOString(),
        paymentMethod: "OTHER",
      });

      return {
        success: true,
        message: `Successfully added ${type === 'EXPENSE' ? 'expense' : 'income'} of ₹${amount.toFixed(2)}!`,
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
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create expense",
      };
    }
  },
});

export const updateExpenseTool = tool({
  description: "Modify an existing expense transaction. Use this when the user wants to change details of a recorded expense.",
  inputSchema: z.object({
    expenseId: z.string().describe("ID of the expense to update"),
    amount: z.number().positive().optional().describe("New amount in INR"),
    description: z.string().optional().describe("New description"),
    categoryName: z.string().optional().describe("New category name"),
    date: z.iso.datetime().optional().describe("New date (ISO format)"),
  }),
  execute: async (
    { expenseId, amount, description, categoryName, date },
    options,
  ) => {
    try {
      const context = options.experimental_context as ToolContext;
      if (!context?.userId) {
        return { error: "User context required" };
      }

      const updateData: any = {};

      if (amount !== undefined) updateData.amount = amount;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = date;

      if (categoryName) {
        const categories = await categoryService.list(context.userId);
        const category = categories.find(
          (c) => c.name.toLowerCase() === categoryName!.toLowerCase(),
        );

        if (!category) {
          return {
            success: false,
            error: `Category '${categoryName}' not found`,
          };
        }

        updateData.categoryId = category.id;
      }

      const expense = await expenseService.update(
        expenseId,
        context.userId,
        updateData,
      );

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
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update expense",
      };
    }
  },
});

export const deleteExpenseTool = tool({
  description: "Remove an expense from the user's records. IMPORTANT: Always confirm with the user before deleting.",
  inputSchema: z.object({
    expenseId: z.string().describe("ID of the expense to delete"),
  }),
  execute: async ({ expenseId }, options) => {
    try {
      const context = options.experimental_context as ToolContext;
      if (!context?.userId) {
        return { error: "User context required" };
      }

      await expenseService.delete(expenseId, context.userId);

      return {
        success: true,
        message: "Expense deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete expense",
      };
    }
  },
});

export const getSpendingSummaryTool = tool({
  description: "Get an overview of the user's spending and income for a time period. All totals are in Indian Rupees (INR). Use this to answer questions about their financial summary.",
  inputSchema: z.object({
    period: z
      .enum(["week", "month", "year"])
      .default("month")
      .describe("Time period: 'week' for last 7 days, 'month' for last 30 days, 'year' for last 365 days"),
    startDate: z.iso.datetime().optional().describe("Custom start date (ISO format)"),
    endDate: z.iso.datetime().optional().describe("Custom end date (ISO format)"),
  }),
  execute: async ({ period, startDate, endDate }, options) => {
    try {
      const context = options.experimental_context as ToolContext;
      if (!context?.userId) {
        return { error: "User context required" };
      }

      const now = new Date();
      let start = new Date();

      if (startDate) {
        start = new Date(startDate);
      } else {
        if (period === "week") start.setDate(now.getDate() - 7);
        else if (period === "month") start.setMonth(now.getMonth() - 1);
        else start.setFullYear(now.getFullYear() - 1);
      }

      const end = endDate ? new Date(endDate) : now;

      const summary = await expenseService.getSummary(context.userId, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      return {
        period: period,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        ...summary,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get spending summary",
      };
    }
  },
});

/**
 * Get all tools for AI chat
 * Returns tools object that can be passed to streamText
 */
export const getExpenseTools = () => ({
  queryExpenses: queryExpensesTool,
  createExpense: createExpenseTool,
  updateExpense: updateExpenseTool,
  deleteExpense: deleteExpenseTool,
  getSpendingSummary: getSpendingSummaryTool,
});
