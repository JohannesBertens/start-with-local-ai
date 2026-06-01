import type { AdventureFacts, NodeId } from '../content/types';
import { START_NODE } from '../content/types';

export type Theme = 'light' | 'dark';

export interface PersistedState {
  version: number;
  currentNodeId: NodeId;
  history: NodeId[];
  facts: AdventureFacts;
  theme: Theme;
}

export const STORAGE_KEY = 'swla:v1';
// Bump when the persisted shape or node-id scheme changes so returning users do
// not land on a node id that no longer exists in the (now catalog-built) graph.
export const SCHEMA_VERSION = 3;

export function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function defaultState(): PersistedState {
  return {
    version: SCHEMA_VERSION,
    currentNodeId: START_NODE,
    history: [START_NODE],
    facts: {},
    theme: prefersDark() ? 'dark' : 'light',
  };
}

function isValidShape(value: unknown): value is PersistedState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.currentNodeId === 'string' &&
    Array.isArray(v.history) &&
    v.history.every((h) => typeof h === 'string') &&
    typeof v.facts === 'object' &&
    v.facts !== null &&
    (v.theme === 'light' || v.theme === 'dark')
  );
}

/** Loads persisted state, falling back to defaults on any error or schema mismatch. */
export function loadState(): PersistedState {
  try {
    const raw =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (!raw) return defaultState();

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as Record<string, unknown>).version !== SCHEMA_VERSION
    ) {
      // Schema changed: keep the theme preference if present, reset the rest.
      const fallback = defaultState();
      const maybeTheme = (parsed as Record<string, unknown>).theme;
      if (maybeTheme === 'light' || maybeTheme === 'dark') {
        fallback.theme = maybeTheme;
      }
      return fallback;
    }

    if (!isValidShape(parsed)) return defaultState();
    return { ...defaultState(), ...parsed, version: SCHEMA_VERSION };
  } catch {
    return defaultState();
  }
}

export function saveState(state: PersistedState): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode / quota); fail silently */
  }
}

export function clearState(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
