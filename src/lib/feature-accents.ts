import { cn } from "@/lib/utils";

export type FeatureAccent = {
  /** Tabler / SVG icon */
  icon: string;
  /** Icon tile background */
  iconBg: string;
  iconBgHover: string;
  /** Mobile bottom nav label + icon when active */
  navActive: string;
  /** Sliding pill under active tab */
  indicatorBg: string;
  /** “More” grid tile when route is active */
  tileActive: string;
  /** Featured row (e.g. AI) default + hover */
  tileFeatured: string;
  tileFeaturedHover: string;
  /** Large blurred wash behind the main column (light / dark tuned) */
  pageAmbientBlob: string;
  /** Mild gradient for hero strips and summary cards */
  pageHeroTint: string;
};

export const featureAccents = {
  home: {
    icon: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/15 dark:bg-violet-400/12",
    iconBgHover:
      "group-hover:bg-violet-500/25 dark:group-hover:bg-violet-400/18",
    navActive: "text-violet-600 dark:text-violet-400",
    indicatorBg: "bg-violet-500/14 dark:bg-violet-400/16",
    tileActive:
      "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/15 dark:border-violet-400/35 dark:bg-violet-400/8 dark:ring-violet-400/12",
    tileFeatured:
      "border-violet-500/30 bg-violet-500/6 dark:border-violet-400/25 dark:bg-violet-400/8",
    tileFeaturedHover:
      "hover:bg-violet-500/11 dark:hover:bg-violet-400/12",
    pageAmbientBlob:
      "bg-violet-500/[0.13] dark:bg-violet-400/[0.11]",
    pageHeroTint:
      "bg-linear-to-br from-violet-500/[0.11] via-violet-500/[0.04] to-background dark:from-violet-400/[0.14] dark:via-violet-400/[0.05]",
  },
  expenses: {
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/15 dark:bg-emerald-400/12",
    iconBgHover:
      "group-hover:bg-emerald-500/25 dark:group-hover:bg-emerald-400/18",
    navActive: "text-emerald-600 dark:text-emerald-400",
    indicatorBg: "bg-emerald-500/14 dark:bg-emerald-400/16",
    tileActive:
      "border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/15 dark:border-emerald-400/35 dark:bg-emerald-400/8 dark:ring-emerald-400/12",
    tileFeatured:
      "border-emerald-500/30 bg-emerald-500/6 dark:border-emerald-400/25 dark:bg-emerald-400/8",
    tileFeaturedHover:
      "hover:bg-emerald-500/11 dark:hover:bg-emerald-400/12",
    pageAmbientBlob:
      "bg-emerald-500/[0.12] dark:bg-emerald-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-emerald-500/[0.10] via-emerald-500/[0.035] to-background dark:from-emerald-400/[0.13] dark:via-emerald-400/[0.045]",
  },
  accounts: {
    icon: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-500/15 dark:bg-sky-400/12",
    iconBgHover: "group-hover:bg-sky-500/25 dark:group-hover:bg-sky-400/18",
    navActive: "text-sky-600 dark:text-sky-400",
    indicatorBg: "bg-sky-500/14 dark:bg-sky-400/16",
    tileActive:
      "border-sky-500/40 bg-sky-500/10 ring-1 ring-sky-500/15 dark:border-sky-400/35 dark:bg-sky-400/8 dark:ring-sky-400/12",
    tileFeatured:
      "border-sky-500/30 bg-sky-500/6 dark:border-sky-400/25 dark:bg-sky-400/8",
    tileFeaturedHover: "hover:bg-sky-500/11 dark:hover:bg-sky-400/12",
    pageAmbientBlob: "bg-sky-500/[0.12] dark:bg-sky-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-sky-500/[0.10] via-sky-500/[0.035] to-background dark:from-sky-400/[0.13] dark:via-sky-400/[0.045]",
  },
  categories: {
    icon: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/15 dark:bg-amber-400/12",
    iconBgHover:
      "group-hover:bg-amber-500/25 dark:group-hover:bg-amber-400/18",
    navActive: "text-amber-600 dark:text-amber-400",
    indicatorBg: "bg-amber-500/14 dark:bg-amber-400/16",
    tileActive:
      "border-amber-500/40 bg-amber-500/10 ring-1 ring-amber-500/15 dark:border-amber-400/35 dark:bg-amber-400/8 dark:ring-amber-400/12",
    tileFeatured:
      "border-amber-500/30 bg-amber-500/6 dark:border-amber-400/25 dark:bg-amber-400/8",
    tileFeaturedHover:
      "hover:bg-amber-500/11 dark:hover:bg-amber-400/12",
    pageAmbientBlob:
      "bg-amber-500/[0.11] dark:bg-amber-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-amber-500/[0.10] via-amber-500/[0.035] to-background dark:from-amber-400/[0.12] dark:via-amber-400/[0.045]",
  },
  contacts: {
    icon: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/15 dark:bg-rose-400/12",
    iconBgHover: "group-hover:bg-rose-500/25 dark:group-hover:bg-rose-400/18",
    navActive: "text-rose-600 dark:text-rose-400",
    indicatorBg: "bg-rose-500/14 dark:bg-rose-400/16",
    tileActive:
      "border-rose-500/40 bg-rose-500/10 ring-1 ring-rose-500/15 dark:border-rose-400/35 dark:bg-rose-400/8 dark:ring-rose-400/12",
    tileFeatured:
      "border-rose-500/30 bg-rose-500/6 dark:border-rose-400/25 dark:bg-rose-400/8",
    tileFeaturedHover: "hover:bg-rose-500/11 dark:hover:bg-rose-400/12",
    pageAmbientBlob: "bg-rose-500/[0.11] dark:bg-rose-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-rose-500/[0.10] via-rose-500/[0.035] to-background dark:from-rose-400/[0.12] dark:via-rose-400/[0.045]",
  },
  groups: {
    icon: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/15 dark:bg-blue-400/12",
    iconBgHover: "group-hover:bg-blue-500/25 dark:group-hover:bg-blue-400/18",
    navActive: "text-blue-600 dark:text-blue-400",
    indicatorBg: "bg-blue-500/14 dark:bg-blue-400/16",
    tileActive:
      "border-blue-500/40 bg-blue-500/10 ring-1 ring-blue-500/15 dark:border-blue-400/35 dark:bg-blue-400/8 dark:ring-blue-400/12",
    tileFeatured:
      "border-blue-500/30 bg-blue-500/6 dark:border-blue-400/25 dark:bg-blue-400/8",
    tileFeaturedHover: "hover:bg-blue-500/11 dark:hover:bg-blue-400/12",
    pageAmbientBlob: "bg-blue-500/[0.11] dark:bg-blue-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-blue-500/[0.10] via-blue-500/[0.035] to-background dark:from-blue-400/[0.12] dark:via-blue-400/[0.045]",
  },
  analytics: {
    icon: "text-fuchsia-600 dark:text-fuchsia-400",
    iconBg: "bg-fuchsia-500/15 dark:bg-fuchsia-400/12",
    iconBgHover:
      "group-hover:bg-fuchsia-500/25 dark:group-hover:bg-fuchsia-400/18",
    navActive: "text-fuchsia-600 dark:text-fuchsia-400",
    indicatorBg: "bg-fuchsia-500/14 dark:bg-fuchsia-400/16",
    tileActive:
      "border-fuchsia-500/40 bg-fuchsia-500/10 ring-1 ring-fuchsia-500/15 dark:border-fuchsia-400/35 dark:bg-fuchsia-400/8 dark:ring-fuchsia-400/12",
    tileFeatured:
      "border-fuchsia-500/30 bg-fuchsia-500/6 dark:border-fuchsia-400/25 dark:bg-fuchsia-400/8",
    tileFeaturedHover:
      "hover:bg-fuchsia-500/11 dark:hover:bg-fuchsia-400/12",
    pageAmbientBlob:
      "bg-fuchsia-500/[0.11] dark:bg-fuchsia-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-fuchsia-500/[0.10] via-fuchsia-500/[0.035] to-background dark:from-fuchsia-400/[0.12] dark:via-fuchsia-400/[0.045]",
  },
  budgets: {
    icon: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/15 dark:bg-teal-400/12",
    iconBgHover: "group-hover:bg-teal-500/25 dark:group-hover:bg-teal-400/18",
    navActive: "text-teal-600 dark:text-teal-400",
    indicatorBg: "bg-teal-500/14 dark:bg-teal-400/16",
    tileActive:
      "border-teal-500/40 bg-teal-500/10 ring-1 ring-teal-500/15 dark:border-teal-400/35 dark:bg-teal-400/8 dark:ring-teal-400/12",
    tileFeatured:
      "border-teal-500/30 bg-teal-500/6 dark:border-teal-400/25 dark:bg-teal-400/8",
    tileFeaturedHover: "hover:bg-teal-500/11 dark:hover:bg-teal-400/12",
    pageAmbientBlob: "bg-teal-500/[0.11] dark:bg-teal-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-teal-500/[0.10] via-teal-500/[0.035] to-background dark:from-teal-400/[0.12] dark:via-teal-400/[0.045]",
  },
  recurring: {
    icon: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500/15 dark:bg-orange-400/12",
    iconBgHover:
      "group-hover:bg-orange-500/25 dark:group-hover:bg-orange-400/18",
    navActive: "text-orange-600 dark:text-orange-400",
    indicatorBg: "bg-orange-500/14 dark:bg-orange-400/16",
    tileActive:
      "border-orange-500/40 bg-orange-500/10 ring-1 ring-orange-500/15 dark:border-orange-400/35 dark:bg-orange-400/8 dark:ring-orange-400/12",
    tileFeatured:
      "border-orange-500/30 bg-orange-500/6 dark:border-orange-400/25 dark:bg-orange-400/8",
    tileFeaturedHover:
      "hover:bg-orange-500/11 dark:hover:bg-orange-400/12",
    pageAmbientBlob:
      "bg-orange-500/[0.11] dark:bg-orange-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-orange-500/[0.10] via-orange-500/[0.035] to-background dark:from-orange-400/[0.12] dark:via-orange-400/[0.045]",
  },
  ai: {
    icon: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/15 dark:bg-indigo-400/12",
    iconBgHover:
      "group-hover:bg-indigo-500/25 dark:group-hover:bg-indigo-400/18",
    navActive: "text-indigo-600 dark:text-indigo-400",
    indicatorBg: "bg-indigo-500/14 dark:bg-indigo-400/16",
    tileActive:
      "border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/15 dark:border-indigo-400/35 dark:bg-indigo-400/8 dark:ring-indigo-400/12",
    tileFeatured:
      "border-indigo-500/30 bg-indigo-500/6 dark:border-indigo-400/25 dark:bg-indigo-400/8",
    tileFeaturedHover:
      "hover:bg-indigo-500/11 dark:hover:bg-indigo-400/12",
    pageAmbientBlob:
      "bg-indigo-500/[0.12] dark:bg-indigo-400/[0.10]",
    pageHeroTint:
      "bg-linear-to-br from-indigo-500/[0.10] via-indigo-500/[0.035] to-background dark:from-indigo-400/[0.13] dark:via-indigo-400/[0.045]",
  },
} as const satisfies Record<string, FeatureAccent>;

export type FeatureAccentId = keyof typeof featureAccents;

const pathMatchers: { prefix: string; id: FeatureAccentId }[] = [
  { prefix: "/ai", id: "ai" },
  { prefix: "/analytics", id: "analytics" },
  { prefix: "/recurring", id: "recurring" },
  { prefix: "/budgets", id: "budgets" },
  { prefix: "/categories", id: "categories" },
  { prefix: "/contacts", id: "contacts" },
  { prefix: "/groups", id: "groups" },
  { prefix: "/accounts", id: "accounts" },
  { prefix: "/expenses", id: "expenses" },
  { prefix: "/dashboard", id: "home" },
];

export const normalizePath = (pathname: string): string => {
  const path = pathname.split("?")[0] ?? "/";
  if (path === "" || path === "/") return "/";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
};

export const getFeatureAccentForPath = (pathname: string): FeatureAccent => {
  const path = normalizePath(pathname);
  if (path === "/") return featureAccents.home;

  for (const { prefix, id } of pathMatchers) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return featureAccents[id];
    }
  }
  return featureAccents.home;
};

export const getFeatureAccentByHref = (href: string): FeatureAccent =>
  getFeatureAccentForPath(href);

/** Active nav link: dashboard matches `/` and `/dashboard`. */
export const isRouteActive = (pathname: string, href: string): boolean => {
  const path = normalizePath(pathname);
  if (href === "/dashboard" || href === "/") {
    return path === "/" || path === "/dashboard";
  }
  const h = href.split("?")[0] ?? "";
  return path === h || path.startsWith(`${h}/`);
};

export const getAccentIconTileClass = (accent: FeatureAccent): string =>
  cn(
    "flex shrink-0 rounded-xl transition-colors",
    accent.iconBg,
    accent.icon,
    accent.iconBgHover,
  );
