import { describe, it, expect } from 'vitest';
import {
  adventureReducer,
  initState,
  toPersisted,
  type AdventureState,
} from '../state/adventure';
import type { Choice } from '../content/types';
import { defaultState } from '../state/storage';

function freshState(): AdventureState {
  return initState(defaultState());
}

const toUseCase: Choice = {
  label: 'Chat',
  to: 'choose-os',
  sets: { useCase: 'chat' },
};
const toOs: Choice = { label: 'Linux', to: 'choose-hw-linux', sets: { os: 'linux' } };

describe('adventureReducer', () => {
  it('starts at the intro node', () => {
    const s = freshState();
    expect(s.currentNodeId).toBe('intro');
    expect(s.history).toEqual(['intro']);
    expect(s.cursor).toBe(0);
  });

  it('records facts and extends history on choose', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, {
      type: 'choose',
      choice: { label: 'Privacy', to: 'choose-usecase', sets: { reason: 'privacy' } },
    });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase });

    expect(s.currentNodeId).toBe('choose-os');
    expect(s.facts).toEqual({ reason: 'privacy', useCase: 'chat' });
    expect(s.history).toEqual(['intro', 'why-local', 'choose-usecase', 'choose-os']);
    expect(s.cursor).toBe(3);
  });

  it('moves the cursor with back and forward without losing history', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase });

    s = adventureReducer(s, { type: 'back' });
    expect(s.currentNodeId).toBe('why-local');
    expect(s.cursor).toBe(1);
    expect(s.history).toHaveLength(3);

    s = adventureReducer(s, { type: 'forward' });
    expect(s.currentNodeId).toBe('choose-os');
    expect(s.cursor).toBe(2);
  });

  it('does not go back past the start or forward past the end', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'back' });
    expect(s.cursor).toBe(0);
    s = adventureReducer(s, { type: 'forward' });
    expect(s.cursor).toBe(0);
  });

  it('truncates the future path when choosing a new branch after stepping back', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase }); // -> choose-os
    s = adventureReducer(s, { type: 'choose', choice: toOs }); // -> choose-hw-linux

    // Step back to choose-os and pick a different OS.
    s = adventureReducer(s, { type: 'back' });
    expect(s.currentNodeId).toBe('choose-os');

    s = adventureReducer(s, {
      type: 'choose',
      choice: { label: 'Windows', to: 'choose-hw-windows', sets: { os: 'windows' } },
    });

    expect(s.currentNodeId).toBe('choose-hw-windows');
    expect(s.history).toEqual([
      'intro',
      'why-local',
      'choose-os',
      'choose-hw-windows',
    ]);
    expect(s.facts.os).toBe('windows');
  });

  it('keeps the path when re-choosing the same next node', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase }); // -> choose-os
    s = adventureReducer(s, { type: 'back' }); // back to why-local
    s = adventureReducer(s, { type: 'choose', choice: toUseCase }); // same choice again

    expect(s.history).toEqual(['intro', 'why-local', 'choose-os']);
    expect(s.cursor).toBe(2);
  });

  it('jumps to a valid history index and ignores invalid ones', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase });

    s = adventureReducer(s, { type: 'jumpTo', index: 0 });
    expect(s.currentNodeId).toBe('intro');

    const before = s;
    s = adventureReducer(s, { type: 'jumpTo', index: 99 });
    expect(s).toBe(before);
  });

  it('exploreAlternate rewinds to a branch and takes a divergent edge, discarding the future', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase }); // -> choose-os (index 2)
    s = adventureReducer(s, { type: 'choose', choice: toOs }); // -> choose-hw-linux (index 3)

    // From the full path, explore a different OS at the choose-os node (index 2).
    s = adventureReducer(s, {
      type: 'exploreAlternate',
      index: 2,
      choice: { label: 'Windows', to: 'choose-hw-windows', sets: { os: 'windows' } },
    });

    expect(s.currentNodeId).toBe('choose-hw-windows');
    expect(s.history).toEqual([
      'intro',
      'why-local',
      'choose-os',
      'choose-hw-windows',
    ]);
    expect(s.cursor).toBe(3);
    expect(s.facts.os).toBe('windows');
  });

  it('exploreAlternate at a convergent fork keeps the downstream path and only swaps facts', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' }); // index 1
    s = adventureReducer(s, {
      type: 'choose',
      choice: { label: 'Privacy', to: 'choose-usecase', sets: { reason: 'privacy' } },
    }); // -> choose-usecase (index 2)
    s = adventureReducer(s, { type: 'choose', choice: toUseCase }); // -> choose-os (index 3)

    // Every reason converges on choose-usecase, so switching reason should not
    // discard the useCase/os progress that does not depend on it.
    s = adventureReducer(s, {
      type: 'exploreAlternate',
      index: 1,
      choice: { label: 'Cost', to: 'choose-usecase', sets: { reason: 'cost' } },
    });

    expect(s.facts.reason).toBe('cost');
    expect(s.currentNodeId).toBe('choose-usecase');
    expect(s.history).toEqual(['intro', 'why-local', 'choose-usecase', 'choose-os']);
    expect(s.cursor).toBe(2);
  });

  it('exploreAlternate ignores out-of-range indices', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    const before = s;
    s = adventureReducer(s, {
      type: 'exploreAlternate',
      index: 99,
      choice: toUseCase,
    });
    expect(s).toBe(before);
  });

  it('resets to a clean state but keeps the theme', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'setTheme', theme: 'dark' });
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    s = adventureReducer(s, { type: 'choose', choice: toUseCase });

    s = adventureReducer(s, { type: 'reset' });
    expect(s.currentNodeId).toBe('intro');
    expect(s.history).toEqual(['intro']);
    expect(s.facts).toEqual({});
    expect(s.theme).toBe('dark');
  });

  it('toggles the theme', () => {
    let s = freshState();
    const initial = s.theme;
    s = adventureReducer(s, { type: 'toggleTheme' });
    expect(s.theme).not.toBe(initial);
  });

  it('round-trips through toPersisted', () => {
    let s = freshState();
    s = adventureReducer(s, { type: 'advance', to: 'why-local' });
    const persisted = toPersisted(s);
    expect(persisted.currentNodeId).toBe('why-local');
    expect(persisted.history).toContain('why-local');
  });
});
