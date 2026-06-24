"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { IconSavings } from "@/components/ui/icons";

interface SavingsTickerProps {
  amount: number;
  label?: string;
  highlight?: boolean;
}

export function SavingsTicker({ amount, label = "found in possible yearly savings", highlight }: SavingsTickerProps) {
  const [displayed, setDisplayed] = React.useState(0);
  const targetRef = React.useRef(amount);

  React.useEffect(() => {
    targetRef.current = amount;
    const start = displayed;
    const end = amount;
    const duration = 800;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [amount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`flex items-center gap-3 rounded-3xl px-4 py-3.5 ${
        highlight ? "bg-success-50 savings-flash" : "bg-muted"
      } transition-colors duration-300`}
    >
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-success-50 text-success flex items-center justify-center">
        <IconSavings />
      </span>
      <div>
        <p className="text-sm font-bold text-foreground">
          <span className="text-success font-extrabold text-base">{formatCurrency(displayed)}</span>{" "}
          {label}
        </p>
      </div>
    </div>
  );
}
