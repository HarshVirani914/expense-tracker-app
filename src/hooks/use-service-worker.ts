"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

export const useServiceWorker = () => {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const isSupported = typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    process.env.NODE_ENV === "production";
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const hasRegistered = useRef(false);

  const registerServiceWorker = useCallback(async () => {
    if (hasRegistered.current) return;
    hasRegistered.current = true;

    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      setRegistration(reg);

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
              toast.info("Update available! Refresh to get the latest version.");
            }
          });
        }
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }, []);

  useEffect(() => {
    if (isSupported && !hasRegistered.current) {
      void registerServiceWorker();
    }
  }, [isSupported, registerServiceWorker]);

  const updateServiceWorker = async () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  const unregisterServiceWorker = async () => {
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        setRegistration(null);
        toast.success("Service worker unregistered");
      }
    }
  };

  return {
    registration,
    isSupported,
    updateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
  };
};
