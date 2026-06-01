import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadState,
  saveState,
  clearState,
  defaultState,
  STORAGE_KEY,
  SCHEMA_VERSION,
  type PersistedState,
} from '../state/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default state when nothing is stored', () => {
    const s = loadState();
    expect(s.currentNodeId).toBe('intro');
    expect(s.history).toEqual(['intro']);
    expect(s.facts).toEqual({});
  });

  it('round-trips a saved state', () => {
    const state: PersistedState = {
      version: SCHEMA_VERSION,
      currentNodeId: 'choose-os',
      history: ['intro', 'why-local', 'choose-usecase', 'choose-os'],
      facts: { reason: 'privacy', useCase: 'chat' },
      theme: 'dark',
    };
    saveState(state);
    const loaded = loadState();
    expect(loaded).toEqual(state);
  });

  it('falls back to defaults on corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    const s = loadState();
    expect(s.currentNodeId).toBe('intro');
  });

  it('falls back to defaults on an invalid shape', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, currentNodeId: 123 }),
    );
    const s = loadState();
    expect(s.currentNodeId).toBe('intro');
  });

  it('resets content but preserves theme on schema version mismatch', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 999,
        currentNodeId: 'somewhere',
        history: ['somewhere'],
        facts: { reason: 'cost' },
        theme: 'dark',
      }),
    );
    const s = loadState();
    expect(s.currentNodeId).toBe('intro');
    expect(s.facts).toEqual({});
    expect(s.theme).toBe('dark');
  });

  it('clears stored state', () => {
    saveState(defaultState());
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    clearState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
