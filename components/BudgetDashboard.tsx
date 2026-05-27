"use client";

import { useMemo, useState } from "react";
import {
  computeBudget,
  type ScenarioProject,
  formatCurrency,
} from "@/lib/budget";
import MetricCard from "./MetricCard";
import MonthlyChart from "./MonthlyChart";
import ExpenseBreakdown from "./ExpenseBreakdown";
import TalentPool from "./TalentPool";
import WhatIfPanel from "./WhatIfPanel";
import BudgetTable from "./BudgetTable";

export default function BudgetDashboard() {
  const [scenarios, setScenarios] = useState<ScenarioProject[]>([]);
  const [poolPercent, setPoolPercent] = useState(0.75);
  const [poolBase, setPoolBase] = useState<"gross" | "net_excl_salary" | "net">("gross");

  const baseline = useMemo(
    () => computeBudget({ scenarios: [], poolPercent, poolBase }),
    [poolPercent, poolBase],
  );

  const current = useMemo(
    () => computeBudget({ scenarios, poolPercent, poolBase }),
    [scenarios, poolPercent, poolBase],
  );

  const cashTone = current.cashFlowTotal >= 0 ? "good" : "bad";

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-ink-900 leading-tight">Audily Intranet</div>
              <div className="text-[11px] text-ink-500 leading-tight">Transparent budget · 2026</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <a className="px-3 py-1.5 rounded-md bg-ink-100 text-ink-900 font-medium">Budget</a>
            <a className="px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-900">Team</a>
            <a className="px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-900">Projects</a>
            <a className="px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-900">Docs</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Title */}
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Forward Projections — 2026</h1>
            <p className="text-sm text-ink-500 mt-1">
              Live, line-by-line projections for May – Dec. Everyone sees the same numbers.
              {scenarios.length > 0 ? (
                <span className="ml-2 chip bg-brand-100 text-brand-700">
                  {scenarios.length} what-if {scenarios.length === 1 ? "scenario" : "scenarios"} active
                </span>
              ) : null}
            </p>
          </div>
          <div className="text-xs text-ink-500">
            Source: <span className="text-ink-700 font-medium">Profit Pool — Audily Forward Projections 2026 (Sheet9)</span>
          </div>
        </div>

        {/* Hero metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Projected Revenue"
            value={current.totalRevenue}
            sublabel="May – Dec 2026"
            delta={current.totalRevenue - baseline.totalRevenue}
            tone="neutral"
          />
          <MetricCard
            label="Projected Expenses"
            value={current.totalCogs + current.totalSalary + current.totalTax + current.totalOverhead}
            sublabel="All categories"
            delta={(current.totalCogs - baseline.totalCogs)}
          />
          <MetricCard
            label="Net Cash Flow"
            value={current.cashFlowTotal}
            sublabel={current.cashFlowTotal >= 0 ? "surplus" : "burn"}
            delta={current.cashFlowTotal - baseline.cashFlowTotal}
            tone={cashTone}
            signed
          />
          <MetricCard
            label="Talent Profit Pool"
            value={current.talentPoolTotal}
            sublabel={`${(poolPercent * 100).toFixed(0)}% of ${poolBase === "gross" ? "gross profit" : poolBase === "net_excl_salary" ? "pre-salary profit" : "net profit"}`}
            delta={current.talentPoolTotal - baseline.talentPoolTotal}
            tone="brand"
          />
        </section>

        {/* Row 2: Chart + Pie */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MonthlyChart calc={current} baseline={scenarios.length > 0 ? baseline : undefined} />
          </div>
          <div>
            <ExpenseBreakdown calc={current} />
          </div>
        </section>

        {/* Row 3: Pool + What-If */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TalentPool
            calc={current}
            poolPercent={poolPercent}
            setPoolPercent={setPoolPercent}
            poolBase={poolBase}
            setPoolBase={setPoolBase}
          />
          <WhatIfPanel
            scenarios={scenarios}
            setScenarios={setScenarios}
            baseline={baseline}
            current={current}
          />
        </section>

        {/* Row 4: Table */}
        <section>
          <BudgetTable calc={current} />
        </section>

        <footer className="text-center text-xs text-ink-400 py-6">
          Audily · internal · figures are projections, not guarantees · v0.1
        </footer>
      </main>
    </div>
  );
}
