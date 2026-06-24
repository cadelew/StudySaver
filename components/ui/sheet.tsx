"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Sheet({ open, onClose, children, title }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-white rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto",
          "animate-slide-up"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          {title && <h2 className="font-semibold text-base mt-2">{title}</h2>}
          <button onClick={onClose} className="ml-auto text-muted-foreground hover:text-foreground mt-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 pb-8">{children}</div>
      </div>
    </div>
  );
}
