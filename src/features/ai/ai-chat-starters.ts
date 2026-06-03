export type AIChatStarter = {
  label: string;
  prompt: string;
  emoji: string;
};

export const AI_CHAT_STARTERS: AIChatStarter[] = [
  {
    emoji: "📊",
    label: "Monthly summary",
    prompt:
      "Give me a concise summary of my spending this month — top categories, total spent, and how it compares to my income.",
  },
  {
    emoji: "💸",
    label: "Biggest expenses",
    prompt: "What were my 5 largest expenses this month? List them with amounts and dates.",
  },
  {
    emoji: "✏️",
    label: "Log an expense",
    prompt: "I spent ₹250 on coffee and snacks today. Help me log this.",
  },
  {
    emoji: "📈",
    label: "Spending trend",
    prompt:
      "How has my spending changed over the last 3 months? Am I spending more or less overall?",
  },
  {
    emoji: "⚠️",
    label: "Budget check",
    prompt:
      "Am I close to or over budget in any category? Show me my current budget health.",
  },
  {
    emoji: "👥",
    label: "Group balances",
    prompt: "Who owes me money and how much do I owe others across all my groups?",
  },
  {
    emoji: "🏷️",
    label: "Category breakdown",
    prompt:
      "Break down my spending by category this month. Which categories am I overspending in?",
  },
  {
    emoji: "💡",
    label: "Save money",
    prompt:
      "Based on my recent spending patterns, suggest 3 practical areas where I could cut back.",
  },
];
