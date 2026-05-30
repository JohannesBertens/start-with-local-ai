import type { AdventureFacts, Choice, NodeId } from '../content/types';
import { START_NODE } from '../content/types';
import type { PersistedState, Theme } from './storage';
import { defaultState, SCHEMA_VERSION } from './storage';

export interface AdventureState {
  currentNodeId: NodeId;
  /** Ordered list of visited nodes (the chosen path). */
  history: NodeId[];
  /** Position within `history` of the currently displayed node. */
  cursor: number;
  facts: AdventureFacts;
  theme: Theme;
}

export type AdventureAction =
  | { type: 'choose'; choice: Choice }
  | { type: 'advance'; to: NodeId }
  | { type: 'back' }
  | { type: 'forward' }
  | { type: 'jumpTo'; index: number }
  | { type: 'reset' }
  | { type: 'setTheme'; theme: Theme }
  | { type: 'toggleTheme' };

export function initState(persisted: PersistedState): AdventureState {
  const history =
    persisted.history.length > 0 ? persisted.history : [START_NODE];
  return {
    currentNodeId: persisted.currentNodeId,
    history,
    cursor: Math.max(0, history.indexOf(persisted.currentNodeId)),
    facts: persisted.facts,
    theme: persisted.theme,
  };
}

/**
 * Moves forward to a new node. If the user had stepped back and then chooses a
 * new branch, the now-divergent "future" portion of the path is discarded.
 */
function goToNew(
  state: AdventureState,
  to: NodeId,
  sets?: Partial<AdventureFacts>,
): AdventureState {
  const kept = state.history.slice(0, state.cursor + 1);

  // If advancing to the same node already next in path, just move the cursor.
  if (state.history[state.cursor + 1] === to) {
    return {
      ...state,
      currentNodeId: to,
      cursor: state.cursor + 1,
      facts: sets ? { ...state.facts, ...sets } : state.facts,
    };
  }

  const history = [...kept, to];
  return {
    ...state,
    currentNodeId: to,
    history,
    cursor: history.length - 1,
    facts: sets ? { ...state.facts, ...sets } : state.facts,
  };
}

export function adventureReducer(
  state: AdventureState,
  action: AdventureAction,
): AdventureState {
  switch (action.type) {
    case 'choose':
      return goToNew(state, action.choice.to, action.choice.sets);

    case 'advance':
      return goToNew(state, action.to);

    case 'back': {
      if (state.cursor === 0) return state;
      const cursor = state.cursor - 1;
      return { ...state, cursor, currentNodeId: state.history[cursor] };
    }

    case 'forward': {
      if (state.cursor >= state.history.length - 1) return state;
      const cursor = state.cursor + 1;
      return { ...state, cursor, currentNodeId: state.history[cursor] };
    }

    case 'jumpTo': {
      if (action.index < 0 || action.index >= state.history.length) {
        return state;
      }
      return {
        ...state,
        cursor: action.index,
        currentNodeId: state.history[action.index],
      };
    }

    case 'reset': {
      const fresh = defaultState();
      return {
        currentNodeId: fresh.currentNodeId,
        history: fresh.history,
        cursor: 0,
        facts: {},
        // Preserve the user's theme preference across a reset.
        theme: state.theme,
      };
    }

    case 'setTheme':
      return { ...state, theme: action.theme };

    case 'toggleTheme':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    default:
      return state;
  }
}

export function toPersisted(state: AdventureState): PersistedState {
  return {
    version: SCHEMA_VERSION,
    currentNodeId: state.currentNodeId,
    history: state.history,
    facts: state.facts,
    theme: state.theme,
  };
}
