"use client";

import type { Calculation, Member } from "@/lib/budget";
import { PROJECTED_MONTHS, computeMemberEarnings, formatCurrency } from "@/lib/budget";

const MEMBER_COLORS = ["#F47369", "#B83C32", "#737373"];

type Props = {
  calc: Calculation;
  members: Member[];
};

export default function EmployeeEarnings({ calc, members }: Props) {
  const earnings = computeMemberEarnings(members, calc.talentPool);

  return (
    <div className="card">
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Earnings by member</h3>
            <p className="text-xs text-ink-500">From TPP after loss carry-forward · run-rate for 2027 in <span className="italic font-medium">Annualized</span></p>
          </div>
          {calc.yearEndCarry < 0 ? (
            <div className="chip bg-bad-500/10 text-bad-600">
              Year-end deficit {formatCurrency(calc.yearEndCarry)} carries to '27
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-ink-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-ink-500 bg-paper-100/60">
              <th className="text-left font-medium px-5 py-2">Member</th>
              {PROJECTED_MONTHS.map((m) => (
                <th key={m} className="text-right font-medium px-3 py-2 numeral">{m}</th>
              ))}
              <th className="text-right font-medium px-3 py-2 numeral border-l border-ink-100">Total</th>
              <th className="text-right font-medium px-3 py-2 numeral">Avg/mo</th>
              <th className="text-right font-medium px-5 py-2 numeral italic">Annualized</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((e, idx) => {
              const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
              const initials = e.member.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
              return (
                <tr key={e.member.id} className="border-t border-ink-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                        style={{ background: color }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink-900">{e.member.name}</div>
                        <div className="text-[11px] text-ink-500 numeral">{(e.normalizedShare * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </td>
                  {PROJECTED_MONTHS.map((m) => {
                    const v = e.monthly[m] || 0;
                    return (
                      <td key={m} className={`text-right px-3 py-3 numeral ${v > 0 ? "text-ink-900" : "text-ink-300"}`}>
                        {v > 0 ? formatCurrency(v, { compact: true }) : "—"}
                      </td>
                    );
                  })}
                  <td className="text-right px-3 py-3 numeral font-semibold text-brand-700 border-l border-ink-100">
                    {formatCurrency(e.total)}
                  </td>
                  <td className="text-right px-3 py-3 numeral text-ink-700">
                    {formatCurrency(e.avgMonthly)}
                  </td>
                  <td className="text-right px-5 py-3 numeral italic font-semibold text-ink-900">
                    {formatCurrency(e.annualized)}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-ink-200 bg-paper-100/60">
              <td className="px-5 py-3 text-sm font-semibold text-ink-900">Total pool</td>
              {PROJECTED_MONTHS.map((m) => {
                const v = calc.talentPool[m] || 0;
                return (
                  <td key={m} className={`text-right px-3 py-3 numeral font-medium ${v > 0 ? "text-ink-900" : "text-ink-300"}`}>
                    {v > 0 ? formatCurrency(v, { compact: true }) : "—"}
                  </td>
                );
              })}
              <td className="text-right px-3 py-3 numeral font-semibold text-brand-700 border-l border-ink-100">
                {formatCurrency(calc.talentPoolTotal)}
              </td>
              <td className="text-right px-3 py-3 numeral text-ink-700">
                {formatCurrency(calc.talentPoolTotal / PROJECTED_MONTHS.length)}
              </td>
              <td className="text-right px-5 py-3 numeral italic font-semibold text-ink-900">
                {formatCurrency(calc.talentPoolTotal * (12 / PROJECTED_MONTHS.length))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
