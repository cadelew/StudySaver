"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/ui/toast";
import { StoreHydrator } from "@/components/StoreHydrator";
import { ScrollGuard } from "@/components/layout/ScrollGuard";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    href: "/goals",
    label: "Goals",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    href: "/log",
    label: "",
    icon: () => null,
    isFab: true,
  },
  {
    href: "/deals",
    label: "Deals",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Budget",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 2 2 4-4" />
      </svg>
    ),
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isLogPage = pathname === "/log";

  return (
    <ToastProvider>
      <ScrollGuard />
      <StoreHydrator />
      <main className="pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/85 backdrop-blur-xl border-t border-border/60">
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          {NAV_ITEMS.map((item) => {
            if (item.isFab) {
              return (
                <div key="fab" className="relative -mt-6 flex flex-col items-center">
                  <button
                    onClick={() => router.push("/log")}
                    className={cn(
                      "relative w-14 h-14 rounded-full bg-primary-600 shadow-fab",
                      "flex items-center justify-center",
                      "active:scale-95 transition-transform duration-150",
                      isLogPage && "bg-primary-700"
                    )}
                  >
                    {isLogPage && (
                      <span className="absolute inset-0 rounded-full bg-primary-600 animate-pulse-ring" />
                    )}
                    <svg className="w-6 h-6 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <span className="text-[10px] text-muted-foreground mt-1 font-medium">Log</span>
                </div>
              );
            }

            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 min-w-[48px] py-1 transition-all",
                  isActive ? "text-primary-600" : "text-muted-foreground"
                )}
              >
                {item.icon(isActive)}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </ToastProvider>
  );
}
