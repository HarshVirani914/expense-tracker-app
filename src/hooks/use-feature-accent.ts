"use client";

import {
  getFeatureAccentForPath,
  type FeatureAccent,
} from "@/lib/feature-accents";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const useFeatureAccent = (): FeatureAccent => {
  const pathname = usePathname();
  return useMemo(() => getFeatureAccentForPath(pathname), [pathname]);
};
