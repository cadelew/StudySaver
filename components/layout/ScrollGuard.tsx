"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/** Clears stray scroll locks left by modals, voice UI, or HMR. */
export function ScrollGuard() {
  const pathname = usePathname();

  React.useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
    body.style.touchAction = "";
    body.style.paddingRight = "";
    html.style.overflow = "";
    html.style.touchAction = "";
  }, [pathname]);

  return null;
}
