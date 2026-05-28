"use client";

import type { Calculation, Member } from "@/lib/budget";
import {
  PROJECTED_MONTHS,
  computeMemberEarnings,
  estimateGrossAnnual,
  estimateNetFromGrossAnnual,
  ESTIMATED_EMPLOYEE_TAX_RATE,
  formatCurrency,
} from "@/lib/budget";

const MEMBER_COLORS = ["#F47369", "#B83C32", "#737373"];

type Props = {
  calc: Calculation;
  members: Member[];
};

type Row = {
  member: Member;
  monthly: Record<string, number>;
  total: number;
  avgMonthly: number;
  netAnnualized: number;
  grossAnnualized: number;
};

export default function EmployeeEarnings({ calc, members }: Props) {
  const earnings = computeMemberEarnings(members, calc);
  const isTpp = calc.mode === "tpp";

  // In salary mode the monthly cells are net take-home, member.netSalary × 12
  // is the net annual run-rate, and gross is estimated.
  // In TPP mode the monthly cells are the (pre-tax) pool distribution; the
  // annualized total is gross run-rate, and net is estimated.
  const rows: Row[] = earnings.map((e) => {
    const grossAnnualized = isTpp
      ? e.annualized
      : estimateGrossAnnual(e.member);
    const netAnnualized = isTpp
      ? estimateNetFromGrossAnnual(e.annualized, e.member)
      : e.annualized;
    return {
      member: e.member,
      monthly: e.monthly,
      total: e.total,
      avgMonthly: e.avgMonthly,
      netAnnualized,
      grossAnnualized,
    };
  });

  const totalNet = rows.reduce((a, r) => a + r.netAnnualized, 0);
  const totalGross = rows.reduce((a, r) => a + r.grossAnnualized, 0);
  const totalHealthcareMonthly = members.reduce((a, m) => a + (m.healthcareEmployeeMonthly || 0), 0);

  return (
    <div className="card">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">
              Earnings by member
              <span className="text-ink-500 font-normal ml-2">
                {isTpp ? "— pool distribution" : "— net pay"}
              </span>
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              {isTpp
                ? <>Monthly cells show <span className="italic font-medium">gross</span> TPP distribution after carry-forward · net is estimated at a {(ESTIMATED_EMPLOYEE_TAX_RATE * 100).toFixed(0)}% effective tax rate + healthcare</>
                : <>Monthly cells show <span className="italic font-medium">net</span> take-home · gross is estimated at a {(ESTIMATED_EMPLOYEE_TAX_RATE * 100).toFixed(0)}% effective tax rate + healthcare</>}
            </p>
          </div>
          {isTpp && calc.yearEndCarry < 0 ? (
            <div className="chip bg-bad-500/10 text-bad-600">
              Year-end deficit {formatCurrency(calc.yearEndCarry)} carries to '27
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-paper-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-ink-500 bg-paper-100/60">
              <th className="text-left font-medium px-5 py-2">Member</th>
              {PROJECTED_MONTHS.map((m) => (
                <th key={m} className="text-right font-medium px-3 py-2 numeral">{m}</th>
              ))}
              <th className="text-right font-medium px-3 py-2 numeral border-l border-paper-300">
                {isTpp ? "Gross total" : "Net total"}
              </th>
              <th className="text-right font-medium px-3 py-2 numeral">
                {isTpp ? "Gross avg/mo" : "Net avg/mo"}
              </th>
              <th className="text-right font-medium px-3 py-2 numeral italic">
                Net annualized {isTpp ? "(est.)" : ""}
              </th>
              <th className="text-right font-medium px-5 py-2 numeral italic text-brand-700">
                Gross annualized {!isTpp ? "(est.)" : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
              const initials = r.member.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
              const healthcare = r.member.healthcareEmployeeMonthly || 0;
              const shareForMember = isTpp
                ? earnings.find((e) => e.member.id === r.member.id)?.normalizedShare ?? 0
                : 0;
              return (
                <tr key={r.member.id} className="border-t border-paper-300">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                        style={{ background: color }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink-900">{r.member.name}</div>
                        <div className="text-[11px] text-ink-500 numeral">
                          {isTpp
                            ? `${(shareForMember * 100).toFixed(1)}% share${healthcare > 0 ? ` · ${formatCurrency(healthcare)}/mo healthcare` : " · no company plan"}`
                            : `${formatCurrency(r.member.netSalary || 0)}/mo net${healthcare > 0 ? ` · ${formatCurrency(healthcare)}/mo healthcare` : " · no company plan"}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  {PROJECTED_MONTHS.map((m) => {
                    const v = r.monthly[m] || 0;
                    return (
                      <td key={m} className={`text-right px-3 py-3 numeral ${v > 0 ? "text-ink-900" : "text-ink-300"}`}>
                        {v > 0 ? formatCurrency(v, { compact: true }) : "—"}
                      </td>
                    );
                  })}
                  <td className="text-right px-3 py-3 numeral font-semibold text-brand-700 border-l border-paper-300">
                    {formatCurrency(r.total)}
                  </td>
                  <td className="text-right px-3 py-3 numeral text-ink-700">
                    {formatCurrency(r.avgMonthly)}
                  </td>
                  <td className={`text-right px-3 py-3 numeral italic font-semibold ${isTpp ? "text-ink-700" : "text-ink-900"}`}>
                    {formatCurrency(r.netAnnualized)}
                    {isTpp ? <span className="ml-1 text-[10px] text-ink-400 font-normal not-italic">est.</span> : null}
                  </td>
                  <td className={`text-right px-5 py-3 numeral italic font-semibold ${isTpp ? "text-ink-900" : "text-brand-700"}`}>
                    {formatCurrency(r.grossAnnualized)}
                    {!isTpp ? <span className="ml-1 text-[10px] text-ink-400 font-normal not-italic">est.</span> : null}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-ink-200 bg-paper-100/60">
              <td className="px-5 py-3 text-sm font-semibold text-ink-900">
                {isTpp ? "Total pool" : "Totals"}
                {totalHealthcareMonthly > 0 ? (
                  <div className="text-[11px] text-ink-500 font-normal numeral">
                    Employee healthcare {formatCurrency(totalHealthcareMonthly)}/mo
                  </div>
                ) : null}
              </td>
              {PROJECTED_MONTHS.map((m) => {
                const v = calc.comp[m] || 0;
                return (
                  <td key={m} className={`text-right px-3 py-3 numeral font-medium ${v > 0 ? "text-ink-900" : "text-ink-300"}`}>
                    {v > 0 ? formatCurrency(v, { compact: true }) : "—"}
                  </td>
                );
              })}
              <td className="text-right px-3 py-3 numeral font-semibold text-brand-700 border-l border-paper-300">
                {formatCurrency(calc.compTotal)}
              </td>
              <td className="text-right px-3 py-3 numeral text-ink-700">
                {formatCurrency(calc.compTotal / PROJECTED_MONTHS.length)}
              </td>
              <td className={`text-right px-3 py-3 numeral italic font-semibold ${isTpp ? "text-ink-700" : "text-ink-900"}`}>
                {formatCurrency(totalNet)}
                {isTpp ? <span className="ml-1 text-[10px] text-ink-400 font-normal not-italic">est.</span> : null}
              </td>
              <td className={`text-right px-5 py-3 numeral italic font-semibold ${isTpp ? "text-ink-900" : "text-brand-700"}`}>
                {formatCurrency(totalGross)}
                {!isTpp ? <span className="ml-1 text-[10px] text-ink-400 font-normal not-italic">est.</span> : null}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-paper-300 text-[11px] text-ink-500">
        <span className="font-medium text-ink-700">Apples-to-apples comparison:</span>{" "}
        Both modes assume healthcare is a pre-tax deduction with the company paying 70% of the $5,000/mo total premium (employees split the remaining $1,500/mo · Emily 65% / Erika 35%). Net and gross are linked by
        {" "}<code className="text-ink-700">net = (gross − healthcare) × (1 − {(ESTIMATED_EMPLOYEE_TAX_RATE * 100).toFixed(0)}%)</code>{" "}
        — a single combined federal + state + FICA effective rate. {isTpp ? "TPP" : "Salary"} mode shows the side that's exact for this scenario; the other side is an estimate.
      </div>
    </div>
  );
}
