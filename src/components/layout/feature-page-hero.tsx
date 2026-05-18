"use client";

import { useFeatureAccent } from "@/hooks/use-feature-accent";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FeaturePageHeroProps = {
  children: ReactNode;
  className?: string;
};

export const FeaturePageHero = ({
  children,
  className,
}: FeaturePageHeroProps) => {
  const accent = useFeatureAccent();

  return (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-2xl border border-border/60",
        accent.pageHeroTint,
        className,
      )}
    >
      <div className="relative z-10 min-w-0 w-full">{children}</div>
    </div>
  );
};
