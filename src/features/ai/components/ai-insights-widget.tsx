"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  IconBulb,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Insight {
  title: string;
  description: string;
  severity: "info" | "warning" | "alert";
  actionable?: string;
}

const INSIGHTS_STORAGE_VERSION = "v1";

const getInsightsStorageKey = (userId: string) =>
  `pp-ai-spending-insights:${INSIGHTS_STORAGE_VERSION}:${userId}`;

const readCachedInsights = (userId: string): Insight[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(getInsightsStorageKey(userId));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as { insights?: Insight[] };
    return Array.isArray(parsed.insights) ? parsed.insights : [];
  } catch {
    return [];
  }
};

const writeCachedInsights = (userId: string, insights: Insight[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      getInsightsStorageKey(userId),
      JSON.stringify({
        insights,
        cachedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Quota exceeded or private mode
  }
};

const clearCachedInsightsForUser = (userId: string) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(getInsightsStorageKey(userId));
  } catch {
    // noop
  }
};

export const AIInsightsWidget = () => {
  const { user, isLoaded } = useUser();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const userId = user?.id;
    const previousId = previousUserIdRef.current;

    if (previousId !== undefined && userId === undefined) {
      clearCachedInsightsForUser(previousId);
      setInsights([]);
    }

    if (!userId) {
      previousUserIdRef.current = userId;
      return;
    }

    previousUserIdRef.current = userId;

    const cached = readCachedInsights(userId);
    if (cached.length > 0) {
      const frameId = requestAnimationFrame(() => {
        if (previousUserIdRef.current !== userId) {
          return;
        }
        setInsights(cached);
      });
      return () => cancelAnimationFrame(frameId);
    }

    return undefined;
  }, [isLoaded, user?.id]);

  const handleLoadInsights = async () => {
    if (!user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await getAIInsights();
      setInsights(data);
      writeCachedInsights(user.id, data);
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
            disabled={isLoading || !user?.id}
            variant="outline"
            size="sm"
          >
            {isLoading
              ? "Analyzing..."
              : insights.length > 0
                ? "Regenerate"
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
            <Button
              onClick={handleLoadInsights}
              size="sm"
              className="gap-2"
              disabled={!user?.id}
            >
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
                  key={`${insight.title}-${idx}`}
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
                          <IconBulb
                            className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground"
                            aria-hidden
                          />
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
