"use client";

import * as React from "react";

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

// Soft pastel earth-tone background per category
const CATEGORY_BG: Record<string, string> = {
  "Eating Out": "#EAD6CC",
  Groceries: "#DCE5DA",
  Transportation: "#D8E1E4",
  Entertainment: "#E0DCE8",
  "School Supplies": "#F0E4CC",
  Subscriptions: "#ECD8D8",
  Miscellaneous: "#E6E4DA",
};

const CATEGORY_FG: Record<string, string> = {
  "Eating Out": "#9A5B3F",
  Groceries: "#4F8A6B",
  Transportation: "#3E6E7C",
  Entertainment: "#6B5B9A",
  "School Supplies": "#9A7B33",
  Subscriptions: "#A85A5A",
  Miscellaneous: "#5B6660",
};

function Glyph({ category }: { category: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (category) {
    case "Eating Out":
      return <><path {...common} d="M5 3v7M8 3v7M6.5 10v8M16 3c-1.5 1-2 3-2 5s.5 3 2 3v7" /></>;
    case "Groceries":
      return <><path {...common} d="M4 6h15l-1.5 8H7L5 4H3" /><circle cx="8" cy="19" r="1.3" {...common} /><circle cx="16" cy="19" r="1.3" {...common} /></>;
    case "Transportation":
      return <><rect x="4" y="6" width="16" height="10" rx="2" {...common} /><path {...common} d="M4 12h16M8 16v2M16 16v2" /></>;
    case "Entertainment":
      return <><circle cx="12" cy="12" r="8" {...common} /><path {...common} d="M10 9l5 3-5 3z" /></>;
    case "School Supplies":
      return <><path {...common} d="M3 7l9-4 9 4-9 4-9-4z" /><path {...common} d="M7 9v5c0 1.5 2.5 3 5 3s5-1.5 5-3V9" /></>;
    case "Subscriptions":
      return <><rect x="3" y="6" width="18" height="12" rx="2" {...common} /><path {...common} d="M3 10h18" /></>;
    default:
      return <><circle cx="12" cy="12" r="8" {...common} /><path {...common} d="M12 8v4l3 2" /></>;
  }
}

export function CategoryIcon({ category, size = 40, className }: CategoryIconProps) {
  const bg = CATEGORY_BG[category] || "#E6E4DA";
  const fg = CATEGORY_FG[category] || "#5B6660";
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 9999,
        background: bg,
        color: fg,
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        <Glyph category={category} />
      </svg>
    </span>
  );
}

export function categoryBg(category: string): string {
  return CATEGORY_BG[category] || "#E6E4DA";
}
export function categoryFg(category: string): string {
  return CATEGORY_FG[category] || "#5B6660";
}
