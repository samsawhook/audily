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
    const direct = calc.direct[m] || 0;
    const overhead = calc.overhead[m] || 0;
    const debt = calc.debt[m] || 0;
    const fcf = calc.freeCashFlow[m] || 0;
    const tpp = calc.talentPool[m] || 0;
    const baseRevenue = baseline?.revenue[m] || 0;
    const scenarioRevenue = Math.max(0, revenue - baseRevenue);
    return {
      month: m,
      baseRevenue,
      scenarioRevenue,
      direct,
      overhead,
      debt,
      fcf,
      tpp,
    };
  });

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900 serif">Monthly Revenue, Expenses & TPP</h3>
          <p className="text-xs text-ink-500">May – Dec 2026 (projected)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-500" /> Revenue</span>
          {baseline ? <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-300" /> What-if</span> : null}
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ink-300" /> Direct</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ink-400" /> Overhead</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ink-500" /> Debt</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-accent-400" /> FCF</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-good-500" /> TPP</span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="#EEE9DD" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#8B8270" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#8B8270"
              tickFormatter={(v) => formatCurrency(v, { compact: true })}
            />
            <Tooltip
              cursor={{ fill: "rgba(200,65,46,0.06)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #EEE9DD", boxShadow: "0 4px 16px rgba(26,22,18,0.06)" }}
              formatter={(value: number, name: string) => [formatCurrency(value, { signed: name === "FCF" }), name]}
            />
            <Bar dataKey="baseRevenue" stackId="rev" name="Revenue" fill="#C8412E" radius={[0, 0, 0, 0]} />
            <Bar dataKey="scenarioRevenue" stackId="rev" name="What-if" fill="#E78468" radius={[6, 6, 0, 0]} />
            <Bar dataKey="direct" stackId="exp" name="Direct" fill="#D8D2C2" radius={[0, 0, 0, 0]} />
            <Bar dataKey="overhead" stackId="exp" name="Overhead" fill="#B5AC97" radius={[0, 0, 0, 0]} />
            <Bar dataKey="debt" stackId="exp" name="Debt" fill="#8B8270" radius={[6, 6, 0, 0]} />
            <Line
              type="monotone"
              dataKey="fcf"
              name="FCF"
              stroke="#D9A02C"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 2.5, fill: "#D9A02C" }}
            />
            <Line
              type="monotone"
              dataKey="tpp"
              name="TPP"
              stroke="#3F7A4A"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3F7A4A" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
