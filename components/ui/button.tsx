"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring, haptic } from "@/lib/motion";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, onClick, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variants = {
      primary: "bg-primary-600 text-primary-foreground shadow-card hover:bg-primary-700",
      gold: "bg-accent text-accent-foreground shadow-card hover:brightness-[0.97]",
      secondary: "bg-muted text-foreground hover:bg-border",
      ghost: "text-foreground hover:bg-muted",
      destructive: "bg-destructive text-white hover:brightness-95",
      outline: "border border-border text-foreground hover:bg-muted",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-sm",
      lg: "h-14 px-7 text-base",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={spring}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        onClick={(e) => {
          haptic(12);
          onClick?.(e);
        }}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
