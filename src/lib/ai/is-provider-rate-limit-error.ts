import { APICallError } from "ai";

const matchesRateLimitText = (value: string): boolean => {
  const lower = value.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("resource exhausted") ||
    lower.includes("resource_exhausted") ||
    lower.includes("too many requests") ||
    lower.includes("quota exceeded") ||
    lower.includes("exhausted quota")
  );
};

export const isProviderRateLimitError = (error: unknown): boolean => {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 429) {
      return true;
    }
    if (matchesRateLimitText(error.message)) {
      return true;
    }
    const body = error.responseBody;
    if (typeof body === "string" && matchesRateLimitText(body)) {
      return true;
    }
    return false;
  }

  if (error instanceof Error) {
    return matchesRateLimitText(error.message);
  }

  return false;
};
