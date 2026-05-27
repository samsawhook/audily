"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Calculation } from "@/lib/budget";
import { formatCurrency } from "@/lib/budget";

type Props = { calc: Calculation };

export default function ExpenseBreakdown({ calc }: Props) {
  const slices = [
    { name: "Direct (Rococo Punch)", value: calc.totalDirect, color: "#7f47ff" },
    { name: "Overhead", value: calc.totalOverhead, color: "#9e76ff" },
    { name: "Debt Service", value: calc.totalDebt, color: "#bea7ff" },
  ];
  const total = slices.reduce((a, s) => a + s.value, 0);

  return (
    <div className="card p-5 h-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-ink-900">Where the money goes</h3>
        <p className="text-xs text-ink-500">Operating outflows, May–Dec</p>
      </div>
      <div className="h-56 relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={1}
              stroke="none"
            >
              {slices.map((s) => <Cell key={s.name} fill={s.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #eeeef1" }}
              formatter={(v: number, n: string) => [formatCurrency(v), n]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Total</div>
          <div className="numeral text-xl font-semibold text-ink-900">{formatCurrency(total, { compact: true })}</div>
        </div>
      </div>
      <ul className="mt-2 space-y-1.5">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              <span className="text-ink-700">{s.name}</span>
            </div>
            <div className="numeral text-ink-900 font-medium">
              {formatCurrency(s.value, { compact: true })}
              <span className="ml-2 text-ink-400">{total ? ((s.value / total) * 100).toFixed(0) : 0}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
