"use client";

import { useEffect, type ReactNode } from "react";
import { useServiceWorker } from "@/hooks/use-service-worker";

type ServiceWorkerProviderProps = {
  children: ReactNode;
};

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: SyncManager;
}

export const ServiceWorkerProvider = ({
  children,
}: ServiceWorkerProviderProps) => {
  const { isSupported } = useServiceWorker();

  useEffect(() => {
    if (isSupported && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          const regWithSync =
            registration as ServiceWorkerRegistrationWithSync;
          if (regWithSync.sync) {
            return regWithSync.sync
              .register("sync-expenses")
              .catch((error: unknown) => {
                console.error(
                  "Background sync registration failed:",
                  error instanceof Error ? error.message : String(error)
                );
              });
          }
        })
        .catch((error: unknown) => {
          console.error(
            "Service Worker ready failed:",
            error instanceof Error ? error.message : String(error)
          );
        });
    }
  }, [isSupported]);

  return <>{children}</>;
};
