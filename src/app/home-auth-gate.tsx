"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/components/loader";

export const HomeAuthGate = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (userId) {
      router.replace("/dashboard");
      return;
    }
    router.replace("/sign-in");
  }, [isLoaded, userId, router]);

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6"
      role="status"
      aria-live="polite"
      aria-busy={!isLoaded}
      aria-label={isLoaded ? "Redirecting" : "Loading account"}
    >
      <Loader size="lg" text="Loading PocketPulse…" />
    </div>
  );
};
