"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AIChat } from "@/features/ai/components/ai-chat";
import {
  IconBulb,
  IconFileUpload,
  IconReceipt,
  IconSparkles,
} from "@tabler/icons-react";

export default function AIFeaturesPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-6 w-full max-w-4xl mx-auto pb-6">
      <div className="shrink-0 space-y-1">
        <div className="flex items-center gap-2">
          <IconSparkles
            className="h-7 w-7 shrink-0 text-purple-600 dark:text-purple-400"
            aria-hidden
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            AI Assistant
          </h1>
        </div>
        <p className="text-xs text-muted-foreground sm:text-base">
          Chat with your financial assistant. It uses the PocketPulse entries
          you already added (in rupees) to stay on topic. Nothing is changed
          until you confirm in the chat. If something goes wrong, your saved
          data in the app stays the same.
        </p>
      </div>

      <AIChat className="w-full shadow-md" />

      <section
        aria-label="What this assistant can do"
        className="shrink-0 grid gap-4 md:grid-cols-2 md:gap-6"
      >
        <Card className="shadow-none border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              What it can help with
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Stating capabilities up front helps people trust and use the bot
              effectively.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-primary">
              <li>Summarize spending and compare categories or periods</li>
              <li>Search and surface expenses you have already recorded</li>
              <li>Describe new spending so you can log it with guidance</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-none border border-dashed bg-muted/15">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <IconBulb
                className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500"
                aria-hidden
              />
              <CardTitle className="text-base font-semibold">
                Coming later
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Ideas on the roadmap—not in the product yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3 rounded-lg bg-muted/40 p-3">
              <IconReceipt className="h-5 w-5 shrink-0 mt-0.5 opacity-80" />
              <div>
                <p className="font-medium text-foreground">Receipt scanning</p>
                <p className="text-xs sm:text-sm mt-0.5">
                  Capture a receipt and extract line items automatically.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg bg-muted/40 p-3">
              <IconFileUpload className="h-5 w-5 shrink-0 mt-0.5 opacity-80" />
              <div>
                <p className="font-medium text-foreground">Smarter imports</p>
                <p className="text-xs sm:text-sm mt-0.5">
                  Upload messy spreadsheets and let the assistant map columns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
