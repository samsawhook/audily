"use client";

import { useMemo } from "react";
import type { Calculation, Member } from "@/lib/budget";
import {
  PROJECTED_MONTHS,
  DEFAULT_MEMBERS,
  distributePool,
  formatCurrency,
} from "@/lib/budget";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  calc: Calculation;
  members: Member[];
  setMembers: (m: Member[]) => void;
};

const MEMBER_COLORS = ["#F47369", "#B83C32", "#737373"];

export default function TalentPool({ calc, members, setMembers }: Props) {
  const isTpp = calc.mode === "tpp";
  const pool = calc.compTotal; // member-facing total (TPP or salary; never tax)
  const tppDistributions = useMemo(() => distributePool(pool, members), [pool, members]);
  const shareSum = members.reduce((a, m) => a + Math.max(0, m.share), 0);
  const balanced = Math.round(shareSum) === 100;

  const updateShare = (id: string, share: number) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, share } : m)));
  };
  const updateNetSalary = (id: string, netSalary: number) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, netSalary } : m)));
  };

  const monthlyData = PROJECTED_MONTHS.map((m) => ({
    month: m,
    comp: calc.comp[m] || 0,
  }));

  const title = isTpp ? "Talent Profit Pool" : "Salary Distribution";
  const subtitle = isTpp
    ? "Losses carry forward · pool is never negative · distributed pro rata"
    : "Each member's actual monthly net pay — edit to update everywhere";
  const sizeLabel = isTpp ? "Annual TPP — May–Dec 2026" : "Annual net salaries — May–Dec 2026";

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => setMembers(DEFAULT_MEMBERS)}
          className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-2"
        >
          reset defaults
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-paper-100 border border-brand-100 p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand-700 font-semibold">
          {sizeLabel}
        </div>
        <div className="mt-1 flex items-baseline gap-3 flex-wrap">
          <div className="numeral text-3xl font-bold text-brand-700">
            {formatCurrency(pool)}
          </div>
          {isTpp && calc.yearEndCarry < 0 ? (
            <div className="text-xs text-bad-600">
              {formatCurrency(calc.yearEndCarry)} deficit carries to 2027
            </div>
          ) : null}
          {!isTpp ? (
            <div className="text-xs text-ink-500">
              + {formatCurrency(calc.totalEmployerTax)} taxes (employer + employee)
            </div>
          ) : null}
        </div>
        <div className="mt-3 h-20">
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="#737373" />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(244,115,105,0.08)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #EFEFEF", padding: "4px 8px" }}
                formatter={(v: number) => [formatCurrency(v), isTpp ? "TPP" : "Salary"]}
              />
              <Bar dataKey="comp" name={isTpp ? "TPP" : "Salary"} radius={[4, 4, 0, 0]}>
                {monthlyData.map((d, i) => (
                  <Cell key={i} fill={d.comp > 0 ? "#F47369" : "#EFEFEF"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {members.map((m, idx) => {
          const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
          const initials = m.name.split(" ").map((p) => p[0]).join("").slice(0, 2);

          if (isTpp) {
            const d = tppDistributions[idx];
            return (
              <div key={m.id} className="rounded-xl border border-paper-300 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">{m.name}</div>
                      <div className="text-[11px] text-ink-500 numeral">
                        {(d.normalizedShare * 100).toFixed(1)}%
                        {Math.round(m.share) !== Math.round(d.normalizedShare * 100)
                          ? <span className="text-ink-400"> (raw {m.share}%)</span>
                          : null}
                      </div>
                    </div>
                  </div>
                  <div className="numeral text-base font-semibold shrink-0 text-ink-900">
                    {formatCurrency(d.amount)}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={m.share}
                    onChange={(e) => updateShare(m.id, parseInt(e.target.value, 10))}
                    className="flex-1"
                    style={{ accentColor: color }}
                  />
                  <div className="numeral text-xs text-ink-700 w-10 text-right">{m.share}%</div>
                </div>
              </div>
            );
          }

          // Salary mode
          const annual = (m.netSalary || 0) * 12;
          return (
            <div key={m.id} className="rounded-xl border border-paper-300 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-900 truncate">{m.name}</div>
                    <div className="text-[11px] text-ink-500 numeral">
                      {formatCurrency(annual)} annualized
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-ink-400">$</span>
                  <input
                    type="number"
                    step={0.01}
                    min={0}
                    value={Number.isFinite(m.netSalary) ? m.netSalary : 0}
                    onChange={(e) => updateNetSalary(m.id, parseFloat(e.target.value) || 0)}
                    className="w-24 text-right numeral text-base font-semibold rounded-md border border-paper-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
                    aria-label={`${m.name} monthly net salary`}
                  />
                  <span className="text-[11px] text-ink-400">/mo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isTpp ? (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-paper-100 px-3 py-2">
          <span className="text-xs text-ink-500">Total of raw shares</span>
          <span className={`numeral text-xs font-semibold ${balanced ? "text-good-600" : "text-ink-500"}`}>
            {shareSum}%
            {balanced ? " ✓" : <span className="text-ink-400 font-normal ml-1">(normalized for math)</span>}
          </span>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-paper-100 px-3 py-2">
          <span className="text-xs text-ink-500">Sum of monthly net salaries</span>
          <span className="numeral text-xs font-semibold text-ink-900">
            {formatCurrency(members.reduce((a, m) => a + (m.netSalary || 0), 0))}/mo
          </span>
        </div>
      )}
    </div>
  );
}
