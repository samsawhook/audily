"use client";

import { Fragment } from "react";
import type { Calculation, LineItem, LineItemGroup, MonthKey } from "@/lib/budget";
import { PROJECTED_MONTHS, SALARY_MONTHLY, EMPLOYER_TAX_MONTHLY, formatCurrency, sumMonthly } from "@/lib/budget";

type Props = {
  calc: Calculation;
  budget: LineItem[];
  setBudget: (b: LineItem[]) => void;
  resetBudget: () => void;
};

const groupHeading = (g: LineItemGroup) => ({
  revenue: "Revenue",
  direct: "Direct Expenses",
  overhead: "Overhead",
  debt: "Debt Service",
}[g]);

const groupTotals = (calc: Calculation, group: LineItemGroup) => {
  switch (group) {
    case "revenue": return PROJECTED_MONTHS.map((m) => calc.revenue[m] || 0);
    case "direct": return PROJECTED_MONTHS.map((m) => calc.direct[m] || 0);
    case "overhead": return PROJECTED_MONTHS.map((m) => calc.overhead[m] || 0);
    case "debt": return PROJECTED_MONTHS.map((m) => calc.debt[m] || 0);
  }
};

export default function BudgetTable({ calc, budget, setBudget, resetBudget }: Props) {
  const isSalary = calc.mode === "salary";
  const groups: LineItemGroup[] = ["revenue", "direct", "overhead", "debt"];

  const updateCell = (id: string, month: MonthKey, value: number) => {
    setBudget(budget.map((item) =>
      item.id === id ? { ...item, monthly: { ...item.monthly, [month]: value } } : item
    ));
  };

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const comp = PROJECTED_MONTHS.map((m) => calc.comp[m] || 0);
  const net = PROJECTED_MONTHS.map((m) => calc.companyNet[m] || 0);
  const salaryRow = PROJECTED_MONTHS.map((m) => calc.salary[m] || 0);
  const taxRow = PROJECTED_MONTHS.map((m) => calc.employerTax[m] || 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between p-5">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Editable budget — full monthly breakdown</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Click any operating-expense cell to edit · charts and pool update live · saved to this device
            {isSalary ? <span className="ml-2 chip bg-paper-100 text-ink-600">Salary mode · $25,100 + $4,267 are fixed</span> : null}
          </p>
        </div>
        <button
          onClick={resetBudget}
          className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-2"
        >
          reset to defaults
        </button>
      </div>

      <div className="overflow-x-auto border-t border-paper-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-ink-500 bg-paper-100/60">
              <th className="text-left font-medium px-5 py-2 sticky left-0 bg-paper-100/95 z-10">Line</th>
              {PROJECTED_MONTHS.map((m) => (
                <th key={m} className="text-right font-medium px-3 py-2 numeral">{m}</th>
              ))}
              <th className="text-right font-medium px-5 py-2 numeral border-l border-paper-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const items = budget.filter((b) => b.group === g);
              const headerValues = groupTotals(calc, g);
              return (
                <Fragment key={g}>
                  <tr className="bg-paper-100/60 border-t border-paper-300">
                    <td className={`px-5 py-2 font-semibold text-sm sticky left-0 bg-paper-100/95 z-10 ${g === "revenue" ? "text-good-600" : "text-ink-700"}`}>
                      {groupHeading(g)}
                    </td>
                    {headerValues.map((v, i) => (
                      <td key={i} className={`text-right px-3 py-2 numeral font-medium ${g === "revenue" ? "text-good-600" : "text-ink-700"}`}>
                        {v === 0 ? <span className="text-ink-300">—</span> : formatCurrency(v, { compact: true })}
                      </td>
                    ))}
                    <td className={`text-right px-5 py-2 numeral font-semibold border-l border-paper-300 ${g === "revenue" ? "text-good-600" : "text-ink-700"}`}>
                      {formatCurrency(sum(headerValues))}
                    </td>
                  </tr>
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-paper-100/40">
                      <td className="pl-9 pr-5 py-1 text-ink-600 text-sm sticky left-0 bg-white hover:bg-paper-100/40 z-10">{item.label}</td>
                      {PROJECTED_MONTHS.map((m) => (
                        <td key={m} className="px-2 py-1">
                          <EditableNumber
                            value={item.monthly[m] || 0}
                            onChange={(v) => updateCell(item.id, m, v)}
                          />
                        </td>
                      ))}
                      <td className="text-right px-5 py-1 numeral text-ink-700 font-medium border-l border-paper-300">
                        {formatCurrency(sumMonthly(item.monthly))}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}

            {isSalary ? (
              <Fragment>
                <tr className="bg-paper-100/60 border-t border-paper-300">
                  <td className="px-5 py-2 font-semibold text-sm text-ink-700 sticky left-0 bg-paper-100/95 z-10">
                    Compensation
                  </td>
                  {PROJECTED_MONTHS.map((m, i) => (
                    <td key={m} className="text-right px-3 py-2 numeral font-medium text-ink-700">
                      {formatCurrency((salaryRow[i] || 0) + (taxRow[i] || 0), { compact: true })}
                    </td>
                  ))}
                  <td className="text-right px-5 py-2 numeral font-semibold border-l border-paper-300 text-ink-700">
                    {formatCurrency(calc.totalSalary + calc.totalEmployerTax)}
                  </td>
                </tr>
                <tr>
                  <td className="pl-9 pr-5 py-1 text-ink-600 text-sm sticky left-0 bg-white z-10">
                    Rococo Punch Salaries
                  </td>
                  {salaryRow.map((v, i) => (
                    <td key={i} className="text-right px-2 py-1 numeral text-ink-600">
                      {formatCurrency(v, { compact: true })}
                    </td>
                  ))}
                  <td className="text-right px-5 py-1 numeral text-ink-700 font-medium border-l border-paper-300">
                    {formatCurrency(calc.totalSalary)}
                  </td>
                </tr>
                <tr>
                  <td className="pl-9 pr-5 py-1 text-ink-600 text-sm sticky left-0 bg-white z-10">
                    Employer Tax
                  </td>
                  {taxRow.map((v, i) => (
                    <td key={i} className="text-right px-2 py-1 numeral text-ink-600">
                      {formatCurrency(v, { compact: true })}
                    </td>
                  ))}
                  <td className="text-right px-5 py-1 numeral text-ink-700 font-medium border-l border-paper-300">
                    {formatCurrency(calc.totalEmployerTax)}
                  </td>
                </tr>
              </Fragment>
            ) : null}

            {!isSalary ? (
              <tr className="bg-brand-50/40 border-t border-paper-300">
                <td className="px-5 py-2 font-semibold text-sm text-brand-700 sticky left-0 bg-brand-50/80 z-10">
                  Talent Pool (after carry-fwd)
                </td>
                {comp.map((v, i) => (
                  <td key={i} className="text-right px-3 py-2 numeral font-medium text-brand-700">
                    {v === 0 ? <span className="text-ink-300">—</span> : formatCurrency(v, { compact: true })}
                  </td>
                ))}
                <td className="text-right px-5 py-2 numeral font-semibold border-l border-paper-300 text-brand-700">
                  {formatCurrency(calc.compTotal)}
                </td>
              </tr>
            ) : null}

            <tr className="bg-paper-100/60 border-t border-paper-300">
              <td className="px-5 py-2 font-semibold text-sm text-ink-700 sticky left-0 bg-paper-100/95 z-10">
                Company Net
              </td>
              {net.map((v, i) => (
                <td key={i} className={`text-right px-3 py-2 numeral font-medium ${v >= 0 ? "text-ink-900" : "text-bad-600"}`}>
                  {v === 0 ? <span className="text-ink-300">—</span> : formatCurrency(v, { compact: true, signed: true })}
                </td>
              ))}
              <td className={`text-right px-5 py-2 numeral font-semibold border-l border-paper-300 ${calc.companyNetTotal >= 0 ? "text-ink-900" : "text-bad-600"}`}>
                {formatCurrency(calc.companyNetTotal, { signed: true })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {isSalary ? (
        <div className="px-5 py-3 border-t border-paper-300 text-[11px] text-ink-500">
          Salary and Employer Tax are fixed at ${SALARY_MONTHLY.toLocaleString()} and ${EMPLOYER_TAX_MONTHLY.toLocaleString()} / mo respectively — edit in <code className="text-ink-700">lib/budget.ts</code> if needed.
        </div>
      ) : null}
    </div>
  );
}

function EditableNumber({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const display = value === 0 ? "" : String(Math.round(value));
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      placeholder="—"
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.-]/g, "");
        const n = parseFloat(raw);
        onChange(Number.isFinite(n) ? n : 0);
      }}
      className="cell-input"
      aria-label="cell value"
    />
  );
}
