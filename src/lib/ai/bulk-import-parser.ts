import { generateText, Output } from "ai";
import { z } from "zod";
import { fallbackChains, withModelFallback } from "./models";

const PaymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "UPI",
  "BANK_TRANSFER",
  "OTHER",
]);

export const BulkImportSchema = z.object({
  expenses: z.array(
    z.object({
      date: z.iso.datetime(),
      description: z.string(),
      amount: z.number().positive(),
      category: z.string(),
      type: z.enum(["EXPENSE", "INCOME"]),
      paymentMethod: PaymentMethodEnum.optional(),
      merchant: z.string().optional(),
      confidence: z.number().min(0).max(1),
    }),
  ),
});

export type BulkImportExpense = z.infer<
  typeof BulkImportSchema
>["expenses"][number];

type ImageInput = {
  data: Uint8Array;
  mediaType: string;
};

const buildParsePrompt = (
  sourceLabel: string,
  availableCategories: string[],
) => {
  const today = new Date().toISOString();

  return `Analyze this ${sourceLabel} and extract ALL valid financial transactions.

Categories: ${availableCategories.join(", ")}
Today: ${today}

Rules:
- Amounts are in Indian Rupees (INR); never treat numbers as USD unless explicitly stated
- Extract every debit, credit, UPI, card, or bank transfer transaction
- Skip OTP codes, promotional messages, balance-only alerts, and non-transaction SMS
- Convert dates to ISO format; infer the current year when missing
- Extract merchant names from UPI/VPA strings and payment descriptions
- Categorize using available categories only
- Infer EXPENSE vs INCOME from message context
- Infer payment method (UPI, CARD, BANK_TRANSFER, CASH, OTHER) when mentioned
- Deduplicate identical repeated messages
- Provide a confidence score (0-1) per entry`;
};

export const analyzeBulkImportFile = async (
  fileContent: string,
  fileType: "csv" | "xlsx" | "pdf" | "text",
  availableCategories: string[],
): Promise<BulkImportExpense[]> => {
  const result = await withModelFallback(
    async (model) =>
      generateText({
        model,
        output: Output.object({
          schema: BulkImportSchema,
          name: "bulkImportParse",
        }),
        prompt: `${buildParsePrompt(fileType, availableCategories)}

Data:
${fileContent.substring(0, 10000)}`,
        temperature: 0.1,
      }),
    fallbackChains.structured,
  );

  return result.output.expenses;
};

export const analyzeBulkImportImages = async (
  images: ImageInput[],
  availableCategories: string[],
): Promise<BulkImportExpense[]> => {
  const imageParts = images.map((img) => ({
    type: "image" as const,
    image: img.data,
    mediaType: img.mediaType,
  }));

  const result = await withModelFallback(
    async (model) =>
      generateText({
        model,
        output: Output.object({
          schema: BulkImportSchema,
          name: "bulkImportImageParse",
        }),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: buildParsePrompt(
                  "screenshot of bank SMS or payment notifications",
                  availableCategories,
                ),
              },
              ...imageParts,
            ],
          },
        ],
        temperature: 0.1,
      }),
    fallbackChains.structured,
  );

  return result.output.expenses;
};
