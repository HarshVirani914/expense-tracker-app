"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconX, IconDownload, IconShare } from "@tabler/icons-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  });
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(display-mode: standalone)").matches;
  });

  useEffect(() => {
    const isIOSDevice = isIOS;
    const isInStandalone = isStandalone;

    if (isInStandalone) {
      return;
    }

    if (isIOSDevice) {
      const visitCount = parseInt(
        localStorage.getItem("visitCount") || "0",
        10
      );
      const promptDismissed = localStorage.getItem("installPromptDismissed");

      if (visitCount >= 3 && !promptDismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }

      localStorage.setItem("visitCount", (visitCount + 1).toString());
    } else {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);

        const visitCount = parseInt(
          localStorage.getItem("visitCount") || "0",
          10
        );
        const promptDismissed = localStorage.getItem("installPromptDismissed");

        if (visitCount >= 3 && !promptDismissed) {
          setTimeout(() => setShowPrompt(true), 5000);
        }

        localStorage.setItem("visitCount", (visitCount + 1).toString());
      };

      window.addEventListener("beforeinstallprompt", handler);

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
  }, [isIOS, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (isStandalone) return null;
  if (!showPrompt && !isIOS) return null;
  if (!showPrompt && isIOS) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Install App</CardTitle>
              <CardDescription>
                {isIOS
                  ? "Install PocketPulse for the best experience"
                  : "Install PocketPulse for quick access and offline support"}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-1 -mr-2"
              onClick={handleDismiss}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tap the share button{" "}
                <IconShare className="inline h-4 w-4 mx-1" /> at the bottom of
                your screen, then select <strong>&quot;Add to Home Screen&quot;</strong>{" "}
                from the menu.
              </p>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="w-full"
              >
                Got it
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleInstall} className="flex-1 gap-2">
                <IconDownload className="h-4 w-4" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1"
              >
                Not Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
