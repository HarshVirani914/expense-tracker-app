"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import * as React from "react";

/** Matches Tailwind `md:` — desktop sidebar visible from here up. */
const MD_MIN_WIDTH = 768;

const SIDEBAR_COOKIE_RE = /(?:^|; )sidebar_state=(true|false)(?:;|$)/;

type ProtectedSidebarProviderProps = {
  children: React.ReactNode;
};

export const ProtectedSidebarProvider = ({
  children,
}: ProtectedSidebarProviderProps) => {
  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const apply = () => {
      const wide = window.matchMedia(`(min-width: ${MD_MIN_WIDTH}px)`).matches;
      if (!wide) {
        setOpen(false);
        return;
      }
      const match = document.cookie.match(SIDEBAR_COOKIE_RE);
      if (match?.[1] === "true" || match?.[1] === "false") {
        setOpen(match[1] === "true");
        return;
      }
      setOpen(true);
    };
    queueMicrotask(apply);
  }, []);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {children}
    </SidebarProvider>
  );
};
