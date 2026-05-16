import { google } from "@ai-sdk/google";
import { LanguageModel } from "ai";
import { logger } from "../logger";

export const models = {
  // Fast, cost-effective for most tasks
  flash: google("gemini-2.5-flash"),

  // Faster, cheaper alternative to flash
  flashLite: google("gemini-2.5-flash-lite"),

  // For structured outputs + tool calling
  flash3: google("gemini-3-flash-preview"),

  // Higher quality responses
  pro: google("gemini-2.5-pro"),

  // Complex reasoning with tools
  pro3: google("gemini-3-pro-preview"),
};

export const defaultModel = models.flash;

/**
 * Fallback chain for when models are experiencing high demand
 * Each array represents models to try in order for a given use case
 */
export const fallbackChains = {
  // For general tasks (insights, parsing, etc.)
  general: [models.flash, models.flashLite],

  // For tool calling and structured outputs
  structured: [models.flash3, models.flash, models.flashLite],

  // For chat/conversational features
  chat: [models.flash3, models.flash, models.flashLite],
};

/**
 * Execute an AI operation with automatic model fallback
 * Tries models in sequence until one succeeds or all fail
 */
export async function withModelFallback<T>(
  operation: (model: LanguageModel) => Promise<T>,
  fallbackChain: LanguageModel[] = fallbackChains.general
): Promise<T> {
  const errors: Error[] = [];

  for (let i = 0; i < fallbackChain.length; i++) {
    const model = fallbackChain[i];
    try {
      return await operation(model);
    } catch (error) {
      errors.push(error as Error);

      // Check if it's a retryable error (503, high demand, rate limit)
      const isRetryable =
        error instanceof Error &&
        (error.message.includes("high demand") ||
          error.message.includes("UNAVAILABLE") ||
          error.message.includes("503") ||
          error.message.includes("rate limit"));

      // If it's not retryable or we're on the last model, throw
      if (!isRetryable || i === fallbackChain.length - 1) {
        // If we tried multiple models, throw an aggregate error
        if (errors.length > 1) {
          throw new Error(
            `All models failed. Last error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
        throw error;
      }

      // Log fallback attempt (in production, use proper logging)
      logger.warn(
        `Model ${i + 1} failed with: ${error instanceof Error ? error.message : "Unknown error"}. Trying fallback model ${i + 2}...`
      );
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("No models available in fallback chain");
}
