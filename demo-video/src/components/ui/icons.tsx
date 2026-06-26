import * as React from "react";
import { cn } from "../../lib/utils";

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

export function IconBook({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4zM4 6c2-1 4-1 6 0s4 1 6 0" />
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

export const ONBOARDING_ICONS: Record<string, React.ComponentType<IconProps>> = {
  welcome: IconSparkle,
  name: IconSparkle,
  school: IconBook,
  budget: IconSavings,
  major: IconDocument,
};
