import { z } from "zod";

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.unknown()),
});

const singleUserMessageSchema = z.object({
  id: z.string(),
  role: z.literal("user"),
  parts: z.array(z.unknown()),
});

export const postRequestBodySchema = z
  .object({
    id: z.string().optional(),
    trigger: z.enum(["submit-message", "regenerate-message"]).optional(),
    messageId: z.string().optional(),
    message: singleUserMessageSchema.optional(),
    messages: z.array(uiMessageSchema).optional(),
  })
  .refine(
    (data) =>
      (Array.isArray(data.messages) && data.messages.length > 0) ||
      data.message !== undefined,
    { message: "Provide non-empty messages or a single user message" },
  );

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
