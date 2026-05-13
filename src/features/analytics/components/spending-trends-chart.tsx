"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { IconTrendingUp } from "@tabler/icons-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import type { SpendingTrend } from "../types";
import { format } from "date-fns";

type SpendingTrendsChartProps = {
  data: SpendingTrend[];
  isLoading?: boolean;
};

const chartConfig = {
  amount: {
    label: "Amount",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const SpendingTrendsChart = ({
  data,
  isLoading,
}: SpendingTrendsChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Spending Trends</CardTitle>
          </div>
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
            <IconTrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Spending Trends</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const isMonthlyData = data.length > 0 && 'month' in data[0];
  
  const formattedData = data.map((item) => ({
    date: isMonthlyData
      ? format(new Date(item.date + "-01"), "MMM yyyy")
      : format(new Date(item.date), "dd MMM"),
    amount: item.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconTrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Spending Trends</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={formattedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (isMonthlyData) {
                  return value.slice(0, 3)
                }
                return value.split(' ')[0]
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
