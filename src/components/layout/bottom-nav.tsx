"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AccountFormDialog } from "@/features/accounts/components/account-form-dialog";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import { GroupFormDialog } from "@/features/groups/components/group-form-dialog";
import {
  getAccentIconTileClass,
  getFeatureAccentByHref,
  isRouteActive,
} from "@/lib/feature-accents";
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
  IconUserCircle,
  IconUsers,
  IconWallet,
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

// 4-item nav — clean, thumb-friendly, nothing hidden above the fold
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
    label: "Add",
    type: "action",
  },
  {
    id: 3,
    href: "",
    icon: IconDotsVertical,
    label: "More",
    type: "action",
  },
];

type MoreNavLinkItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
};

type MoreNavSection = {
  title: string;
  items: MoreNavLinkItem[];
};

const moreNavSections: MoreNavSection[] = [
  {
    title: "Smart tools",
    items: [
      {
        href: "/ai",
        label: "AI assistant",
        description: "Ask questions in plain language",
        icon: IconMessageChatbot,
        featured: true,
      },
    ],
  },
  {
    title: "Money & budgets",
    items: [
      {
        href: "/groups",
        label: "Groups",
        description: "Split bills with others",
        icon: IconUsers,
      },
      {
        href: "/accounts",
        label: "Accounts",
        description: "Banks, wallets, and cards",
        icon: IconBuildingBank,
      },
      {
        href: "/budgets",
        label: "Budgets",
        description: "Limits by category",
        icon: IconChartPie,
      },
      {
        href: "/recurring",
        label: "Recurring",
        description: "Scheduled expenses",
        icon: IconRepeat,
      },
      {
        href: "/categories",
        label: "Categories",
        description: "Tags for spending",
        icon: IconCategory2,
      },
    ],
  },
  {
    title: "Insights & people",
    items: [
      {
        href: "/analytics",
        label: "Analytics",
        description: "Trends and breakdowns",
        icon: IconChartBar,
      },
      {
        href: "/contacts",
        label: "Contacts",
        description: "People you split with",
        icon: IconAddressBook,
      },
    ],
  },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const createTriggerRef = useRef<HTMLButtonElement | null>(null);
  const moreTriggerRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  const isActive = useCallback(
    (href: string) => isRouteActive(pathname, href),
    [pathname],
  );

  const isMoreRouteActive = useMemo(
    () =>
      moreNavSections.some((section) =>
        section.items.some((item) => isActive(item.href)),
      ),
    [isActive],
  );

  const active = useMemo(() => {
    const mainIndex = mainNavItems.findIndex(
      (item) => item.type === "link" && isActive(item.href),
    );
    if (mainIndex !== -1) return mainIndex;
    if (isMoreRouteActive) {
      const moreIndex = mainNavItems.findIndex((item) => item.label === "More");
      if (moreIndex !== -1) return moreIndex;
    }
    return 0;
  }, [isActive, isMoreRouteActive]);

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
  }, [currentActive, pathname]);

  const handleItemClick = (index: number, item: NavItem) => {
    setManualActive(index);
    setTimeout(() => setManualActive(null), 300);
    if (item.label === "Add") setIsCreateOpen(true);
    else if (item.label === "More") setIsMoreOpen(true);
  };

  return (
    <>
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          ref={containerRef}
          className={cn(
            "relative isolate flex items-center justify-between overflow-hidden rounded-2xl px-1.5 py-1.5",
            // Dark glass pill — always dark to match the hero card aesthetic
            "border border-white/8 bg-[#080C16]/90",
            "shadow-xl shadow-black/30",
            "supports-backdrop-filter:backdrop-blur-xl",
          )}
        >
          {mainNavItems.map((item, index) => {
            const IconComponent = item.icon;
            const isItemActive = item.type === "link" && isActive(item.href);
            const isAddButton = item.label === "Add";

            if (item.type === "link") {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  ref={(el) => { btnRefs.current[index] = el; }}
                  onClick={() => handleItemClick(index, item)}
                  className={cn(
                    "relative z-10 flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors duration-200",
                    isItemActive
                      ? "text-[#C9993F]"
                      : "text-white/40 hover:text-white/70",
                  )}
                >
                  <IconComponent className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </Link>
              );
            }

            // Add button — gold accent
            if (isAddButton) {
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    btnRefs.current[index] = el;
                    createTriggerRef.current = el;
                  }}
                  onClick={() => handleItemClick(index, item)}
                  className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9993F] shadow-lg shadow-[#C9993F]/25 transition-transform active:scale-95">
                    <IconComponent className="h-5 w-5 text-[#080C16]" />
                  </div>
                </button>
              );
            }

            // More button
            return (
              <button
                key={item.id}
                ref={(el) => {
                  btnRefs.current[index] = el;
                  moreTriggerRef.current = el;
                }}
                onClick={() => handleItemClick(index, item)}
                className={cn(
                  "relative z-10 flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-sm font-medium transition-colors duration-200",
                  isMoreRouteActive ? "text-[#C9993F]" : "text-white/40 hover:text-white/70",
                )}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}

          {/* Sliding active indicator — gold, subtle */}
          <motion.div
            animate={indicatorStyle}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-none absolute top-1.5 bottom-1.5 z-0 rounded-xl bg-[#C9993F]/10"
          />
        </div>
      </nav>

      {/* Create Drawer */}
      <Drawer
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) requestAnimationFrame(() => createTriggerRef.current?.focus());
        }}
      >
        <DrawerContent className="flex max-h-[85dvh] min-h-0 flex-col overflow-hidden">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>Create New</DrawerTitle>
            <DrawerDescription>
              Add an expense, group, account, or contact
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 [-webkit-overflow-scrolling:touch]">
            <div className="space-y-1.5">
              {[
                {
                  icon: IconReceipt,
                  label: "Add expense",
                  desc: "Record a personal or account expense",
                  action: () => { setIsCreateOpen(false); setExpenseDialogOpen(true); },
                },
                {
                  icon: IconUsers,
                  label: "Create group",
                  desc: "Start a group to split bills",
                  action: () => { setIsCreateOpen(false); setGroupDialogOpen(true); },
                },
                {
                  icon: IconUserCircle,
                  label: "Add contact",
                  desc: "Save someone you split with often",
                  action: () => { setIsCreateOpen(false); setContactDialogOpen(true); },
                },
                {
                  icon: IconWallet,
                  label: "Add account",
                  desc: "Track a cash, bank, or card balance",
                  action: () => { setIsCreateOpen(false); setAccountDialogOpen(true); },
                },
              ].map(({ icon: Icon, label, desc, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="group flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-accent active:bg-accent/70"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* More Drawer */}
      <Drawer
        open={isMoreOpen}
        onOpenChange={(open) => {
          setIsMoreOpen(open);
          if (!open) requestAnimationFrame(() => moreTriggerRef.current?.focus());
        }}
      >
        <DrawerContent className="flex max-h-[85dvh] min-h-0 flex-col overflow-hidden">
          <DrawerHeader className="shrink-0 pb-2 text-left">
            <DrawerTitle className="text-lg">Explore</DrawerTitle>
            <DrawerDescription>
              Jump to accounts, insights, and tools
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 [-webkit-overflow-scrolling:touch]">
            <div className="space-y-5">
              {moreNavSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      const accent = getFeatureAccentByHref(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMoreOpen(false)}
                          className={cn(
                            "group relative flex rounded-2xl border border-border/70 bg-card/50 p-3.5 outline-none transition-all",
                            "hover:border-border hover:bg-accent/40 active:scale-[0.98]",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            item.featured && "col-span-2 flex-row items-center gap-4",
                            item.featured && cn(accent.tileFeatured, accent.tileFeaturedHover),
                            active && !item.featured && accent.tileActive,
                            active && item.featured && accent.tileActive,
                            !item.featured && "flex-col gap-2.5",
                          )}
                        >
                          <div
                            className={cn(
                              getAccentIconTileClass(accent),
                              item.featured
                                ? "size-12 items-center justify-center rounded-2xl"
                                : "p-2.5",
                            )}
                            aria-hidden
                          >
                            <Icon className={cn(item.featured ? "size-6" : "size-5")} />
                          </div>
                          <div className={cn("min-w-0 flex-1", !item.featured && "w-full")}>
                            <span className="block text-sm font-semibold leading-tight text-foreground">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Spacer */}
      <div
        className="sm:hidden"
        style={{ height: "calc(5rem + env(safe-area-inset-bottom))" }}
      />

      <ExpenseFormDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />
      <GroupFormDialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen} />
      <ContactFormDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <AccountFormDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
    </>
  );
};

export default BottomNav;
