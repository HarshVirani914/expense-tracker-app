"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  IconLayoutDashboard,
  IconReceipt,
  IconWallet,
  IconTag,
  IconUsers,
  IconChartBar,
  IconUserCircle,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import Image from "next/image";

const navigation = [
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
    disabled: true,
    badge: "Soon",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
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
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    disabled={item.disabled}
                    tooltip={item.name}
                  >
                    <Link href={item.disabled ? "#" : item.href}>
                      <Icon />
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
