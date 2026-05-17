export const MONEY_SEMANTICS = {
  currency: "Amounts are shown in Indian rupees (INR).",

  glossaryDialogTitle: "What these numbers mean",
  glossaryAccountBalance:
    "Adds up the balances you set up for each account in PocketPulse, based on income and expenses you added. It only matches your real bank balance if you keep updating the app yourself.",
  glossaryMonthCashflow:
    "This month’s income minus this month’s spending. It is not the same number as your total across accounts.",
  glossaryGroupIoU:
    "In a group, this shows how bills were split and who still owes whom. It does not move money in your bank, and it does not change your personal account totals unless you add that separately.",

  heroAccountSubtitle:
    "Total from your accounts in the app (INR). Based on what you entered—not an automatic link to your bank.",
  heroMonthNetSubtitle:
    "This month’s income minus spending (INR). Only for this month—not your full account total.",
  heroMonthNetChip: "So far this month",

  statsThisMonthExpenses:
    "Spending you logged this month (INR), including your share of group expenses.",
  statsThisMonthIncome: "Income you logged this month (INR).",
  statsTopCategory:
    "Where you spent the most this month (INR), based on what you logged.",

  accountsCardSubtitle:
    "Balance for each account (INR), from the income and expenses you linked to it.",

  groupBalancesCardTitle: "Group balances",
  groupBalancesCardSubtitle:
    "Per group: are you owed money or do you owe others after splits (INR)? This is about shared bills, not cash in your bank.",

  outstandingDebtsSubtitle:
    "Money still to sort out across groups (INR). Marking paid in the app keeps a record—it does not take money from your bank.",

  analyticsPageSubtitle:
    "Spending you logged for the dates you picked (INR). The charts help you see patterns—not a live bank feed.",

  insightsAnalyticsSubtitle:
    "Based on expenses you logged for this period (INR). Not a bank or card statement.",

  chartSpendingTrendsSubtitle:
    "How your logged spending adds up over time for the range you chose (INR).",
  chartCategorySubtitle:
    "Share of your logged spending by category for this period (INR).",
  chartMonthlyComparisonSubtitle: "Your logged spending by month (INR).",

  groupYourBalanceInGroup:
    "In this group, after splits: are you up or down (INR)? This is only about the group—not your PocketPulse account total.",
  groupMemberBalancesSubtitle:
    "How each person stands with you in this group (INR). Stays open until someone marks amounts settled.",
  groupPaidVsShareCaptions:
    "Paid is what you put toward bills. Your share is your part of the split. The net is the difference for you in this group.",
  groupAmountsYouOweInGroup: "You owe (in this group)",
  groupAmountsOwedToYou: "They owe you (in this group)",
  groupAllBalancesCaption:
    "Each person in this group after splits (INR). Plus: others owe them more overall. Minus: they owe others more overall.",
  groupSuggestedSettlementsCaption:
    "Suggested payments between people. “Simplify” means fewer steps to settle the same amounts.",
  groupSimplifyFooter:
    "No one’s total owed changes—only who pays whom can be combined into fewer payments.",
  groupActivityCardSubtitle:
    "Full bill (INR). Below it: how the bill was split and who paid.",
} as const;
