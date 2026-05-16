"use server";

import { generateText, Output } from "ai";
import { fallbackChains, withModelFallback } from "./models";
import { ExpenseParseSchema } from "./types";

export const parseExpenseFromText = async (
  input: string,
  availableCategories: string[],
) => {
  const result = await withModelFallback(
    async (model) =>
      generateText({
        model,
        output: Output.object({ schema: ExpenseParseSchema, name: "expenseParse" }),
        prompt: `Parse this expense: "${input}"

Available categories: ${availableCategories.join(", ")}
Today: ${new Date().toISOString()}

Rules:
- Amounts are in Indian Rupees (INR); never treat numbers as USD unless the user says USD/dollars explicitly
- Choose most relevant category
- Default to today if date not specified
- Infer payment method if mentioned
- Determine EXPENSE vs INCOME
- Provide confidence (0-1)`,
        temperature: 0.1,
      }),
    fallbackChains.structured
  );

  return result.output;
};
