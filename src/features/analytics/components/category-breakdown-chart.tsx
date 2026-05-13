"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { IconChartPie } from "@tabler/icons-react";
import { PieChart, Pie, Label } from "recharts";
import type { CategoryBreakdown } from "../types";
import { formatCurrency } from "@/lib/format";

type CategoryBreakdownChartProps = {
  data: CategoryBreakdown[];
  isLoading?: boolean;
};

export const CategoryBreakdownChart = ({
  data,
  isLoading,
}: CategoryBreakdownChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconChartPie className="h-5 w-5 text-primary" />
            <CardTitle>Category Breakdown</CardTitle>
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
            <IconChartPie className="h-5 w-5 text-primary" />
            <CardTitle>Category Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0);
  }, [data]);

  const chartConfig = data.reduce((config, item, index) => {
    config[item.name.toLowerCase().replace(/\s+/g, "-")] = {
      label: item.name,
      color: item.color || `var(--chart-${(index % 5) + 1})`,
    };
    return config;
  }, {} as ChartConfig);

  const chartData = data.map((item, index) => ({
    category: item.name,
    amount: item.amount,
    fill: item.color || `var(--chart-${(index % 5) + 1})`,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconChartPie className="h-5 w-5 text-primary" />
          <CardTitle>Category Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCurrency(totalAmount)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
