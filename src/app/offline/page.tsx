"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCloudOff, IconRefresh } from "@tabler/icons-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <IconCloudOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
            <CardDescription className="text-base">
              It looks like you&apos;ve lost your internet connection. Some features
              may be limited until you&apos;re back online.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h3 className="font-semibold text-sm">What you can still do:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View previously loaded expenses</li>
              <li>• Browse your dashboard</li>
              <li>• Check group balances</li>
              <li>• View cached account data</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <IconRefresh className="h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Your changes will be automatically synced when you&apos;re back online
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
