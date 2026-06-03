"use client";

import { FeaturePageHero } from "@/components/layout/feature-page-hero";
import { AIChat } from "@/features/ai/components/ai-chat";
import { useFeatureAccent } from "@/hooks/use-feature-accent";
import { cn } from "@/lib/utils";
import { IconSparkles } from "@tabler/icons-react";

export default function AIFeaturesPage() {
  const accent = useFeatureAccent();

  return (
    <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-3xl flex-1 flex-col gap-4 pb-4">
      {/* Compact hero — just heading + one-liner */}
      <FeaturePageHero className="p-3.5 sm:p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <IconSparkles
            className={cn("h-6 w-6 shrink-0", accent.icon)}
            aria-hidden
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              AI Assistant
            </h1>
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              Powered by Gemini · knows your expenses · confirms before saving anything
            </p>
          </div>
        </div>
      </FeaturePageHero>

      {/* Chat takes all remaining vertical space */}
      <AIChat className="min-w-0 w-full flex-1 shadow-sm" />
    </div>
  );
}
