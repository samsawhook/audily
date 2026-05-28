"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeBudget,
  DEFAULT_BUDGET,
  DEFAULT_MEMBERS,
  formatCurrency,
  type CompMode,
  type LineItem,
  type Member,
  type ScenarioProject,
} from "@/lib/budget";
import AsteriskLogo from "./AsteriskLogo";
import CompModeToggle from "./CompModeToggle";
import MetricCard from "./MetricCard";
import MonthlyChart from "./MonthlyChart";
import ExpenseBreakdown from "./ExpenseBreakdown";
import RevenueBreakdown from "./RevenueBreakdown";
import TalentPool from "./TalentPool";
import WhatIfPanel from "./WhatIfPanel";
import EmployeeEarnings from "./EmployeeEarnings";
import BudgetTable from "./BudgetTable";

const MEMBERS_KEY = "rococopunch.memberShares.v1";
const BUDGET_KEY = "rococopunch.budget.v1";
const COMP_MODE_KEY = "rococopunch.compMode.v1";

export default function BudgetDashboard() {
  const [scenarios, setScenarios] = useState<ScenarioProject[]>([]);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [budget, setBudget] = useState<LineItem[]>(DEFAULT_BUDGET);
  const [compMode, setCompMode] = useState<CompMode>("tpp");

  useEffect(() => {
    try {
      const m = localStorage.getItem(MEMBERS_KEY);
      if (m) {
        const parsed = JSON.parse(m);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_MEMBERS.length) {
          // Backfill netSalary for members saved before salary mode existed
          const migrated = parsed.map((p: Member) => {
            const fallback = DEFAULT_MEMBERS.find((d) => d.id === p.id);
            return {
              ...p,
              netSalary: typeof p.netSalary === "number" ? p.netSalary : (fallback?.netSalary ?? 0),
            };
          });
          setMembers(migrated);
        }
      }
      const b = localStorage.getItem(BUDGET_KEY);
      if (b) {
        const parsed = JSON.parse(b);
        if (Array.isArray(parsed) && parsed.length > 0) setBudget(parsed);
      }
      const mode = localStorage.getItem(COMP_MODE_KEY);
      if (mode === "tpp" || mode === "salary") setCompMode(mode);
    } catch {}
  }, []);

  const updateMembers = (next: Member[]) => {
    setMembers(next);
    try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(next)); } catch {}
  };
  const updateBudget = (next: LineItem[]) => {
    setBudget(next);
    try { localStorage.setItem(BUDGET_KEY, JSON.stringify(next)); } catch {}
  };
  const updateCompMode = (next: CompMode) => {
    setCompMode(next);
    try { localStorage.setItem(COMP_MODE_KEY, next); } catch {}
  };
  const resetBudget = () => updateBudget(DEFAULT_BUDGET);

  const baseline = useMemo(
    () => computeBudget({ budget, scenarios: [], compMode, members }),
    [budget, compMode, members],
  );
  const current = useMemo(
    () => computeBudget({ budget, scenarios, compMode, members }),
    [budget, scenarios, compMode, members],
  );

  const monthlyNet = members.reduce((a, m) => a + (m.netSalary || 0), 0);
  const compLabel = compMode === "tpp" ? "Talent Profit Pool" : "Salaries & Tax";
  const compSublabel = compMode === "tpp"
    ? (current.yearEndCarry < 0
        ? `carries -${Math.round(-current.yearEndCarry / 1000)}k into '27`
        : "100% to team, carry-forward")
    : `${formatCurrency(monthlyNet)}/mo net + ${formatCurrency(4267)}/mo tax`;

  const netTone = current.companyNetTotal >= 0 ? "good" : "bad";

  return (
    <div className="min-h-screen bg-paper-200">
      <header className="sticky top-0 z-10 backdrop-blur bg-paper-200/85 border-b border-paper-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AsteriskLogo className="h-8 w-8 text-brand-500" />
            <div className="flex items-baseline gap-1">
              <span className="wordmark text-ink-900 text-lg leading-none">Rococo Punch</span>
              <span className="text-brand-500 wordmark text-lg leading-none">*</span>
              <span className="ml-2 text-ink-400 text-xs leading-none">Budget · 2026</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <a className="px-3 py-1.5 rounded-md bg-white text-ink-900 font-medium border border-paper-300">Budget</a>
            <a className="px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-900">Team</a>
            <a className="px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-900">Projects</a>
            <a className="px-3 py-1.5 rounded-md text-ink-500 hover:text-ink-900">Docs</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="wordmark text-3xl text-ink-900">Forward Projections <span className="text-brand-500">·</span> 2026</h1>
            <p className="text-sm text-ink-500 mt-1">
              {compMode === "tpp"
                ? "Free cash flow flows into the talent profit pool. Losses carry forward — pool is never negative."
                : `Per-employee net salaries totalling ${formatCurrency(monthlyNet)}/mo + ${formatCurrency(4267)}/mo for all employer and employee taxes.`}
              {scenarios.length > 0 ? (
                <span className="ml-2 chip bg-brand-100 text-brand-700">
                  {scenarios.length} what-if {scenarios.length === 1 ? "scenario" : "scenarios"} active
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CompModeToggle value={compMode} onChange={updateCompMode} />
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
            value={current.totalOpEx}
            sublabel="Direct + Overhead + Debt"
            delta={current.totalOpEx - baseline.totalOpEx}
          />
          <MetricCard
            label={compLabel}
            value={current.compCostTotal}
            sublabel={compSublabel}
            delta={current.compCostTotal - baseline.compCostTotal}
            tone="brand"
          />
          <MetricCard
            label="Company Net"
            value={current.companyNetTotal}
            sublabel={current.companyNetTotal >= 0 ? "after comp" : "after comp · burn"}
            delta={current.companyNetTotal - baseline.companyNetTotal}
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
          <RevenueBreakdown budget={budget} />
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
          <EmployeeEarnings calc={current} members={members} />
        </section>

        <section>
          <BudgetTable
            calc={current}
            budget={budget}
            setBudget={updateBudget}
            resetBudget={resetBudget}
          />
        </section>

        <footer className="text-center text-xs text-ink-400 py-6">
          Rococo Punch · internal · projections, not guarantees · v0.7
        </footer>
      </main>
    </div>
  );
}
