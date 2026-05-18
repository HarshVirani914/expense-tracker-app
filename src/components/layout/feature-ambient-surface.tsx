"use client";

import { getFeatureAccentForPath } from "@/lib/feature-accents";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";

type FeatureAmbientSurfaceProps = {
  children: ReactNode;
};

export const FeatureAmbientSurface = ({
  children,
}: FeatureAmbientSurfaceProps) => {
  const pathname = usePathname();
  const accent = useMemo(() => getFeatureAccentForPath(pathname), [pathname]);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={cn(
            "absolute -top-36 left-1/2 h-104 w-[min(130%,52rem)] -translate-x-1/2 rounded-[100%] blur-[72px] saturate-150 motion-safe:transition-colors motion-safe:duration-500",
            accent.pageAmbientBlob,
          )}
        />
      </div>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
};
