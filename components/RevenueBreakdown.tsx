"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PROJECTED_MONTHS, formatCurrency, sumMonthly, type LineItem } from "@/lib/budget";

const PROJECT_COLORS = ["#F47369", "#E05144", "#F89588", "#737373", "#B83C32", "#FBB9B0"];

type Props = { budget: LineItem[] };

export default function RevenueBreakdown({ budget }: Props) {
  const projects = budget.filter((b) => b.group === "revenue").map((p, i) => ({
    ...p,
    color: PROJECT_COLORS[i % PROJECT_COLORS.length],
    total: sumMonthly(p.monthly),
  }));

  const data = PROJECTED_MONTHS.map((m) => {
    const row: Record<string, number | string> = { month: m };
    for (const p of projects) row[p.label] = p.monthly[m] || 0;
    return row;
  });

  const sorted = [...projects].sort((a, b) => b.total - a.total);
  const total = sorted.reduce((a, p) => a + p.total, 0);
  const peakMonth = PROJECTED_MONTHS.reduce((best, m) => {
    const v = projects.reduce((s, p) => s + (p.monthly[m] || 0), 0);
    return v > best.value ? { month: m, value: v } : best;
  }, { month: PROJECTED_MONTHS[0], value: 0 });

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Revenue by project</h3>
          <p className="text-xs text-ink-500">Rococo Punch slate, May – Dec 2026</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Peak month</div>
          <div className="text-sm font-medium text-ink-900 numeral">
            {peakMonth.month} · {formatCurrency(peakMonth.value, { compact: true })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-56">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
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
                cursor={{ fill: "rgba(200,65,46,0.06)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #EFEFEF", boxShadow: "0 4px 16px rgba(26,22,18,0.06)" }}
                formatter={(v: number, name: string) => [formatCurrency(v), name]}
              />
              {projects.map((p, i) => (
                <Bar
                  key={p.id}
                  dataKey={p.label}
                  stackId="rev"
                  fill={p.color}
                  radius={i === projects.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2">
          {sorted.map((p) => {
            const pct = total ? (p.total / total) * 100 : 0;
            return (
              <li key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: p.color }} />
                    <span className="text-ink-700 truncate">{p.label}</span>
                  </div>
                  <div className="numeral text-ink-900 font-medium shrink-0">
                    {p.total > 0 ? formatCurrency(p.total, { compact: true }) : <span className="text-ink-400">—</span>}
                  </div>
                </div>
                <div className="h-1 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: p.color }}
                  />
                </div>
              </li>
            );
          })}
          <li className="pt-2 mt-2 border-t border-ink-100 flex items-center justify-between text-xs">
            <span className="text-ink-500 font-medium">Total</span>
            <span className="numeral font-semibold text-ink-900">{formatCurrency(total)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
