"use client";

import { useState } from "react";
import type { Calculation } from "@/lib/budget";
import { PROJECTED_MONTHS, BUDGET, formatCurrency } from "@/lib/budget";

type Props = { calc: Calculation };

type Row = {
  label: string;
  values: number[];
  total: number;
  bold?: boolean;
  tone?: "good" | "bad" | "brand" | "muted";
  divider?: boolean;
  indent?: boolean;
};

export default function BudgetTable({ calc }: Props) {
  const [open, setOpen] = useState(false);

  const revItems = BUDGET.filter((b) => b.group === "revenue");
  const cogs = PROJECTED_MONTHS.map((m) => calc.cogs[m] || 0);
  const overhead = PROJECTED_MONTHS.map((m) => calc.overhead[m] || 0);
  const rev = PROJECTED_MONTHS.map((m) => calc.revenue[m] || 0);
  const opProfit = PROJECTED_MONTHS.map((m) => calc.operatingProfit[m] || 0);
  const pool = PROJECTED_MONTHS.map((m) => calc.talentPool[m] || 0);
  const net = PROJECTED_MONTHS.map((m) => calc.netCashFlow[m] || 0);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const rows: Row[] = [
    { label: "Revenue", values: rev, total: sum(rev), bold: true, tone: "good" },
    ...revItems.map((item) => ({
      label: item.label,
      values: PROJECTED_MONTHS.map((m) => item.monthly[m] || 0),
      total: sum(PROJECTED_MONTHS.map((m) => item.monthly[m] || 0)),
      indent: true,
    })),
    { label: "Production (COGS)", values: cogs, total: sum(cogs), divider: true },
    { label: "Overhead", values: overhead, total: sum(overhead) },
    { label: "Operating Profit", values: opProfit, total: sum(opProfit), bold: true, tone: sum(opProfit) >= 0 ? "good" : "bad", divider: true },
    { label: "Talent Pool", values: pool, total: sum(pool), bold: true, tone: "brand" },
    { label: "Company Net", values: net, total: sum(net), bold: true, tone: sum(net) >= 0 ? "good" : "bad", divider: true },
  ];

  return (
    <div className="card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Full monthly breakdown</h3>
          <p className="text-xs text-ink-500">Line-by-line, May – Dec 2026</p>
        </div>
        <div className="text-ink-400 text-sm">{open ? "▾ Hide" : "▸ Show"}</div>
      </button>
      {open ? (
        <div className="overflow-x-auto border-t border-ink-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-500">
                <th className="text-left font-medium px-5 py-2">Line</th>
                {PROJECTED_MONTHS.map((m) => (
                  <th key={m} className="text-right font-medium px-3 py-2 numeral">{m}</th>
                ))}
                <th className="text-right font-medium px-5 py-2 numeral">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className={`${r.divider ? "border-t border-ink-100" : ""} ${r.bold ? "bg-ink-50/60" : ""}`}
                >
                  <td className={`py-2 ${r.indent ? "pl-9 pr-5" : "px-5"} ${r.bold ? "font-semibold text-ink-900" : r.indent ? "text-ink-500" : "text-ink-700"}`}>
                    {r.label}
                  </td>
                  {r.values.map((v, idx) => (
                    <td
                      key={idx}
                      className={`text-right px-3 py-2 numeral ${rowTone(r.tone)} ${r.bold ? "font-medium" : ""} ${r.indent ? "text-ink-500" : ""}`}
                    >
                      {v === 0 ? <span className="text-ink-300">—</span> : formatCurrency(v, { compact: true })}
                    </td>
                  ))}
                  <td className={`text-right px-5 py-2 numeral font-semibold ${rowTone(r.tone)}`}>
                    {formatCurrency(r.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function rowTone(t?: Row["tone"]) {
  switch (t) {
    case "good": return "text-good-600";
    case "bad": return "text-bad-600";
    case "brand": return "text-brand-700";
    case "muted": return "text-ink-500";
    default: return "text-ink-900";
  }
}
