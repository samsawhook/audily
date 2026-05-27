"use client";

import { useMemo, useState } from "react";
import {
  computeBudget,
  type ScenarioProject,
  type PoolBase,
} from "@/lib/budget";
import MetricCard from "./MetricCard";
import MonthlyChart from "./MonthlyChart";
import ExpenseBreakdown from "./ExpenseBreakdown";
import RevenueBreakdown from "./RevenueBreakdown";
import TalentPool from "./TalentPool";
import WhatIfPanel from "./WhatIfPanel";
import BudgetTable from "./BudgetTable";

const poolBaseLabel = (b: PoolBase) =>
  b === "gross" ? "gross profit" : "operating profit";

export default function BudgetDashboard() {
  const [scenarios, setScenarios] = useState<ScenarioProject[]>([]);
  const [poolPercent, setPoolPercent] = useState(0.75);
  const [poolBase, setPoolBase] = useState<PoolBase>("operating");

  const baseline = useMemo(
    () => computeBudget({ scenarios: [], poolPercent, poolBase }),
    [poolPercent, poolBase],
  );

  const current = useMemo(
    () => computeBudget({ scenarios, poolPercent, poolBase }),
    [scenarios, poolPercent, poolBase],
  );

  const netTone = current.netCashFlowTotal >= 0 ? "good" : "bad";

  return (
    <div className="min-h-screen bg-ink-50">
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
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Forward Projections — 2026</h1>
            <p className="text-sm text-ink-500 mt-1">
              Compensation flows through the talent profit pool — there are no salaries.
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

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Projected Revenue"
            value={current.totalRevenue}
            sublabel="May – Dec 2026"
            delta={current.totalRevenue - baseline.totalRevenue}
            tone="neutral"
          />
          <MetricCard
            label="Operating Expenses"
            value={current.totalExpenses}
            sublabel="Production + Overhead"
            delta={current.totalExpenses - baseline.totalExpenses}
          />
          <MetricCard
            label="Talent Profit Pool"
            value={current.talentPoolTotal}
            sublabel={`${(poolPercent * 100).toFixed(0)}% of ${poolBaseLabel(poolBase)}`}
            delta={current.talentPoolTotal - baseline.talentPoolTotal}
            tone="brand"
          />
          <MetricCard
            label="Company Net"
            value={current.netCashFlowTotal}
            sublabel={current.netCashFlowTotal >= 0 ? "after pool" : "after pool · burn"}
            delta={current.netCashFlowTotal - baseline.netCashFlowTotal}
            tone={netTone}
            signed
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MonthlyChart calc={current} baseline={scenarios.length > 0 ? baseline : undefined} />
          </div>
          <div>
            <ExpenseBreakdown calc={current} />
          </div>
        </section>

        <section>
          <RevenueBreakdown />
        </section>

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

        <section>
          <BudgetTable calc={current} />
        </section>

        <footer className="text-center text-xs text-ink-400 py-6">
          Audily · internal · figures are projections, not guarantees · v0.2
        </footer>
      </main>
    </div>
  );
}
