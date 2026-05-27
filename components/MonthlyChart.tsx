"use client";

import {
  Bar, ComposedChart, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { Calculation } from "@/lib/budget";
import { PROJECTED_MONTHS, formatCurrency } from "@/lib/budget";

type Props = {
  calc: Calculation;
  baseline?: Calculation;
};

export default function MonthlyChart({ calc, baseline }: Props) {
  const data = PROJECTED_MONTHS.map((m) => {
    const revenue = calc.revenue[m] || 0;
    const opExpenses = (calc.cogs[m] || 0) + (calc.overhead[m] || 0);
    const pool = calc.talentPool[m] || 0;
    const netCashFlow = calc.netCashFlow[m] || 0;
    const baseRevenue = baseline?.revenue[m] || 0;
    const scenarioRevenue = Math.max(0, revenue - baseRevenue);
    return {
      month: m,
      baseRevenue,
      scenarioRevenue,
      opExpenses,
      pool,
      netCashFlow,
    };
  });

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Monthly Revenue, Expenses & Pool</h3>
          <p className="text-xs text-ink-500">May – Dec 2026 (projected)</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-500" /> Revenue</span>
          {baseline ? <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-300" /> What-if</span> : null}
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ink-300" /> Op. expenses</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-700/70" /> Pool</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-good-500" /> Company net</span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="#eeeef1" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#8b8b9c" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#8b8b9c"
              tickFormatter={(v) => formatCurrency(v, { compact: true })}
            />
            <Tooltip
              cursor={{ fill: "rgba(127,71,255,0.06)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #eeeef1", boxShadow: "0 4px 16px rgba(15,15,25,0.06)" }}
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
            <Bar dataKey="baseRevenue" stackId="rev" name="Revenue" fill="#7f47ff" radius={[0, 0, 0, 0]} />
            <Bar dataKey="scenarioRevenue" stackId="rev" name="What-if" fill="#bea7ff" radius={[6, 6, 0, 0]} />
            <Bar dataKey="opExpenses" stackId="exp" name="Op. expenses" fill="#d8d8df" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pool" stackId="exp" name="Talent pool" fill="#5e12eb" fillOpacity={0.7} radius={[6, 6, 0, 0]} />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              name="Company net"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#059669" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
