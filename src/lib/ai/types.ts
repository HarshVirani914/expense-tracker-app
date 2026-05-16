import { z } from "zod";

export const ExpenseParseSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  description: z.string(),
  date: z.iso.datetime(),
  type: z.enum(["EXPENSE", "INCOME"]),
  confidence: z.number().min(0).max(1),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "OTHER"]).optional(),
});

export type ExpenseParse = z.infer<typeof ExpenseParseSchema>;
