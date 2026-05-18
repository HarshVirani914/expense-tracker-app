"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { IconChartBar } from "@tabler/icons-react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import type { MonthlyComparison } from "../types";
import { formatCurrencyCompact, formatCurrency } from "@/lib/format";
import { MONEY_SEMANTICS } from "@/lib/money-semantics";

type MonthlyComparisonChartProps = {
  data: MonthlyComparison[];
  isLoading?: boolean;
};

const chartConfig = {
  current: {
    label: "Spending",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const MonthlyComparisonChart = ({
  data,
  isLoading,
}: MonthlyComparisonChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-primary" />
            <CardTitle>Monthly Comparison</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.chartMonthlyComparisonSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5 text-primary" />
            <CardTitle>Monthly Comparison</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {MONEY_SEMANTICS.chartMonthlyComparisonSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconChartBar className="h-5 w-5 text-primary" />
          <CardTitle>Monthly Comparison</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {MONEY_SEMANTICS.chartMonthlyComparisonSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const parts = value.split(" ");
                return parts[0];
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrencyCompact(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_label, payload) => {
                    const row = payload?.[0]?.payload as
                      | MonthlyComparison
                      | undefined;
                    return row?.month ?? "";
                  }}
                />
              }
            />
            <Bar dataKey="current" fill="var(--color-current)" radius={8} />
          </BarChart>
        </ChartContainer>
        <div className="sr-only">
          <p>Monthly comparison (INR)</p>
          <ul>
            {data.map((row) => (
              <li key={row.month}>
                {row.month}: {formatCurrency(row.current)}
                {row.previous !== undefined
                  ? `, prior ${formatCurrency(row.previous)}`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
