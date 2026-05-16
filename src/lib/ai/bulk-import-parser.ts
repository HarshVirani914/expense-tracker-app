"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { fallbackChains, withModelFallback } from "./models";

const BulkImportSchema = z.object({
  expenses: z.array(z.object({
    date: z.iso.datetime(),
    description: z.string(),
    amount: z.number().positive(),
    category: z.string(),
    type: z.enum(["EXPENSE", "INCOME"]),
    confidence: z.number().min(0).max(1),
  })),
});

export const analyzeBulkImportFile = async (
  fileContent: string,
  fileType: "csv" | "xlsx" | "pdf" | "text",
  availableCategories: string[]
) => {
  const result = await withModelFallback(
    async (model) =>
      generateText({
        model,
        output: Output.object({ schema: BulkImportSchema, name: "bulkImportParse" }),
        prompt: `Analyze this ${fileType} and extract ALL expenses.

Categories: ${availableCategories.join(", ")}

Data:
${fileContent.substring(0, 8000)}

Rules:
- Extract every transaction
- Convert dates to ISO format
- Categorize using available categories
- Infer EXPENSE vs INCOME
- Confidence score per entry`,
        temperature: 0.1,
      }),
    fallbackChains.structured
  );

  return result.output.expenses;
};
