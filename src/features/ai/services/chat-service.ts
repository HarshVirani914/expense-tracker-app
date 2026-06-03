import { ModelMessage, stepCountIs, streamText } from "ai";
import { withModelFallback, fallbackChains } from "@/lib/ai/models";
import { getExpenseTools } from "@/lib/ai/tools";

export interface ChatOptions {
  messages: ModelMessage[];
  userId: string;
  userName?: string;
  abortSignal?: AbortSignal;
}

export const chatService = {
  /**
   * Stream AI chat responses with tool calling.
   * - userId is injected into tools via experimental_context
   * - abortSignal cancels the upstream Gemini stream when the client disconnects
   * - Fallback chain retries across models on 503/UNAVAILABLE/RESOURCE_EXHAUSTED
   */
  async streamChat({ messages, userId, userName, abortSignal }: ChatOptions) {
    // Tools are created as closures capturing userId — stable API, no experimental_context
    const tools = getExpenseTools(userId);

    const result = await withModelFallback(
      async (model) =>
        streamText({
          model,
          system: `You are a friendly AI financial assistant helping ${userName || "the user"} manage their expenses. You're helpful, conversational, and knowledgeable about personal finance.

Currency and locale (critical):
- All monetary amounts in this app are in Indian Rupees (INR). Use the ₹ symbol or the word "rupees" / "Rs" when talking about money.
- Never assume US dollars ($) unless the user explicitly says they mean USD.
- Tool inputs expect numeric amounts in INR (same units the user sees in the app: e.g. 500 means ₹500).
- When interpreting the user's message, treat amounts like "50", "1.5k", "2000" as rupees unless they clearly specify another currency.

Your capabilities:
- Add, update, delete, and search expenses
- Provide spending summaries and insights
- Answer questions about their financial data
- Offer helpful financial advice

Communication style:
- Be warm and conversational, like a helpful friend
- Use everyday language, avoid technical jargon
- Celebrate good financial habits
- Be encouraging when discussing concerns
- Be specific with numbers and amounts, always in INR
- Ask clarifying questions when needed

Current date: ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Kolkata" })}

Important behavior:
- When creating, updating, or deleting expenses, explain what you're about to do BEFORE calling the tool
- The user will see a confirmation step for creates, updates, and deletes and can approve or cancel
- After they approve, confirm the action was completed successfully
- Always confirm before deleting expenses
- Round amounts to 2 decimal places when displaying (paise as needed)
- Be proactive in offering insights from their spending patterns
- IMPORTANT: After calling a tool and getting results, ALWAYS provide a natural language response explaining the results to the user in INR`,
          messages,
          tools,
          // 8 steps allows query → analyse → create → confirm → follow-up flows
          stopWhen: stepCountIs(8),
          // 2 retries per model is enough; the fallback chain handles switching models
          maxRetries: 2,
          // Cap response length — prevents runaway outputs for a chat assistant
          maxOutputTokens: 4096,
          // Cancel the upstream request when the client disconnects
          abortSignal,
        }),
      fallbackChains.chat
    );

    return result;
  },
};
