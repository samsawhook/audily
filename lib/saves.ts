import type { CompMode, LineItem, Member, ScenarioProject } from "./budget";

export type Visibility = "private" | "public";

export type SaveState = {
  budget: LineItem[];
  members: Member[];
  scenarios: ScenarioProject[];
  compMode: CompMode;
};

export type Save = {
  id: string;
  name: string;
  savedAt: string; // ISO timestamp
  visibility: Visibility;
  state: SaveState;
};

const SAVES_KEY = "rococopunch.saves.v1";

const newId = (): string =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const isValidSave = (s: unknown): s is Save => {
  if (!s || typeof s !== "object") return false;
  const v = s as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.savedAt === "string" &&
    (v.visibility === "private" || v.visibility === "public") &&
    typeof v.state === "object"
  );
};

export const loadSaves = (): Save[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidSave);
  } catch {
    return [];
  }
};

export const writeSaves = (saves: Save[]) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SAVES_KEY, JSON.stringify(saves)); } catch {}
};

export const createSave = (
  name: string,
  visibility: Visibility,
  state: SaveState,
): Save => ({
  id: newId(),
  name: (name || "Untitled").trim().slice(0, 80),
  savedAt: new Date().toISOString(),
  visibility,
  state,
});

// URL-safe base64 that survives unicode
const urlSafeB64Encode = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const urlSafeB64Decode = (s: string): string => {
  let str = s.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

export const encodeStateForUrl = (state: SaveState): string =>
  urlSafeB64Encode(JSON.stringify(state));

export const decodeStateFromUrl = (s: string): SaveState | null => {
  try {
    const parsed = JSON.parse(urlSafeB64Decode(s));
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as SaveState;
  } catch {
    return null;
  }
};

export const buildShareUrl = (state: SaveState, name?: string): string => {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();
  if (name) params.set("n", name);
  params.set("s", encodeStateForUrl(state));
  url.hash = params.toString();
  return url.toString();
};

export type SharedPayload = { state: SaveState; name?: string };

export const readSharedFromUrl = (): SharedPayload | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const s = params.get("s");
  if (!s) return null;
  const state = decodeStateFromUrl(s);
  if (!state) return null;
  return { state, name: params.get("n") || undefined };
};

export const clearUrlHash = () => {
  if (typeof window === "undefined") return;
  try {
    history.replaceState(null, "", window.location.pathname);
  } catch {}
};
