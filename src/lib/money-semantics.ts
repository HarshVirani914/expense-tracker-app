export const MONEY_SEMANTICS = {
  currency: "All amounts are in Indian rupees (INR).",

  dashboardIntro:
    "Ledger balances use what you recorded in PocketPulse; monthly totals are cashflow for the calendar month; group figures are split-bill IOUs until settled.",

  glossaryDialogTitle: "What these numbers mean",
  glossaryAccountBalance:
    "Total from your PocketPulse accounts (debits/credits you logged). It is not a live bank balance unless you keep accounts exactly in sync.",
  glossaryMonthCashflow:
    "Income minus expenses for the current calendar month. This is period cashflow, not the same as your total account balance.",
  glossaryGroupIoU:
    "Who owes whom inside each group after splits. These are social debts until you record a settlement. They do not change your account ledger automatically.",

  heroAccountSubtitle:
    "Ledger total from your accounts (INR), from recorded transactions—not a bank API sync.",
  heroMonthNetSubtitle:
    "This month: income minus expenses (INR). Cashflow for the period, not your account total.",

  statsThisMonthExpenses: "Recorded expenses this month (INR), including your share of group bills.",
  statsThisMonthIncome: "Recorded income this month (INR).",
  statsTopCategory: "Largest spending category this month (INR) from your recorded expenses.",

  accountsCardSubtitle: "Per-account balances from linked income and expenses (INR).",

  groupBalancesCardTitle: "Group balances",
  groupBalancesCardSubtitle:
    "Your net position per group after splits (INR). Split-bill IOUs, not money in your bank.",

  outstandingDebtsSubtitle:
    "Unsettled amounts across groups (INR). Recording a settlement tracks payment; it does not move bank money.",

  analyticsPageSubtitle:
    "Recorded spending for the selected period (INR). Charts show category and time patterns—not live bank balances.",

  insightsAnalyticsSubtitle:
    "Derived from recorded expenses in this period (INR). Not a bank statement.",

  chartSpendingTrendsSubtitle: "Total recorded expenses over time for the selected range (INR).",
  chartCategorySubtitle: "Share of recorded spending by category for this period (INR).",
  chartMonthlyComparisonSubtitle: "Recorded spending for recent months (INR).",
} as const;
