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

const MEMBER_COLORS = ["#7f47ff", "#6f23ff", "#9e76ff"];

export default function TalentPool({ calc, members, setMembers }: Props) {
  const pool = calc.freeCashFlowTotal;
  const distributions = useMemo(() => distributePool(pool, members), [pool, members]);
  const shareSum = members.reduce((a, m) => a + Math.max(0, m.share), 0);
  const balanced = Math.round(shareSum) === 100;

  const updateShare = (id: string, share: number) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, share } : m)));
  };

  const monthlyData = PROJECTED_MONTHS.map((m) => ({
    month: m,
    fcf: calc.freeCashFlow[m] || 0,
  }));

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Talent Profit Pool</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            100% of free cash flow, distributed pro rata
          </p>
        </div>
        <button
          onClick={() => setMembers(DEFAULT_MEMBERS)}
          className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-2"
        >
          reset 40/30/30
        </button>
      </div>

      {/* Pool size */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/40 border border-brand-200/60 p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand-700 font-semibold">
          Annual pool — May–Dec 2026
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <div className={`numeral text-3xl font-semibold ${pool >= 0 ? "text-brand-700" : "text-bad-600"}`}>
            {formatCurrency(pool, { signed: true })}
          </div>
          {pool < 0 ? (
            <div className="text-xs text-bad-600">FCF is negative — no pool to distribute</div>
          ) : null}
        </div>
        <div className="mt-3 h-20">
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="#8b8b9c" />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(127,71,255,0.08)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #eeeef1", padding: "4px 8px" }}
                formatter={(v: number) => [formatCurrency(v, { signed: true }), "FCF"]}
              />
              <Bar dataKey="fcf" radius={[4, 4, 0, 0]}>
                {monthlyData.map((d, i) => (
                  <Cell key={i} fill={d.fcf >= 0 ? "#7f47ff" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Members */}
      <div className="mt-4 space-y-3">
        {distributions.map((d, idx) => {
          const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
          const initials = d.member.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
          return (
            <div key={d.member.id} className="rounded-xl border border-ink-100 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ background: color }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-900 truncate">{d.member.name}</div>
                    <div className="text-[11px] text-ink-500 numeral">
                      {(d.normalizedShare * 100).toFixed(1)}%
                      {Math.round(d.member.share) !== Math.round(d.normalizedShare * 100)
                        ? <span className="text-ink-400"> (raw {d.member.share}%)</span>
                        : null}
                    </div>
                  </div>
                </div>
                <div className={`numeral text-base font-semibold shrink-0 ${pool >= 0 ? "text-ink-900" : "text-bad-600"}`}>
                  {formatCurrency(d.amount)}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={d.member.share}
                  onChange={(e) => updateShare(d.member.id, parseInt(e.target.value, 10))}
                  className="flex-1 accent-brand-600"
                  style={{ accentColor: color }}
                />
                <div className="numeral text-xs text-ink-700 w-10 text-right">{d.member.share}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2">
        <span className="text-xs text-ink-500">Total of raw shares</span>
        <span className={`numeral text-xs font-semibold ${balanced ? "text-good-600" : "text-ink-500"}`}>
          {shareSum}%
          {balanced ? " ✓" : <span className="text-ink-400 font-normal ml-1">(normalized to 100% for math)</span>}
        </span>
      </div>
    </div>
  );
}
