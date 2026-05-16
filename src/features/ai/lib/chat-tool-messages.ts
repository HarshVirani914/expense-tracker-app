const TOOL_ACTIVITY_ROTATION_MESSAGES = [
  "Peeking at your ledger…",
  "Following the rupee trail…",
  "Dusting off recent transactions…",
  "Connecting the spending dots…",
  "Almost there — lining things up…",
  "Taking a quiet look at your categories…",
  "Summoning the numbers (politely)…",
];

const randomIndex = (max: number) => Math.floor(Math.random() * max);

export const pickRandomToolActivityMessage = () =>
  TOOL_ACTIVITY_ROTATION_MESSAGES[
    randomIndex(TOOL_ACTIVITY_ROTATION_MESSAGES.length)
  ] ?? TOOL_ACTIVITY_ROTATION_MESSAGES[0];

const DONE_BY_PREFIX: Record<string, string> = {
  queryExpenses: "Got your latest expenses.",
  getSpendingSummary: "Spending snapshot is in.",
  createExpense: "Expense saved.",
  updateExpense: "Update applied.",
  deleteExpense: "Entry removed.",
};

const extractToolPrefix = (partType: string) => {
  if (!partType.startsWith("tool-")) {
    return "";
  }
  return partType.slice("tool-".length);
};

export const getToolDoneLabel = (partType: string) => {
  const key = extractToolPrefix(partType);
  return DONE_BY_PREFIX[key] ?? "All set.";
};

export const isToolPartRunning = (state: string | undefined) =>
  state === "input-streaming" ||
  state === "input-available" ||
  state === "call" ||
  state === "partial-call";

export const messageHasInFlightToolWork = (
  parts: ReadonlyArray<{ type: string; state?: string }>,
) =>
  parts.some((p) => {
    if (p.type === "dynamic-tool" || p.type.startsWith("tool-")) {
      return isToolPartRunning(p.state);
    }
    return false;
  });
