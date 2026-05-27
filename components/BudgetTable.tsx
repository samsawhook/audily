"use client";

import { useState } from "react";
import type { Calculation, LineItemGroup } from "@/lib/budget";
import { PROJECTED_MONTHS, BUDGET, formatCurrency, sumMonthly } from "@/lib/budget";

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

const groupTotals = (calc: Calculation, group: LineItemGroup) => {
  switch (group) {
    case "revenue": return PROJECTED_MONTHS.map((m) => calc.revenue[m] || 0);
    case "direct": return PROJECTED_MONTHS.map((m) => calc.direct[m] || 0);
    case "overhead": return PROJECTED_MONTHS.map((m) => calc.overhead[m] || 0);
    case "debt": return PROJECTED_MONTHS.map((m) => calc.debt[m] || 0);
  }
};

const groupHeading = (g: LineItemGroup) => ({
  revenue: "Revenue",
  direct: "Direct Expenses",
  overhead: "Overhead",
  debt: "Debt Service",
}[g]);

const groupTone = (g: LineItemGroup): Row["tone"] =>
  g === "revenue" ? "good" : "muted";

export default function BudgetTable({ calc }: Props) {
  const [open, setOpen] = useState(false);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const rows: Row[] = [];
  const groups: LineItemGroup[] = ["revenue", "direct", "overhead", "debt"];
  for (const g of groups) {
    const items = BUDGET.filter((b) => b.group === g);
    const headerValues = groupTotals(calc, g);
    rows.push({
      label: groupHeading(g),
      values: headerValues,
      total: sum(headerValues),
      bold: true,
      tone: groupTone(g),
      divider: g !== "revenue",
    });
    for (const item of items) {
      const vals = PROJECTED_MONTHS.map((m) => item.monthly[m] || 0);
      rows.push({
        label: item.label,
        values: vals,
        total: sumMonthly(item.monthly),
        indent: true,
      });
    }
  }

  const fcf = PROJECTED_MONTHS.map((m) => calc.freeCashFlow[m] || 0);
  rows.push({
    label: "Talent Pool / FCF",
    values: fcf,
    total: sum(fcf),
    bold: true,
    tone: sum(fcf) >= 0 ? "brand" : "bad",
    divider: true,
  });

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
