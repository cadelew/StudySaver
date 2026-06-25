"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

export interface BurnStrategy {
  title: string;
  detail: string;
  estimated_value?: number;
}

interface BurnStrategyListProps {
  strategies: BurnStrategy[];
}

export function BurnStrategyList({ strategies }: BurnStrategyListProps) {
  if (strategies.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {strategies.map((s, i) => (
        <motion.div
          key={`${s.title}-${i}`}
          variants={staggerItem}
          className="rounded-2xl bg-card border border-border/60 shadow-card p-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                {typeof s.estimated_value === "number" && s.estimated_value > 0 && (
                  <span className="text-sm font-bold text-success flex-shrink-0">
                    ${Math.round(s.estimated_value)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {s.detail}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
