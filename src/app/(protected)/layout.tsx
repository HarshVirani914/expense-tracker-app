import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FeatureAmbientSurface } from "@/components/layout/feature-ambient-surface";
import { OfflineIndicator } from "@/components/layout/offline-indicator";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { UserButton } from "@clerk/nextjs";
import { ProtectedSidebarProvider } from "@/components/layout/protected-sidebar-provider";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";
import Image from "next/image";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedSidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <FeatureAmbientSurface>
          <header className="flex h-16 shrink-0 items-center gap-2 border-0 md:border-b px-4">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 hidden md:block"
            />
            <div className="flex items-center justify-between flex-1 gap-2">
              <div className="flex items-center justify-start rounded-lg w-auto h-auto md:hidden -ml-5">
                <Image
                  src="/logo.png"
                  alt="PocketPulse"
                  width={100}
                  height={32}
                  priority
                  className="w-auto h-auto"
                />
              </div>
              <div className="flex items-center gap-2 md:hidden ml-auto">
                <ThemeSwitcher variant="compact" align="end" />
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8 rounded-lg",
                    },
                  }}
                />
              </div>
            </div>
          </header>
          <main className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-4 p-4 pt-6 pb-44 md:pb-6 overscroll-y-contain">
            {children}
          </main>
        </FeatureAmbientSurface>
      </SidebarInset>
      <BottomNav />
      <OfflineIndicator />
      <InstallPrompt />
    </ProtectedSidebarProvider>
  );
}
