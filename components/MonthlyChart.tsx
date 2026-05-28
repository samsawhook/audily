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
  const isTpp = calc.mode === "tpp";
  const data = PROJECTED_MONTHS.map((m) => {
    const revenue = calc.revenue[m] || 0;
    const direct = calc.direct[m] || 0;
    const overhead = calc.overhead[m] || 0;
    const debt = calc.debt[m] || 0;
    const salary = calc.salary[m] || 0;
    const tax = calc.employerTax[m] || 0;
    const fcf = calc.preCompFcf[m] || 0;
    const comp = calc.comp[m] || 0;
    const net = calc.companyNet[m] || 0;
    const baseRevenue = baseline?.revenue[m] || 0;
    const scenarioRevenue = Math.max(0, revenue - baseRevenue);
    return {
      month: m,
      baseRevenue, scenarioRevenue,
      direct, overhead, debt, salary, tax,
      fcf, comp, net,
    };
  });

  const compLabel = isTpp ? "TPP" : "Salary+Tax";
  const compColor = isTpp ? "#3F7A4A" : "#F47369";

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Monthly Revenue, Expenses & {compLabel}</h3>
          <p className="text-xs text-ink-500">Jun – Dec 2026 (projected)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-500" /> Revenue</span>
          {baseline ? <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-300" /> What-if</span> : null}
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-paper-300" /> Direct</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-paper-400" /> Overhead</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ink-400" /> Debt</span>
          {!isTpp ? (
            <>
              <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-brand-300" /> Salary</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-ink-700" /> Tax</span>
            </>
          ) : null}
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-ink-400" /> FCF</span>
          <span className="flex items-center gap-1.5" style={{ color: compColor }}>
            <span className="h-0.5 w-3" style={{ background: compColor }} /> {compLabel}
          </span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="#EFEFEF" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#737373" />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#737373"
              tickFormatter={(v) => formatCurrency(v, { compact: true })}
            />
            <Tooltip
              cursor={{ fill: "rgba(244,115,105,0.06)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #EFEFEF", boxShadow: "0 4px 16px rgba(15,15,15,0.06)" }}
              formatter={(value: number, name: string) => [formatCurrency(value, { signed: name === "FCF" }), name]}
            />
            <Bar dataKey="baseRevenue" stackId="rev" name="Revenue" fill="#F47369" radius={[0, 0, 0, 0]} />
            <Bar dataKey="scenarioRevenue" stackId="rev" name="What-if" fill="#F89588" radius={[6, 6, 0, 0]} />
            <Bar dataKey="direct" stackId="exp" name="Direct" fill="#D6D6D6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="overhead" stackId="exp" name="Overhead" fill="#B8B8B8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="debt" stackId="exp" name="Debt" fill="#737373" radius={isTpp ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
            {!isTpp ? (
              <Bar dataKey="salary" stackId="exp" name="Salary" fill="#F89588" radius={[0, 0, 0, 0]} />
            ) : null}
            {!isTpp ? (
              <Bar dataKey="tax" stackId="exp" name="Tax" fill="#2D2D2D" radius={[6, 6, 0, 0]} />
            ) : null}
            <Line
              type="monotone"
              dataKey="fcf"
              name="FCF"
              stroke="#737373"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 2.5, fill: "#737373" }}
            />
            <Line
              type="monotone"
              dataKey="comp"
              name={compLabel}
              stroke={compColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: compColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
