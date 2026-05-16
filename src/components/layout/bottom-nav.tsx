"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import {
  IconAddressBook,
  IconBuildingBank,
  IconCategory2,
  IconChartBar,
  IconChartPie,
  IconDotsVertical,
  IconHome,
  IconMessageChatbot,
  IconPlus,
  IconReceipt,
  IconRepeat,
  IconUsers,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type NavItem = {
  id: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: "link" | "action";
};

const mainNavItems: NavItem[] = [
  {
    id: 0,
    href: "/dashboard",
    icon: IconHome,
    label: "Home",
    type: "link",
  },
  {
    id: 1,
    href: "/expenses",
    icon: IconReceipt,
    label: "Expenses",
    type: "link",
  },
  {
    id: 2,
    href: "",
    icon: IconPlus,
    label: "Create",
    type: "action",
  },
  {
    id: 3,
    href: "/groups",
    icon: IconUsers,
    label: "Groups",
    type: "link",
  },
  {
    id: 4,
    href: "",
    icon: IconDotsVertical,
    label: "More",
    type: "action",
  },
];

const moreNavItems = [
  {
    href: "/accounts",
    label: "Accounts",
    icon: IconBuildingBank,
  },
  {
    href: "/contacts",
    label: "Contacts",
    icon: IconAddressBook,
  },
  {
    href: "/categories",
    label: "Categories",
    icon: IconCategory2,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: IconChartBar,
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: IconChartPie,
  },
  {
    href: "/recurring",
    label: "Recurring",
    icon: IconRepeat,
  },
  {
    href: "/ai",
    label: "AI",
    icon: IconMessageChatbot,
  },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
      }
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const active = useMemo(() => {
    const index = mainNavItems.findIndex(
      (item) => item.type === "link" && isActive(item.href),
    );
    return index !== -1 ? index : 0;
  }, [isActive]);

  const [manualActive, setManualActive] = useState<number | null>(null);
  const currentActive = manualActive !== null ? manualActive : active;

  useEffect(() => {
    const updateIndicator = () => {
      if (btnRefs.current[currentActive] && containerRef.current) {
        const btn = btnRefs.current[currentActive];
        const container = containerRef.current;
        if (!btn) return;
        const btnRect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setIndicatorStyle({
          width: btnRect.width,
          left: btnRect.left - containerRect.left,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [currentActive]);

  const handleItemClick = (index: number, item: NavItem) => {
    setManualActive(index);
    setTimeout(() => setManualActive(null), 300);
    if (item.label === "Create") {
      setIsCreateOpen(true);
    } else if (item.label === "More") {
      setIsMoreOpen(true);
    }
  };

  return (
    <>
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 sm:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          ref={containerRef}
          className="relative flex items-center justify-between bg-background/95 backdrop-blur-md shadow-xl rounded-full px-2 py-2 border border-border"
        >
          {mainNavItems.map((item, index) => {
            const IconComponent = item.icon;
            const isItemActive = item.type === "link" && isActive(item.href);

            if (item.type === "link") {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  ref={(el) => {
                    btnRefs.current[index] = el;
                  }}
                  onClick={() => handleItemClick(index, item)}
                  className={cn(
                    "relative flex flex-col items-center justify-center flex-1 px-3 py-2.5 text-sm font-medium transition-colors rounded-full",
                    isItemActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className="z-10">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 z-10">{item.label}</span>
                </Link>
              );
            }

            // Action buttons (Create, More)
            return (
              <button
                key={item.id}
                ref={(el) => {
                  btnRefs.current[index] = el;
                }}
                onClick={() => handleItemClick(index, item)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 px-3 py-2.5 text-sm font-medium transition-colors rounded-full",
                  item.label === "Create"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="z-10">
                  {item.label === "Create" ? (
                    <div className="rounded-full bg-primary p-2 shadow-lg">
                      <IconComponent className="h-5 w-5 text-primary-foreground" />
                    </div>
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>
                {item.label !== "Create" && (
                  <span className="text-xs mt-1 z-10">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Sliding Active Indicator */}
          <motion.div
            animate={indicatorStyle}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-1.5 bottom-1.5 rounded-full bg-primary/10 dark:bg-primary/20"
          />
        </div>
      </nav>

      {/* Create Drawer */}
      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DrawerContent aria-describedby="create-drawer-description">
          <DrawerHeader>
            <DrawerTitle>Create New</DrawerTitle>
            <DrawerDescription id="create-drawer-description">
              Create a new expense or group
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-2">
            <Link
              href="/expenses?create=true"
              onClick={() => setIsCreateOpen(false)}
              className="flex items-center gap-3 rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <IconReceipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Add Expense</p>
                <p className="text-sm text-muted-foreground">
                  Record a new expense
                </p>
              </div>
            </Link>
            <Link
              href="/groups?create=true"
              onClick={() => setIsCreateOpen(false)}
              className="flex items-center gap-3 rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <IconUsers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Create Group</p>
                <p className="text-sm text-muted-foreground">
                  Start a new group
                </p>
              </div>
            </Link>
          </div>
        </DrawerContent>
      </Drawer>

      {/* More Drawer */}
      <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DrawerContent aria-describedby="more-drawer-description">
          <DrawerHeader>
            <DrawerTitle>More Options</DrawerTitle>
            <DrawerDescription id="more-drawer-description">
              Manage your accounts, contacts, categories, analytics, budgets,
              and recurring expenses
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-1">
            {moreNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-4 transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Spacer for fixed nav */}
      <div
        className="h-20 sm:hidden"
        style={{ height: "calc(5rem + env(safe-area-inset-bottom))" }}
      />
    </>
  );
};

export default BottomNav;
