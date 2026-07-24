import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ServiceWorkerProvider } from "@/providers/service-worker-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmDialogProvider } from "@/components/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

// Revolut pairs Aeonik display with Inter body — Manrope is the closest
// open geometric grotesk, so: Inter for UI, Manrope for display numbers.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7F8" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "PocketPulse - Expense Tracker",
    template: "%s | PocketPulse",
  },
  description:
    "A modern Progressive Web App for tracking expenses, managing budgets, and monitoring financial health across all your devices",
  applicationName: "PocketPulse",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PocketPulse",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "PocketPulse",
    title: "PocketPulse - Expense Tracker",
    description:
      "Track expenses, manage budgets, and monitor your financial health",
  },
  twitter: {
    card: "summary",
    title: "PocketPulse - Expense Tracker",
    description:
      "Track expenses, manage budgets, and monitor your financial health",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        inter.variable,
        manrope.variable,
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ThemeProvider>
            <ServiceWorkerProvider>
              <QueryProvider>
                <TooltipProvider>
                  <ConfirmDialogProvider>
                    {children}
                    <Toaster richColors />
                  </ConfirmDialogProvider>
                </TooltipProvider>
              </QueryProvider>
            </ServiceWorkerProvider>
          </ThemeProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
