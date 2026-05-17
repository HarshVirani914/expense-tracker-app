"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCalendarEvent } from "@tabler/icons-react";
import { useUpcomingRecurringExpenses } from "../hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export const UpcomingRecurringWidget = () => {
  const { upcoming, isLoading } = useUpcomingRecurringExpenses(7);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <IconCalendarEvent className="h-5 w-5 shrink-0 text-primary" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-20" />
        </div>
      </Card>
    );
  }

  if (!upcoming || upcoming.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconCalendarEvent className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg">Upcoming Recurring</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            No recurring expenses due in the next 7 days
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCalendarEvent className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg">Upcoming Recurring</h3>
          </div>
          <Badge>{upcoming.length}</Badge>
        </div>

        <div className="space-y-3">
          {upcoming.map((item) => (
            <div
              key={item.recurringExpense.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: item.recurringExpense.category.color,
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.recurringExpense.category.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.daysUntil === 0
                      ? "Due today"
                      : item.daysUntil === 1
                        ? "Due tomorrow"
                        : `Due in ${item.daysUntil} days`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ₹{item.recurringExpense.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.dueDate), "MMM dd")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
