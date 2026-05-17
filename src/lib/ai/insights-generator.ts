"use server";

import { prisma } from "@/lib/prisma";
import { generateText, Output } from "ai";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { z } from "zod";
import { fallbackChains, withModelFallback } from "./models";

const InsightsSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(["info", "warning", "alert"]),
    actionable: z.string().optional(),
  })),
});

export const generateSpendingInsights = async (userId: string) => {
  const now = new Date();

  const [thisMonth, lastMonth, categories] = await Promise.all([
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: { gte: startOfMonth(now), lte: endOfMonth(now) },
        type: "EXPENSE",
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: {
          gte: startOfMonth(subMonths(now, 1)),
          lte: endOfMonth(subMonths(now, 1))
        },
        type: "EXPENSE",
      },
      _sum: { amount: true },
    }),
    prisma.category.findMany({
      where: { OR: [{ userId }, { isDefault: true }] },
    }),
  ]);

  const categoryMap = Object.fromEntries(
    categories.map(c => [c.id, c.name])
  );

  const result = await withModelFallback(
    async (model) =>
      generateText({
        model,
        output: Output.object({ schema: InsightsSchema }),
        prompt: `You're a friendly financial advisor analyzing spending patterns for a user. Review their expense data and provide 3-5 conversational, actionable insights.

Currency (critical): Every monetary value in the data below is in Indian Rupees (INR only), not US dollars or any other currency. When you write insights, always refer to amounts as rupees or use the ₹ prefix (e.g. ₹1,200). Never assume USD or interpret values as dollars.

Current Month Data:
${JSON.stringify(thisMonth.map(i => ({
      category: categoryMap[i.categoryId],
      spent: i._sum.amount,
      transactions: i._count,
    })), null, 2)}

Previous Month Data:
${JSON.stringify(lastMonth.map(i => ({
      category: categoryMap[i.categoryId],
      spent: i._sum.amount,
    })), null, 2)}

Guidelines:
- Write in a friendly, conversational tone like talking to a friend
- Be specific with numbers and percentages but explain them naturally; amounts are always INR (rupees)
- Focus on meaningful changes (>20%) and patterns
- Celebrate positive behaviors and gently highlight concerns
- Provide practical, actionable advice
- Avoid technical jargon - use everyday language
- Make insights feel personal and relatable

Severity levels:
- "alert": Major concerns (>50% increases in non-essential spending, unusual patterns)
- "warning": Moderate concerns (20-50% increases, emerging patterns to watch)
- "info": Positive trends, new categories, or informational observations

Each insight should feel like helpful advice from a financially savvy friend.`,
        temperature: 0.7,
      }),
    fallbackChains.general
  );

  return result.output.insights;
};
