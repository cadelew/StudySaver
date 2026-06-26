import { formatCurrency } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function MoneyDisplay({
  amount,
  prefix = "$",
  suffix = "",
  className = "",
}: MoneyDisplayProps) {
  const formatted = formatCurrency(amount).replace("$", "");
  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
