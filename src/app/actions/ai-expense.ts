"use server";

import { requireCurrentUser } from "@/lib/auth";
import { parseExpenseFromText } from "@/lib/ai/expense-parser";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { prisma } from "@/lib/prisma";

export const createExpenseFromNaturalLanguage = async (input: string) => {
  const user = await requireCurrentUser();

  if (!checkRateLimit(user.id)) {
    throw new Error("Rate limit exceeded. Try again in a minute.");
  }

  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: user.id }, { isDefault: true }] },
  });

  const parsed = await parseExpenseFromText(
    input,
    categories.map(c => c.name)
  );

  const category = categories.find(c =>
    c.name.toLowerCase() === parsed.category.toLowerCase()
  ) || categories.find(c => c.name === "Other");

  const expense = await prisma.expense.create({
    data: {
      amount: parsed.amount,
      description: parsed.description,
      type: parsed.type,
      date: new Date(parsed.date),
      paymentMethod: parsed.paymentMethod || "OTHER",
      userId: user.id,
      categoryId: category!.id,
    },
    include: { category: true },
  });

  await prisma.aIExpenseSuggestion.create({
    data: {
      expenseId: expense.id,
      rawInput: input,
      suggestedCategory: parsed.category,
      confidence: parsed.confidence,
      accepted: true,
    },
  });

  return { expense, confidence: parsed.confidence };
};
