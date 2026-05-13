"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconWifiOff, IconWifi } from "@tabler/icons-react";

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !navigator.onLine;
  });
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setWasOffline(true);
      setIsOffline(false);

      setTimeout(() => {
        setWasOffline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !wasOffline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 p-4 sm:left-auto sm:right-4 sm:w-96">
      <Alert
        variant={isOffline ? "destructive" : "default"}
        className={`${
          isOffline
            ? "bg-destructive/50 border-destructive/20"
            : "bg-green-500/50 border-green-500/20"
        }`}
      >
        {isOffline ? (
          <IconWifiOff className="h-4 w-4" />
        ) : (
          <IconWifi className="h-4 w-4" />
        )}
        <AlertDescription>
          {isOffline
            ? "You're offline. Some features may be limited."
            : "You're back online!"}
        </AlertDescription>
      </Alert>
    </div>
  );
};
