"use client";

import { useState } from "react";
import type { Save, SaveState, Visibility } from "@/lib/saves";
import { buildShareUrl } from "@/lib/saves";

type Props = {
  open: boolean;
  onClose: () => void;
  saves: Save[];
  currentState: SaveState;
  onSave: (name: string, visibility: Visibility) => void;
  onLoad: (save: Save) => void;
  onDelete: (id: string) => void;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

export default function SavesPanel({
  open, onClose, saves, onSave, onLoad, onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), visibility);
    setName("");
  };

  const copyShareLink = async (save: Save) => {
    try {
      const url = buildShareUrl(save.state, save.name);
      await navigator.clipboard.writeText(url);
      setCopiedId(save.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-[440px] bg-paper-50 shadow-2xl h-full flex flex-col">
        <header className="flex items-center justify-between p-5 border-b border-paper-300 bg-white">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Saves</h2>
            <p className="text-[11px] text-ink-500">Snapshots of the whole budget · members · mode</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-100"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <section className="p-5 border-b border-paper-300 bg-white space-y-3">
          <div className="text-xs font-semibold text-ink-700">Save current view</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 with WME locked in"
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            className="w-full rounded-lg border border-paper-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <VisibilityButton
              active={visibility === "private"}
              onClick={() => setVisibility("private")}
              title="Private"
              sub="This device only"
            />
            <VisibilityButton
              active={visibility === "public"}
              onClick={() => setVisibility("public")}
              title="Public"
              sub="Share by link"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Save snapshot
          </button>
          <p className="text-[11px] text-ink-500">
            {visibility === "private"
              ? "Stored on this device only — nobody else can see it."
              : "Stored here, plus you'll get a shareable URL. Anyone with the URL loads the same state."}
          </p>
        </section>

        <section className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="text-xs font-semibold text-ink-700 mb-1">Your saves ({saves.length})</div>
          {saves.length === 0 ? (
            <p className="text-sm text-ink-500 mt-3">No saves yet. The first one starts the list.</p>
          ) : (
            saves.map((save) => (
              <div key={save.id} className="rounded-xl border border-paper-300 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink-900 truncate">{save.name}</div>
                    <div className="text-[11px] text-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{fmtDate(save.savedAt)}</span>
                      <span className={`chip ${save.visibility === "public" ? "bg-brand-100 text-brand-700" : "bg-paper-200 text-ink-600"}`}>
                        {save.visibility === "public" ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => onLoad(save)}
                    className="flex-1 rounded-md bg-ink-900 hover:bg-ink-700 text-white px-3 py-1.5 text-xs font-medium transition"
                  >
                    Load
                  </button>
                  {save.visibility === "public" ? (
                    <button
                      onClick={() => copyShareLink(save)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                        copiedId === save.id
                          ? "border-good-500 text-good-600 bg-good-500/10"
                          : "border-paper-300 hover:bg-paper-100 text-ink-700"
                      }`}
                    >
                      {copiedId === save.id ? "Copied" : "Copy link"}
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${save.name}"?`)) onDelete(save.id);
                    }}
                    className="rounded-md border border-paper-300 hover:border-bad-500 hover:bg-bad-500/10 hover:text-bad-600 text-ink-500 px-3 py-1.5 text-xs font-medium transition"
                    aria-label="Delete save"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="px-5 py-3 border-t border-paper-300 bg-white text-[11px] text-ink-500">
          Public sharing uses URL hash · centralized public listing needs a backend
        </footer>
      </aside>
    </div>
  );
}

function VisibilityButton({
  active, onClick, title, sub,
}: { active: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-left transition ${
        active
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-paper-300 bg-white text-ink-700 hover:border-ink-400"
      }`}
    >
      <div className="text-xs font-semibold">{title}</div>
      <div className="text-[10px] text-ink-500 mt-0.5">{sub}</div>
    </button>
  );
}
