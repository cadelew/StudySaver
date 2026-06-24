import * as React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

export function IconSavings({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

export function IconSparkle({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5L12 2z" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
    </svg>
  );
}

export function IconQuestion({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M9.5 9a2.5 2.5 0 014.5 1.5c0 2-2.5 2-2.5 4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg className={cn("w-6 h-6", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconBook({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM4 6c2-1 4-1 6 0s4 1 6 0" />
    </svg>
  );
}

export function IconKey({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="15" r="4" />
      <path strokeLinecap="round" d="M11 12l9-9M16 3h5v5" />
    </svg>
  );
}

export function IconFlask({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M10 3v6l-4 9a2 2 0 001.8 3h8.4a2 2 0 001.8-3l-4-9V3" />
    </svg>
  );
}

export function IconCalculator({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" />
    </svg>
  );
}

export function IconLaptop({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path strokeLinecap="round" d="M2 18h20" />
    </svg>
  );
}

export function IconDocument({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l4 4v12H8zM16 4v4h4" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3-3" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
    </svg>
  );
}

export function IconLightbulb({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 22h4M12 2a6 6 0 00-3 11v1h6v-1a6 6 0 00-3-11z" />
    </svg>
  );
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconScale({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" d="M12 3v18M5 7h14M7 7l-2 5h4L7 7zM17 7l-2 5h4l-2-5z" />
    </svg>
  );
}

export function IconAi({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path strokeLinecap="round" d="M8 8V6a4 4 0 018 0v2M9 14h.01M15 14h.01M8 18h8" />
    </svg>
  );
}

export function GoalInitial({ name, className }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "G";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-primary-foreground font-display font-semibold text-sm",
        className
      )}
    >
      {initial}
    </span>
  );
}

export const MATERIAL_TYPE_ICONS: Record<string, React.ComponentType<IconProps>> = {
  textbook: IconBook,
  access_code: IconKey,
  lab_manual: IconFlask,
  calculator: IconCalculator,
  software: IconLaptop,
  other: IconDocument,
};

export const ONBOARDING_ICONS: Record<string, React.ComponentType<IconProps>> = {
  welcome: IconSparkle,
  name: IconSparkle,
  school: IconBook,
  budget: IconSavings,
  major: IconDocument,
};
