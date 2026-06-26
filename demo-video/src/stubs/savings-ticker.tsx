import { formatCurrency } from "@/lib/utils";
import { IconSavings } from "@/components/ui/icons";

interface SavingsTickerProps {
  amount: number;
  label?: string;
  highlight?: boolean;
}

export function SavingsTicker({
  amount,
  label = "found in possible yearly savings",
  highlight,
}: SavingsTickerProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-3xl px-4 py-3.5 ${
        highlight ? "bg-success-50 savings-flash" : "bg-muted"
      }`}
    >
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-success-50 text-success flex items-center justify-center">
        <IconSavings />
      </span>
      <div>
        <p className="text-sm font-bold text-foreground">
          <span className="text-success font-extrabold text-base">
            {formatCurrency(amount)}
          </span>{" "}
          {label}
        </p>
      </div>
    </div>
  );
}
