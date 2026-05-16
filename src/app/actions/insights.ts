"use server";

import { requireCurrentUser } from "@/lib/auth";
import { generateSpendingInsights } from "@/lib/ai/insights-generator";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

export const getAIInsights = async () => {
  const user = await requireCurrentUser();

  if (!checkRateLimit(user.id, 5)) {
    throw new Error("Rate limit exceeded. Try again in a minute.");
  }

  const insights = await generateSpendingInsights(user.id);

  return insights;
};
