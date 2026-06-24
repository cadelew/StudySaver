"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { MATERIAL_TYPE_ICONS } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import type { CourseMaterial } from "@/lib/types";

interface MaterialCardProps {
  material: CourseMaterial;
  index: number;
}

const TYPE_LABELS: Record<string, string> = {
  textbook: "Textbook",
  access_code: "Access Code",
  lab_manual: "Lab Manual",
  calculator: "Calculator",
  software: "Software",
  other: "Other",
};

export function MaterialCard({ material, index }: MaterialCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const TypeIcon = MATERIAL_TYPE_ICONS[material.type] || MATERIAL_TYPE_ICONS.other;
  const typeLabel = TYPE_LABELS[material.type] || TYPE_LABELS.other;
  const hasOptions = material.options && material.options.length > 0;

  return (
    <div
      className="rounded-2xl bg-white border border-gray-100 shadow-card overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
            <TypeIcon />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                {material.title}
              </h3>
              <Badge variant={material.required ? "danger" : "outline"} className="flex-shrink-0">
                {material.required ? "Required" : "Optional"}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge variant="default">{typeLabel}</Badge>
              {material.edition && (
                <Badge variant="outline">{material.edition} ed.</Badge>
              )}
              {material.isbn && (
                <span className="text-[10px] text-muted-foreground font-mono">ISBN {material.isbn}</span>
              )}
            </div>
          </div>
        </div>

        {/* Best option highlight */}
        {material.best_option && (
          <div className="mt-3 flex items-center justify-between bg-success-50 rounded-xl px-3 py-2.5">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Best option</p>
              <p className="text-sm font-semibold text-foreground">{material.best_option}</p>
              {material.best_price_range && (
                <p className="text-xs text-success font-bold">{material.best_price_range}</p>
              )}
            </div>
            {material.savings_estimate !== undefined && material.savings_estimate > 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">Save ~</p>
                <p className="text-base font-extrabold text-success">
                  {formatCurrency(material.savings_estimate)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        {material.warning && (
          <div className="mt-2 flex gap-2 bg-accent-50 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 flex-shrink-0 text-[#9A7B33] mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
            </svg>
            <p className="text-xs text-[#9A7B33] leading-relaxed">{material.warning}</p>
          </div>
        )}

        {/* Expand/collapse options */}
        {hasOptions && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 w-full flex items-center justify-between text-xs text-primary-600 font-medium py-1"
          >
            <span>{expanded ? "Hide" : "Show"} all options</span>
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Options list */}
      {expanded && hasOptions && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {material.options!.map((opt, i) => (
            <div key={i} className={`px-4 py-3 ${opt.recommended ? "bg-primary-50/50" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {opt.recommended && <span className="text-xs text-primary-600">★</span>}
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{opt.price_range}</span>
              </div>
              <div className="flex gap-4 mt-1">
                <p className="text-xs text-success">{opt.pros}</p>
                {opt.cons && <p className="text-xs text-muted-foreground">{opt.cons}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
