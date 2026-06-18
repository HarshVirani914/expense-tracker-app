import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ServiceWorkerProvider } from "@/providers/service-worker-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmDialogProvider } from "@/components/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const dmMono = DM_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

// Used exclusively for the hero balance number — one serif for editorial luxury
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#080C16" },
  ],
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
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
        dmSans.variable,
        dmMono.variable,
        playfair.variable,
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
