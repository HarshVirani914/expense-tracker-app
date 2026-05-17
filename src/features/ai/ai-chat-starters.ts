export type AIChatStarter = {
  label: string;
  prompt: string;
};

export const AI_CHAT_STARTERS: AIChatStarter[] = [
  {
    label: "Monthly summary",
    prompt:
      "Give me a concise summary of my spending this month, including my top categories.",
  },
  {
    label: "Biggest expenses",
    prompt: "What were my largest expenses this month? List them with amounts.",
  },
  {
    label: "Log lunch",
    prompt: "I spent ₹150 on lunch today. Help me add this as an expense.",
  },
  {
    label: "Save money",
    prompt:
      "Based on typical budgeting habits, suggest three practical ways I could reduce spending.",
  },
];
