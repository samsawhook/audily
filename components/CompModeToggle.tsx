"use client";

import type { CompMode } from "@/lib/budget";

type Props = {
  value: CompMode;
  onChange: (v: CompMode) => void;
};

export default function CompModeToggle({ value, onChange }: Props) {
  const opts: { id: CompMode; label: string; sub: string }[] = [
    { id: "tpp", label: "TPP", sub: "Profit pool" },
    { id: "salary", label: "Salary", sub: "Fixed comp" },
  ];

  return (
    <div className="inline-flex rounded-full bg-white border border-paper-300 p-1 shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              active
                ? "bg-brand-500 text-white shadow-[0_1px_2px_rgba(244,115,105,0.4)]"
                : "text-ink-500 hover:text-ink-900"
            }`}
          >
            <span>{o.label}</span>
            <span className={`ml-2 text-[10px] font-normal ${active ? "text-white/80" : "text-ink-400"}`}>
              {o.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
