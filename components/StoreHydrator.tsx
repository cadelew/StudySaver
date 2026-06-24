"use client";

import * as React from "react";
import { useStore } from "@/lib/store";

/** Loads persisted user/budget from localStorage after mount to avoid SSR hydration mismatch. */
export function StoreHydrator() {
  const hydrateFromStorage = useStore((s) => s.hydrateFromStorage);

  React.useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return null;
}
