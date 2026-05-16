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
  IconSparkles,
  IconReceipt,
  IconFileUpload,
  IconBulb,
  IconChartBar,
  IconMessageCircle,
} from "@tabler/icons-react";

export default function AIFeaturesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconSparkles className="h-8 w-8 text-purple-500" />
            <h1 className="text-4xl font-bold tracking-tight">AI Assistant</h1>
          </div>
          <p className="text-muted-foreground text-base">
            Chat with your smart financial companion - ask questions, get
            insights, or manage expenses naturally
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden shadow-none">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent" />
          <CardHeader className="relative pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-500/10 p-2">
                <IconMessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base">Natural Conversations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Ask questions naturally: &ldquo;How much did I spend on food last
              month?&rdquo; or &ldquo;Add ₹50 for groceries&rdquo;
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-none">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="relative pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-500/10 p-2">
                <IconChartBar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Smart Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Get personalized spending insights and recommendations on your
              dashboard
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden shadow-none">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent" />
          <CardHeader className="relative pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-500/10 p-2">
                <IconSparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-base">Intelligent Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Search expenses, create transactions, update entries, and analyze
              patterns with AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AIChat />
        </div>

        {/* Coming Soon Features */}
        <div className="space-y-6">
          <Card className="border-2 border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconBulb className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Coming Soon</CardTitle>
              </div>
              <CardDescription>
                More AI-powered features are on the way!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <IconReceipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Receipt Scanning</p>
                  <p className="text-xs text-muted-foreground">
                    Snap a photo of your receipt and let AI extract the details
                    instantly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <IconFileUpload className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Smart Bulk Import</p>
                  <p className="text-xs text-muted-foreground">
                    Upload any expense sheet in any format and AI will parse it
                    for you
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Try asking...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 rounded-lg bg-muted/50 text-sm">
                &ldquo;What were my biggest expenses this month?&rdquo;
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-sm">
                &ldquo;Show all coffee expenses&rdquo;
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-sm">
                &ldquo;Add ₹25 for lunch yesterday&rdquo;
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-sm">
                &ldquo;How can I save more money?&rdquo;
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
