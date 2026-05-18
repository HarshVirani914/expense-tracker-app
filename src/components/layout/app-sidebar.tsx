"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  IconChartBar,
  IconChartPie,
  IconLayoutDashboard,
  IconMessageChatbot,
  IconReceipt,
  IconRepeat,
  IconTag,
  IconUserCircle,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getFeatureAccentByHref, isRouteActive } from "@/lib/feature-accents";

const navigation: Array<{
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled: boolean;
  badge?: string;
}> = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
    disabled: false,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: IconReceipt,
    disabled: false,
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: IconWallet,
    disabled: false,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: IconTag,
    disabled: false,
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: IconUserCircle,
    disabled: false,
  },
  {
    name: "Groups",
    href: "/groups",
    icon: IconUsers,
    disabled: false,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: IconChartBar,
    disabled: false,
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: IconChartPie,
    disabled: false,
  },
  {
    name: "Recurring",
    href: "/recurring",
    icon: IconRepeat,
    disabled: false,
  },
  {
    name: "AI",
    href: "/ai",
    icon: IconMessageChatbot,
    disabled: false,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="inset"
      className="z-50"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex items-center justify-center rounded-lg">
                  <Image
                    src="/logo.png"
                    alt="PocketPulse"
                    width={200}
                    height={32}
                    loading="eager"
                    className="w-auto h-auto"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map((item) => {
              const navActive = isRouteActive(pathname, item.href);
              const accent = getFeatureAccentByHref(item.href);
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={navActive}
                    disabled={item.disabled}
                    tooltip={item.name}
                  >
                    <Link
                      href={item.disabled ? "#" : item.href}
                      className={cn(navActive && accent.navActive)}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          navActive
                            ? accent.icon
                            : "text-sidebar-foreground/70 opacity-90 group-hover/menu-button:text-sidebar-foreground",
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge>
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full px-2">
              <ThemeSwitcher variant="default" align="start" />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 rounded-lg",
                  },
                }}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.fullName || "Account"}
                </span>
                <span className="truncate text-xs">
                  {user?.primaryEmailAddress?.emailAddress ||
                    "Manage your profile"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
