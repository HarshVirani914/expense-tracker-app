"use client";

import { useEffect, useState } from "react";
import { IconWifi, IconWifiOff } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const RECONNECT_MS = 4000;

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window === "undefined") return false;
    return !navigator.onLine;
  });
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowReconnect(true);
      setIsOffline(false);
      window.setTimeout(() => {
        setShowReconnect(false);
      }, RECONNECT_MS);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnect(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnect) return null;

  const isReconnect = !isOffline && showReconnect;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-3 pt-3 sm:justify-end sm:px-4 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md gap-3 rounded-2xl border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 sm:max-w-sm",
          "bg-card/95 text-card-foreground supports-backdrop-filter:backdrop-blur-md",
          "ring-1 ring-foreground/6 dark:ring-foreground/8",
          isOffline &&
            "border-destructive/40 bg-destructive/[0.07] dark:border-destructive/50 dark:bg-destructive/[0.14]",
          isReconnect &&
            "border-primary/40 bg-primary/[0.07] dark:border-primary/50 dark:bg-primary/[0.14]",
        )}
        role={isOffline ? "alert" : "status"}
        aria-live={isOffline ? "assertive" : "polite"}
        aria-atomic
      >
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            isOffline &&
              "border-destructive/30 bg-destructive/12 text-destructive dark:border-destructive/40 dark:bg-destructive/20",
            isReconnect &&
              "border-primary/30 bg-primary/12 text-primary dark:border-primary/40 dark:bg-primary/22",
          )}
          aria-hidden
        >
          {isOffline ? (
            <IconWifiOff className="size-5" strokeWidth={2} />
          ) : (
            <IconWifi className="size-5" strokeWidth={2} />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1 pt-0.5">
          <p
            className={cn(
              "text-sm font-semibold leading-tight tracking-tight",
              isOffline ? "text-destructive" : "text-primary",
            )}
          >
            {isOffline ? "No connection" : "Connection restored"}
          </p>
          <p className="text-sm leading-snug text-foreground">
            {isOffline
              ? "Expenses and budgets may not update until you are back online."
              : "You can continue working; data will stay in sync."}
          </p>
        </div>
      </div>
    </div>
  );
};
