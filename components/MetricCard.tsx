import { formatCurrency } from "@/lib/budget";

type Tone = "neutral" | "good" | "bad" | "brand";

type Props = {
  label: string;
  value: number;
  sublabel?: string;
  delta?: number; // optional change from baseline
  tone?: Tone;
  signed?: boolean;
  icon?: React.ReactNode;
};

const toneClasses: Record<Tone, string> = {
  neutral: "text-ink-900",
  good: "text-good-600",
  bad: "text-bad-600",
  brand: "text-brand-700",
};

export default function MetricCard({
  label, value, sublabel, delta, tone = "neutral", signed, icon,
}: Props) {
  const deltaTone = delta == null ? "" : delta > 0 ? "text-good-600 bg-good-500/10" : delta < 0 ? "text-bad-600 bg-bad-500/10" : "text-ink-500 bg-ink-100";
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-ink-500">{label}</div>
        {icon ? <div className="text-ink-400">{icon}</div> : null}
      </div>
      <div className={`mt-2 numeral text-3xl font-semibold ${toneClasses[tone]}`}>
        {formatCurrency(value, { signed })}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {sublabel ? <span className="text-ink-500">{sublabel}</span> : null}
        {delta != null && delta !== 0 ? (
          <span className={`chip ${deltaTone}`}>
            {delta > 0 ? "▲" : "▼"} {formatCurrency(Math.abs(delta), { compact: true })}
          </span>
        ) : null}
      </div>
    </div>
  );
}
