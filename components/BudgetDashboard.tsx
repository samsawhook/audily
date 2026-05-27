"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeBudget,
  DEFAULT_MEMBERS,
  type Member,
  type ScenarioProject,
} from "@/lib/budget";
import MetricCard from "./MetricCard";
import MonthlyChart from "./MonthlyChart";
import ExpenseBreakdown from "./ExpenseBreakdown";
import RevenueBreakdown from "./RevenueBreakdown";
import TalentPool from "./TalentPool";
import WhatIfPanel from "./WhatIfPanel";
import BudgetTable from "./BudgetTable";

const MEMBERS_KEY = "audily.memberShares.v1";

export default function BudgetDashboard() {
  const [scenarios, setScenarios] = useState<ScenarioProject[]>([]);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEMBERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_MEMBERS.length) {
          setMembers(parsed);
        }
      }
    } catch {}
  }, []);

  const updateMembers = (next: Member[]) => {
    setMembers(next);
    try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(next)); } catch {}
  };

  const baseline = useMemo(
    () => computeBudget({ scenarios: [] }),
    [],
  );

  const current = useMemo(
    () => computeBudget({ scenarios }),
    [scenarios],
  );

  const margin = current.totalRevenue > 0
    ? current.freeCashFlowTotal / current.totalRevenue
    : 0;
  const baselineMargin = baseline.totalRevenue > 0
    ? baseline.freeCashFlowTotal / baseline.totalRevenue
    : 0;

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
              All free cash flow is distributed pro rata to the talent pool.
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
            sublabel="Direct + Overhead + Debt"
            delta={current.totalExpenses - baseline.totalExpenses}
          />
          <MetricCard
            label="Talent Profit Pool"
            value={current.freeCashFlowTotal}
            sublabel="100% of free cash flow"
            delta={current.freeCashFlowTotal - baseline.freeCashFlowTotal}
            tone="brand"
            signed
          />
          <MetricCard
            label="Pool Margin"
            value={Math.round(margin * 100)}
            sublabel={`vs ${(baselineMargin * 100).toFixed(0)}% baseline`}
            tone={margin >= 0 ? "good" : "bad"}
            asPercent
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
            members={members}
            setMembers={updateMembers}
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
          Audily · internal · figures are projections, not guarantees · v0.3
        </footer>
      </main>
    </div>
  );
}
