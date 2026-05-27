export type MonthKey =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export const PROJECTED_MONTHS: MonthKey[] = [
  "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type MonthlyMap = Record<MonthKey, number>;

export const zeroMap = (): MonthlyMap => ({
  Jan: 0, Feb: 0, Mar: 0, Apr: 0,
  May: 0, Jun: 0, Jul: 0, Aug: 0,
  Sep: 0, Oct: 0, Nov: 0, Dec: 0,
});

const flat = (n: number): MonthlyMap => {
  const out = zeroMap();
  for (const m of PROJECTED_MONTHS) out[m] = n;
  return out;
};

const fromProjected = (vals: number[]): MonthlyMap => {
  const out = zeroMap();
  PROJECTED_MONTHS.forEach((m, i) => {
    out[m] = vals[i] ?? 0;
  });
  return out;
};

export type LineItemGroup = "revenue" | "direct" | "overhead" | "debt";

export type LineItem = {
  id: string;
  label: string;
  group: LineItemGroup;
  monthly: MonthlyMap;
};

// Default budget — owner-updated 2026 projection.
export const DEFAULT_BUDGET: LineItem[] = [
  { id: "rev_chronicle",  label: "Chronicle",  group: "revenue", monthly: fromProjected([10000, 0,     0,     0,      0,     0,     0,     0]) },
  { id: "rev_cep",        label: "CEP",        group: "revenue", monthly: fromProjected([20000, 0,     20000, 0,      20000, 0,     20000, 0]) },
  { id: "rev_kscope",     label: "Kscope",     group: "revenue", monthly: fromProjected([0,     0,     0,     0,      0,     0,     0,     0]) },
  { id: "rev_josh_levin", label: "Josh Levin", group: "revenue", monthly: fromProjected([42000, 0,     0,     0,      31500, 0,     31500, 0]) },
  { id: "rev_bu",         label: "BU",         group: "revenue", monthly: fromProjected([0,     0,     0,     12000,  0,     0,     0,     0]) },
  { id: "rev_wme",        label: "WME",        group: "revenue", monthly: fromProjected([0,     0,     0,     135000, 0,     0,     0,     0]) },

  { id: "dir_discretionary",  label: "Discretionary",      group: "direct", monthly: flat(500)  },
  { id: "dir_marketing",      label: "Marketing & Travel", group: "direct", monthly: flat(500)  },
  { id: "dir_ga",             label: "G&A",                group: "direct", monthly: flat(100)  },
  { id: "dir_contract_labor", label: "Contract Labor",     group: "direct", monthly: flat(8000) },
  { id: "dir_software_apps",  label: "Software & Apps",    group: "direct", monthly: flat(200)  },
  { id: "dir_health",         label: "Health Insurance",   group: "direct", monthly: flat(3500) },

  { id: "oh_insurance",   label: "Insurance",   group: "overhead", monthly: flat(1250) },
  { id: "oh_software",    label: "Software",    group: "overhead", monthly: flat(1250) },
  { id: "oh_legal",       label: "Legal",       group: "overhead", monthly: flat(1250) },
  { id: "oh_bookkeeping", label: "Bookkeeping", group: "overhead", monthly: flat(1250) },

  { id: "debt_service", label: "Debt Service", group: "debt", monthly: flat(5000) },
];

export type Member = {
  id: string;
  name: string;
  share: number;
};

export const DEFAULT_MEMBERS: Member[] = [
  { id: "john",  name: "John Perotti", share: 40 },
  { id: "erika", name: "Erika Lantz",  share: 30 },
  { id: "emily", name: "Emily Forman", share: 30 },
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

export type Calculation = {
  revenue: MonthlyMap;
  direct: MonthlyMap;
  overhead: MonthlyMap;
  debt: MonthlyMap;
  totalRevenue: number;
  totalDirect: number;
  totalOverhead: number;
  totalDebt: number;
  totalExpenses: number;
  freeCashFlow: MonthlyMap;
  freeCashFlowTotal: number;
  // Talent Profit Pool — never negative; losses carry forward to be
  // recovered out of the next positive month before any TPP is paid.
  talentPool: MonthlyMap;
  talentPoolTotal: number;
  carryBalance: MonthlyMap; // running balance at end of each month (<= 0 means deficit carrying forward)
  yearEndCarry: number;     // <= 0; deficit that didn't get recovered before Dec
};

export type CalcOptions = {
  budget: LineItem[];
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
  let direct = empty;
  let overhead = empty;
  let debt = empty;

  for (const item of opts.budget) {
    switch (item.group) {
      case "revenue":  revenue  = accMap(revenue,  item.monthly); break;
      case "direct":   direct   = accMap(direct,   item.monthly); break;
      case "overhead": overhead = accMap(overhead, item.monthly); break;
      case "debt":     debt     = accMap(debt,     item.monthly); break;
    }
  }

  for (const s of opts.scenarios) {
    revenue = accMap(revenue, scenarioToMonthly(s, "revenue"));
    direct = accMap(direct, scenarioToMonthly(s, "productionCost"));
  }

  const freeCashFlow = zeroMap();
  for (const m of PROJECTED_MONTHS) {
    freeCashFlow[m] = (revenue[m] || 0) - (direct[m] || 0) - (overhead[m] || 0) - (debt[m] || 0);
  }

  // Carry-forward TPP: losses recover out of the next positive month.
  const talentPool = zeroMap();
  const carryBalance = zeroMap();
  let balance = 0;
  for (const m of PROJECTED_MONTHS) {
    balance += freeCashFlow[m];
    if (balance > 0) {
      talentPool[m] = balance;
      balance = 0;
    } else {
      talentPool[m] = 0;
    }
    carryBalance[m] = balance;
  }

  return {
    revenue, direct, overhead, debt,
    totalRevenue: sumMonthly(revenue),
    totalDirect: sumMonthly(direct),
    totalOverhead: sumMonthly(overhead),
    totalDebt: sumMonthly(debt),
    totalExpenses: sumMonthly(direct) + sumMonthly(overhead) + sumMonthly(debt),
    freeCashFlow,
    freeCashFlowTotal: sumMonthly(freeCashFlow),
    talentPool,
    talentPoolTotal: sumMonthly(talentPool),
    carryBalance,
    yearEndCarry: balance,
  };
};

export type MemberDistribution = {
  member: Member;
  normalizedShare: number;
  amount: number;
};

export const distributePool = (pool: number, members: Member[]): MemberDistribution[] => {
  const sum = members.reduce((a, m) => a + Math.max(0, m.share), 0);
  return members.map((m) => {
    const share = Math.max(0, m.share);
    const normalized = sum > 0 ? share / sum : 0;
    return {
      member: m,
      normalizedShare: normalized,
      amount: pool > 0 ? pool * normalized : 0,
    };
  });
};

export type MemberEarnings = {
  member: Member;
  normalizedShare: number;
  monthly: MonthlyMap;
  total: number;
  avgMonthly: number;     // total / months in period (8)
  annualized: number;     // total × 12 / months in period
};

export const computeMemberEarnings = (
  members: Member[],
  tpp: MonthlyMap,
): MemberEarnings[] => {
  const shareSum = members.reduce((a, m) => a + Math.max(0, m.share), 0);
  const periodMonths = PROJECTED_MONTHS.length;
  return members.map((m) => {
    const normalized = shareSum > 0 ? Math.max(0, m.share) / shareSum : 0;
    const monthly = zeroMap();
    for (const k of PROJECTED_MONTHS) {
      monthly[k] = (tpp[k] || 0) * normalized;
    }
    const total = sumMonthly(monthly);
    const avgMonthly = total / periodMonths;
    const annualized = total * (12 / periodMonths);
    return { member: m, normalizedShare: normalized, monthly, total, avgMonthly, annualized };
  });
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
