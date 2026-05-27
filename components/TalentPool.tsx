"use client";

import { useEffect, useMemo, useState } from "react";
import type { Calculation, PoolBase } from "@/lib/budget";
import { PROJECTED_MONTHS, formatCurrency, formatPercent } from "@/lib/budget";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  calc: Calculation;
  poolPercent: number;
  setPoolPercent: (v: number) => void;
  poolBase: PoolBase;
  setPoolBase: (v: PoolBase) => void;
};

const SHARE_KEY = "audily.myShare.v1";

const baseLabel = (b: PoolBase): string => ({
  gross: "Gross Profit (Revenue − Production)",
  operating: "Operating Profit (Revenue − Production − Overhead)",
}[b]);

export default function TalentPool({
  calc, poolPercent, setPoolPercent, poolBase, setPoolBase,
}: Props) {
  const [myShareRaw, setMyShareRaw] = useState<string>("");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(SHARE_KEY);
      if (v) setMyShareRaw(v);
    } catch {}
  }, []);

  const myShareFraction = useMemo(() => {
    const n = parseFloat(myShareRaw);
    if (Number.isFinite(n) && n > 0 && n <= 100) return n / 100;
    return null;
  }, [myShareRaw]);

  const saveShare = (v: string) => {
    setMyShareRaw(v);
    try { localStorage.setItem(SHARE_KEY, v); } catch {}
  };
  const clearShare = () => {
    setMyShareRaw("");
    setRevealed(false);
    try { localStorage.removeItem(SHARE_KEY); } catch {}
  };

  const monthlyData = PROJECTED_MONTHS.map((m) => ({
    month: m,
    pool: calc.talentPool[m] || 0,
  }));

  const monthsWithPool = monthlyData.filter((d) => d.pool > 0).length;
  const equalShare = calc.talentPoolTotal / 3;
  const myProjection = myShareFraction != null ? calc.talentPoolTotal * myShareFraction : null;
  const myMonthly = myShareFraction != null && monthsWithPool > 0
    ? (calc.talentPoolTotal * myShareFraction) / monthsWithPool
    : null;

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
            Talent Profit Pool
            <span className="chip bg-brand-100 text-brand-700">Private shares</span>
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            {formatPercent(poolPercent)} of {baseLabel(poolBase)}, split among 3 members
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/40 border border-brand-200/60 p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand-700 font-semibold">Total pool — May–Dec 2026</div>
        <div className="mt-1 flex items-baseline gap-3">
          <div className="numeral text-3xl font-semibold text-brand-700">
            {formatCurrency(calc.talentPoolTotal)}
          </div>
          <div className="text-xs text-ink-500">
            {calc.talentPoolTotal > 0
              ? `≈ ${formatCurrency(equalShare, { compact: true })} if split evenly`
              : "No surplus — pool is $0"}
          </div>
        </div>

        <div className="mt-3 h-20">
          <ResponsiveContainer>
            <BarChart data={monthlyData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="#8b8b9c" />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(127,71,255,0.08)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid #eeeef1", padding: "4px 8px" }}
                formatter={(v: number) => [formatCurrency(v), "Pool"]}
              />
              <Bar dataKey="pool" fill="#7f47ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-ink-100 p-3 text-center">
            <div className="h-8 w-8 mx-auto rounded-full bg-ink-100 flex items-center justify-center text-ink-500 text-xs font-semibold">
              {String.fromCharCode(65 + i)}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-500">Member {String.fromCharCode(65 + i)}</div>
            <div className="numeral text-sm text-ink-300 select-none mt-0.5" style={{ filter: "blur(4px)" }}>
              ${equalShare.toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-ink-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-ink-900">Calculate my share</div>
            <div className="text-[11px] text-ink-500">Stored locally on this device — never shared</div>
          </div>
          {myShareRaw ? (
            <button
              onClick={clearShare}
              className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-2"
            >
              clear
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={myShareRaw}
              onChange={(e) => saveShare(e.target.value)}
              placeholder="e.g. 33.3"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 pr-8 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400 numeral"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">%</span>
          </div>
          <button
            onClick={() => setRevealed((r) => !r)}
            disabled={myShareFraction == null}
            className="rounded-lg bg-ink-900 px-3 py-2 text-xs font-medium text-white hover:bg-ink-800 disabled:opacity-40"
          >
            {revealed ? "Hide" : "Reveal"}
          </button>
        </div>
        {myShareFraction != null ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-ink-50 p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-500">My projected total</div>
              <div className={`numeral text-xl font-semibold ${revealed ? "text-ink-900" : "text-ink-300"}`}
                   style={!revealed ? { filter: "blur(6px)" } : undefined}>
                {formatCurrency(myProjection ?? 0)}
              </div>
            </div>
            <div className="rounded-lg bg-ink-50 p-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-500">My avg / paying month</div>
              <div className={`numeral text-xl font-semibold ${revealed ? "text-ink-900" : "text-ink-300"}`}
                   style={!revealed ? { filter: "blur(6px)" } : undefined}>
                {formatCurrency(myMonthly ?? 0)}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 pt-4 border-t border-ink-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-ink-900">Pool calculation</div>
          <div className="text-[11px] text-ink-500">visible to everyone</div>
        </div>
        <label className="block text-[11px] text-ink-500 mb-1">Share of base ({formatPercent(poolPercent)})</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={poolPercent}
          onChange={(e) => setPoolPercent(parseFloat(e.target.value))}
          className="w-full accent-brand-600"
        />
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {([
            ["gross", "Gross profit"],
            ["operating", "Operating profit"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setPoolBase(k)}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                poolBase === k
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
