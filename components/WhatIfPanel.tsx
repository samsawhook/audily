"use client";

import { useState } from "react";
import type { ScenarioProject, MonthKey, Calculation } from "@/lib/budget";
import { PROJECTED_MONTHS, formatCurrency } from "@/lib/budget";

type Props = {
  scenarios: ScenarioProject[];
  setScenarios: (s: ScenarioProject[]) => void;
  baseline: Calculation;
  current: Calculation;
};

const genId = () => Math.random().toString(36).slice(2, 10);

export default function WhatIfPanel({ scenarios, setScenarios, baseline, current }: Props) {
  const [name, setName] = useState("");
  const [revenue, setRevenue] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [start, setStart] = useState<MonthKey>("Jun");
  const [duration, setDuration] = useState<string>("1");

  const addProject = () => {
    const rev = parseFloat(revenue || "0") || 0;
    const c = parseFloat(cost || "0") || 0;
    const d = Math.max(1, parseInt(duration || "1", 10) || 1);
    if (!name && rev === 0 && c === 0) return;
    setScenarios([
      ...scenarios,
      {
        id: genId(),
        name: name || "Untitled project",
        revenue: rev,
        productionCost: c,
        startMonth: start,
        durationMonths: d,
      },
    ]);
    setName("");
    setRevenue("");
    setCost("");
    setDuration("1");
  };

  const remove = (id: string) => setScenarios(scenarios.filter((s) => s.id !== id));

  const revDelta = current.totalRevenue - baseline.totalRevenue;
  const poolDelta = current.talentPoolTotal - baseline.talentPoolTotal;
  const cashDelta = current.netCashFlowTotal - baseline.netCashFlowTotal;

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">What if… we land a new project?</h3>
          <p className="text-xs text-ink-500">Add hypothetical deals and watch the pool move.</p>
        </div>
        {scenarios.length > 0 ? (
          <button
            onClick={() => setScenarios([])}
            className="text-[11px] text-ink-500 hover:text-ink-900 underline underline-offset-2"
          >
            clear all
          </button>
        ) : null}
      </div>

      {/* Form */}
      <div className="mt-4 rounded-xl border border-ink-100 p-4 space-y-3">
        <div>
          <label className="block text-[11px] text-ink-500 mb-1">Project name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spotify limited series"
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-ink-500 mb-1">Revenue ($)</label>
            <input
              type="number"
              inputMode="numeric"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="100,000"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 numeral focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-[11px] text-ink-500 mb-1">Production cost ($)</label>
            <input
              type="number"
              inputMode="numeric"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="30,000"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 numeral focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-ink-500 mb-1">Start month</label>
            <select
              value={start}
              onChange={(e) => setStart(e.target.value as MonthKey)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {PROJECTED_MONTHS.map((m) => (
                <option key={m} value={m}>{m} 2026</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-ink-500 mb-1">Months (spread)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 numeral focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <button
          onClick={addProject}
          className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add to scenario
        </button>
      </div>

      {/* Active scenarios */}
      {scenarios.length > 0 ? (
        <div className="mt-3 space-y-2">
          {scenarios.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-brand-50/60 border border-brand-200/50 px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink-900 truncate">{s.name}</div>
                <div className="text-[11px] text-ink-500 numeral">
                  +{formatCurrency(s.revenue, { compact: true })} rev · −{formatCurrency(s.productionCost, { compact: true })} cost · {s.startMonth} × {s.durationMonths}mo
                </div>
              </div>
              <button
                onClick={() => remove(s.id)}
                className="ml-2 text-ink-400 hover:text-bad-600 text-lg leading-none"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {/* Impact summary */}
      <div className="mt-auto pt-4 border-t border-ink-100">
        <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-2">Impact vs baseline</div>
        <div className="grid grid-cols-3 gap-2">
          <Impact label="Revenue" value={revDelta} good={revDelta >= 0} />
          <Impact label="Company net" value={cashDelta} good={cashDelta >= 0} />
          <Impact label="Pool" value={poolDelta} good={poolDelta >= 0} brand />
        </div>
      </div>
    </div>
  );
}

function Impact({ label, value, good, brand }: { label: string; value: number; good: boolean; brand?: boolean }) {
  const tone = value === 0
    ? "text-ink-400 bg-ink-50"
    : brand
      ? "text-brand-700 bg-brand-50"
      : good ? "text-good-600 bg-good-500/10" : "text-bad-600 bg-bad-500/10";
  return (
    <div className={`rounded-lg p-2.5 ${tone}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="numeral text-sm font-semibold">
        {value === 0 ? "—" : `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value), { compact: true })}`}
      </div>
    </div>
  );
}
