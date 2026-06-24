"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts";

export interface SpendPoint {
  label: string;
  value: number;
}

interface SpendChartProps {
  data: SpendPoint[];
  height?: number;
}

export function SpendChart({ data, height = 130 }: SpendChartProps) {
  return (
    <div style={{ width: "100%", height }} className="pointer-events-none select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F8A6B" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#4F8A6B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#5B6660" }}
            dy={6}
            interval="preserveStartEnd"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4F8A6B"
            strokeWidth={2.5}
            fill="url(#spendFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
