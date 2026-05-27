export type MonthKey =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export const PROJECTED_MONTHS: MonthKey[] = [
  "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type MonthlyMap = Record<MonthKey, number>;

const zeroMap = (): MonthlyMap => ({
  Jan: 0, Feb: 0, Mar: 0, Apr: 0,
  May: 0, Jun: 0, Jul: 0, Aug: 0,
  Sep: 0, Oct: 0, Nov: 0, Dec: 0,
});

const fromProjected = (vals: number[]): MonthlyMap => {
  const out = zeroMap();
  PROJECTED_MONTHS.forEach((m, i) => {
    out[m] = vals[i] ?? 0;
  });
  return out;
};

export type LineItem = {
  id: string;
  label: string;
  group: "revenue" | "cogs" | "overhead";
  monthly: MonthlyMap;
};

// Source: Profit Pool — Audily Forward Projections 2026 (sheet9).
// Revenue is broken down by show/client under Rococo Punch.
// Compensation runs entirely through the talent profit pool —
// no salary or employer-tax line items.
export const BUDGET: LineItem[] = [
  {
    id: "rev_chronicle",
    label: "Chronicle",
    group: "revenue",
    monthly: fromProjected([10000, 0, 0, 0, 0, 0, 0, 0]),
  },
  {
    id: "rev_cep",
    label: "CEP",
    group: "revenue",
    monthly: fromProjected([20000, 0, 20000, 0, 20000, 0, 20000, 0]),
  },
  {
    id: "rev_kscope",
    label: "Kscope",
    group: "revenue",
    monthly: fromProjected([0, 0, 0, 0, 0, 0, 0, 0]),
  },
  {
    id: "rev_josh_levin",
    label: "Josh Levin",
    group: "revenue",
    monthly: fromProjected([42000, 0, 0, 0, 31500, 0, 31500, 0]),
  },
  {
    id: "rev_bu",
    label: "BU",
    group: "revenue",
    monthly: fromProjected([0, 0, 0, 12000, 0, 0, 0, 0]),
  },
  {
    id: "rev_wme",
    label: "WME",
    group: "revenue",
    monthly: fromProjected([0, 0, 0, 135000, 0, 0, 0, 0]),
  },
  {
    id: "cogs_rococo",
    label: "Rococo Punch — Production",
    group: "cogs",
    monthly: fromProjected([17800, 14800, 14800, 14800, 14800, 14800, 14800, 14800]),
  },
  {
    id: "overhead",
    label: "Overhead",
    group: "overhead",
    monthly: fromProjected([30102, 17339, 15500, 15500, 15500, 15500, 15500, 15500]),
  },
];

export type ScenarioProject = {
  id: string;
  name: string;
  revenue: number;
  productionCost: number;
  startMonth: MonthKey;
  durationMonths: number;
};

export const sumMonthly = (m: MonthlyMap): number =>
  PROJECTED_MONTHS.reduce((acc, k) => acc + (m[k] || 0), 0);

export const monthsRemaining = (start: MonthKey): MonthKey[] => {
  const idx = PROJECTED_MONTHS.indexOf(start);
  if (idx < 0) return [];
  return PROJECTED_MONTHS.slice(idx);
};

export type PoolBase = "gross" | "operating";

export type Calculation = {
  revenue: MonthlyMap;
  cogs: MonthlyMap;
  overhead: MonthlyMap;
  totalRevenue: number;
  totalCogs: number;
  totalOverhead: number;
  totalExpenses: number;
  grossProfit: MonthlyMap;
  grossProfitTotal: number;
  operatingProfit: MonthlyMap;
  operatingProfitTotal: number;
  talentPool: MonthlyMap;
  talentPoolTotal: number;
  netCashFlow: MonthlyMap; // company-retained after paying pool
  netCashFlowTotal: number;
  poolBase: PoolBase;
};

export type CalcOptions = {
  // Where talent pool is drawn from:
  // "gross"      -> Revenue - COGS
  // "operating"  -> Revenue - COGS - Overhead  (default)
  poolBase: PoolBase;
  poolPercent: number;
  scenarios: ScenarioProject[];
};

const accMap = (
  base: MonthlyMap,
  add: MonthlyMap,
): MonthlyMap => {
  const out = zeroMap();
  for (const k of PROJECTED_MONTHS) {
    out[k] = (base[k] || 0) + (add[k] || 0);
  }
  return out;
};

const scenarioToMonthly = (
  p: ScenarioProject,
  field: "revenue" | "productionCost",
): MonthlyMap => {
  const out = zeroMap();
  const months = monthsRemaining(p.startMonth).slice(0, Math.max(1, p.durationMonths));
  if (months.length === 0) return out;
  const total = field === "revenue" ? p.revenue : p.productionCost;
  const per = total / months.length;
  for (const m of months) out[m] = per;
  return out;
};

export const computeBudget = (opts: CalcOptions): Calculation => {
  const empty = zeroMap();
  let revenue = empty;
  let cogs = empty;
  let overhead = empty;

  for (const item of BUDGET) {
    switch (item.group) {
      case "revenue": revenue = accMap(revenue, item.monthly); break;
      case "cogs": cogs = accMap(cogs, item.monthly); break;
      case "overhead": overhead = accMap(overhead, item.monthly); break;
    }
  }

  for (const s of opts.scenarios) {
    revenue = accMap(revenue, scenarioToMonthly(s, "revenue"));
    cogs = accMap(cogs, scenarioToMonthly(s, "productionCost"));
  }

  const grossProfit = zeroMap();
  const operatingProfit = zeroMap();
  for (const m of PROJECTED_MONTHS) {
    grossProfit[m] = (revenue[m] || 0) - (cogs[m] || 0);
    operatingProfit[m] = grossProfit[m] - (overhead[m] || 0);
  }

  const talentPool = zeroMap();
  for (const m of PROJECTED_MONTHS) {
    const base = opts.poolBase === "gross" ? grossProfit[m] : operatingProfit[m];
    talentPool[m] = base > 0 ? base * opts.poolPercent : 0;
  }

  const netCashFlow = zeroMap();
  for (const m of PROJECTED_MONTHS) {
    netCashFlow[m] = operatingProfit[m] - talentPool[m];
  }

  return {
    revenue, cogs, overhead,
    totalRevenue: sumMonthly(revenue),
    totalCogs: sumMonthly(cogs),
    totalOverhead: sumMonthly(overhead),
    totalExpenses: sumMonthly(cogs) + sumMonthly(overhead),
    grossProfit,
    grossProfitTotal: sumMonthly(grossProfit),
    operatingProfit,
    operatingProfitTotal: sumMonthly(operatingProfit),
    talentPool,
    talentPoolTotal: sumMonthly(talentPool),
    netCashFlow,
    netCashFlowTotal: sumMonthly(netCashFlow),
    poolBase: opts.poolBase,
  };
};

export const formatCurrency = (n: number, opts?: { compact?: boolean; signed?: boolean }) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : opts?.signed && n > 0 ? "+" : "";
  if (opts?.compact && abs >= 1000) {
    const v = abs / 1000;
    return `${sign}$${v.toFixed(v >= 100 ? 0 : 1)}k`;
  }
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

export const formatPercent = (n: number, digits = 0) =>
  `${(n * 100).toFixed(digits)}%`;
