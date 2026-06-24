"use client";

import * as React from "react";

interface MoneyDisplayProps {
  amount: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function MoneyDisplay({ amount, prefix = "$", suffix = "", className = "", duration = 600 }: MoneyDisplayProps) {
  const [displayed, setDisplayed] = React.useState(0);

  React.useEffect(() => {
    const start = 0;
    const end = amount;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [amount, duration]);

  return (
    <span className={className}>
      {prefix}{displayed.toLocaleString()}{suffix}
    </span>
  );
}
