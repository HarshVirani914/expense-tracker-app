"use client";

import { useState } from "react";
import { getAIInsights } from "@/app/actions/insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSparkles,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Insight {
  title: string;
  description: string;
  severity: "info" | "warning" | "alert";
  actionable?: string;
}

export const AIInsightsWidget = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await getAIInsights();
      setInsights(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load insights",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "alert":
        return {
          icon: <IconAlertCircle className="w-5 h-5" />,
          iconClassName: "text-red-600 dark:text-red-400",
          badgeVariant: "destructive" as const,
        };
      case "warning":
        return {
          icon: <IconAlertTriangle className="w-5 h-5" />,
          iconClassName: "text-yellow-600 dark:text-yellow-500",
          badgeVariant: "secondary" as const,
        };
      default:
        return {
          icon: <IconInfoCircle className="w-5 h-5" />,
          iconClassName: "text-blue-600 dark:text-blue-400",
          badgeVariant: "secondary" as const,
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              AI Spending Insights
            </CardTitle>
            <CardDescription>
              Personalized insights based on your spending patterns
            </CardDescription>
          </div>
          <Button
            onClick={handleLoadInsights}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading
              ? "Analyzing..."
              : insights.length > 0
                ? "Refresh"
                : "Analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <IconSparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered insights about your spending habits and patterns
            </p>
            <Button onClick={handleLoadInsights} size="sm" className="gap-2">
              <IconSparkles className="w-4 h-4" />
              Generate Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const config = getSeverityConfig(insight.severity);
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className={`shrink-0 mt-0.5 ${config.iconClassName}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-tight">
                        {insight.title}
                      </h4>
                      <Badge
                        variant={config.badgeVariant}
                        className="capitalize whitespace-nowrap"
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <div className="pt-2 mt-2 border-t">
                        <p className="text-xs font-medium flex items-start gap-1.5">
                          <span className="text-base">💡</span>
                          <span className="flex-1 text-muted-foreground">
                            {insight.actionable}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
