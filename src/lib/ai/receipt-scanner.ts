"use server";

import { generateText, Output } from "ai";
import { withModelFallback, fallbackChains } from "./models";
import { z } from "zod";

const ReceiptSchema = z.object({
  merchant: z.string(),
  date: z.iso.datetime(),
  total: z.number().positive(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
  })).optional(),
  tax: z.number().optional(),
  category: z.string(),
  confidence: z.number().min(0).max(1),
});

export const scanReceipt = async (
  imageUrl: string,
  availableCategories: string[]
) => {
  const result = await withModelFallback(
    async (model) =>
      generateText({
        model,
        output: Output.object({ schema: ReceiptSchema, name: "receiptScan" }),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract expense info from receipt.

Categories: ${availableCategories.join(", ")}

Extract: merchant, date (ISO), total, items, tax, category, confidence`,
              },
              {
                type: "image",
                image: imageUrl,
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    fallbackChains.structured
  );

  return result.output;
};
