"use client";

import type { Calculation, Member } from "@/lib/budget";
import {
  PROJECTED_MONTHS,
  computeMemberEarnings,
  estimateGrossAnnual,
  ESTIMATED_EMPLOYEE_TAX_RATE,
  formatCurrency,
} from "@/lib/budget";

const MEMBER_COLORS = ["#F47369", "#B83C32", "#737373"];

type Props = {
  calc: Calculation;
  members: Member[];
};

export default function EmployeeEarnings({ calc, members }: Props) {
  const earnings = computeMemberEarnings(members, calc);
  const isTpp = calc.mode === "tpp";

  const totalGross = members.reduce((a, m) => a + estimateGrossAnnual(m), 0);
  const totalHealthcareMonthly = members.reduce((a, m) => a + (m.healthcareEmployeeMonthly || 0), 0);

  return (
    <div className="card">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">
              Earnings by member {!isTpp ? <span className="text-ink-500 font-normal">— net pay</span> : null}
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              {isTpp
                ? <>From TPP after loss carry-forward · run-rate for 2027 in <span className="italic font-medium">Annualized</span></>
                : <>Monthly cells show <span className="italic font-medium">net</span> take-home · gross is estimated from net + healthcare contribution at a {(ESTIMATED_EMPLOYEE_TAX_RATE * 100).toFixed(0)}% effective tax rate</>}
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
                {isTpp ? "Total" : "Net total"}
              </th>
              <th className="text-right font-medium px-3 py-2 numeral">
                {isTpp ? "Avg/mo" : "Net avg/mo"}
              </th>
              <th className="text-right font-medium px-3 py-2 numeral italic">
                {isTpp ? "Annualized" : "Net annualized"}
              </th>
              {!isTpp ? (
                <th className="text-right font-medium px-5 py-2 numeral italic text-brand-700">
                  Gross annualized (est.)
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {earnings.map((e, idx) => {
              const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
              const initials = e.member.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
              const gross = estimateGrossAnnual(e.member);
              const healthcare = e.member.healthcareEmployeeMonthly || 0;
              return (
                <tr key={e.member.id} className="border-t border-paper-300">
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
                        <div className="text-[11px] text-ink-500 numeral">
                          {isTpp
                            ? `${(e.normalizedShare * 100).toFixed(1)}%`
                            : `${formatCurrency(e.member.netSalary || 0)}/mo net${healthcare > 0 ? ` · ${formatCurrency(healthcare)}/mo healthcare` : " · no company plan"}`}
                        </div>
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
                  <td className="text-right px-3 py-3 numeral font-semibold text-brand-700 border-l border-paper-300">
                    {formatCurrency(e.total)}
                  </td>
                  <td className="text-right px-3 py-3 numeral text-ink-700">
                    {formatCurrency(e.avgMonthly)}
                  </td>
                  <td className="text-right px-3 py-3 numeral italic font-semibold text-ink-900">
                    {formatCurrency(e.annualized)}
                  </td>
                  {!isTpp ? (
                    <td className="text-right px-5 py-3 numeral italic font-semibold text-brand-700">
                      {formatCurrency(gross)}
                      <span className="ml-1 text-[10px] text-ink-400 font-normal not-italic">est.</span>
                    </td>
                  ) : null}
                </tr>
              );
            })}
            <tr className="border-t-2 border-ink-200 bg-paper-100/60">
              <td className="px-5 py-3 text-sm font-semibold text-ink-900">
                {isTpp ? "Total pool" : "Totals"}
                {!isTpp && totalHealthcareMonthly > 0 ? (
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
              <td className="text-right px-3 py-3 numeral italic font-semibold text-ink-900">
                {formatCurrency(calc.compTotal * (12 / PROJECTED_MONTHS.length))}
              </td>
              {!isTpp ? (
                <td className="text-right px-5 py-3 numeral italic font-semibold text-brand-700">
                  {formatCurrency(totalGross)}
                  <span className="ml-1 text-[10px] text-ink-400 font-normal not-italic">est.</span>
                </td>
              ) : null}
            </tr>
          </tbody>
        </table>
      </div>

      {!isTpp ? (
        <div className="px-5 py-3 border-t border-paper-300 text-[11px] text-ink-500">
          <span className="font-medium text-ink-700">Gross is an estimate.</span>{" "}
          Computed as <code className="text-ink-700">(net + healthcare contribution) ÷ (1 − {(ESTIMATED_EMPLOYEE_TAX_RATE * 100).toFixed(0)}%) × 12</code> — assumed combined federal + state + FICA effective rate. Healthcare: company pays 70% of the $5,000/mo total premium; the remaining $1,500 splits 65/35 Emily/Erika. Adjust the tax rate or per-member healthcare in <code className="text-ink-700">lib/budget.ts</code>.
        </div>
      ) : null}
    </div>
  );
}
