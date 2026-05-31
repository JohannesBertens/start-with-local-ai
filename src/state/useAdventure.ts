import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type {
  AdventureFacts,
  Choice,
  NodeId,
  StoryNode,
} from '../content/types';
import { START_NODE } from '../content/types';
import { story } from '../content/story';
import {
  adventureReducer,
  initState,
  toPersisted,
} from './adventure';
import type { Theme } from './storage';
import { loadState, saveState } from './storage';

/** One edge out of a branch-point node, annotated for the breadcrumb DAG. */
export interface TrailBranch {
  label: string;
  to: NodeId;
  /** True when this is the edge the user actually followed. */
  taken: boolean;
  choice: Choice;
}

/** A visited node plus the branch decision (if any) made there. */
export interface TrailItem {
  id: NodeId;
  index: number;
  title: string;
  active: boolean;
  /** Choices at this node; empty for linear/leaf nodes and the current node. */
  branches: TrailBranch[];
}

/**
 * Was this choice the one taken on the current path? Destination alone is not
 * enough: several choices can converge on the same node (e.g. every "why local"
 * reason leads to `choose-level`). Each fork sets a distinct, discriminating
 * fact, so we additionally require the choice's defined `sets` to match the
 * accumulated facts.
 */
function isTakenChoice(
  choice: Choice,
  nextId: NodeId | undefined,
  facts: AdventureFacts,
): boolean {
  if (choice.to !== nextId) return false;
  const sets = choice.sets;
  if (!sets) return true;
  return (Object.keys(sets) as (keyof AdventureFacts)[]).every((key) => {
    const value = sets[key];
    return value === undefined || facts[key] === value;
  });
}

export function useAdventure() {
  const [state, dispatch] = useReducer(
    adventureReducer,
    undefined,
    () => initState(loadState()),
  );

  // Persist on every change.
  useEffect(() => {
    saveState(toPersisted(state));
  }, [state]);

  // Reflect theme on the document root.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Defensive guard: if persisted/tampered state points at a node that no longer
  // exists in the (catalog-built) graph, reset navigation to a known-good start.
  const resolvedNode = story[state.currentNodeId];
  useEffect(() => {
    if (!resolvedNode) dispatch({ type: 'reset' });
  }, [resolvedNode]);

  const currentNode: StoryNode = resolvedNode ?? story[START_NODE];

  const choose = useCallback(
    (choice: Choice) => dispatch({ type: 'choose', choice }),
    [],
  );
  const advance = useCallback(
    (to: NodeId) => dispatch({ type: 'advance', to }),
    [],
  );
  const goBack = useCallback(() => dispatch({ type: 'back' }), []);
  const goForward = useCallback(() => dispatch({ type: 'forward' }), []);
  const jumpTo = useCallback(
    (index: number) => dispatch({ type: 'jumpTo', index }),
    [],
  );
  const exploreAlternate = useCallback(
    (index: number, choice: Choice) =>
      dispatch({ type: 'exploreAlternate', index, choice }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const toggleTheme = useCallback(
    () => dispatch({ type: 'toggleTheme' }),
    [],
  );

  const trail = useMemo<TrailItem[]>(
    () =>
      state.history.map((id, index) => {
        const node = story[id];
        const nextId = state.history[index + 1];
        // Only annotate branches for nodes we have already moved past; the
        // current node's forward choices live in the main view, not here.
        const branches: TrailBranch[] =
          nextId !== undefined && node?.choices
            ? node.choices.map((choice) => ({
                label: choice.label,
                to: choice.to,
                taken: isTakenChoice(choice, nextId, state.facts),
                choice,
              }))
            : [];
        return {
          id,
          index,
          title: node?.title ?? id,
          active: index === state.cursor,
          branches,
        };
      }),
    [state.history, state.cursor, state.facts],
  );

  return {
    state,
    currentNode,
    trail,
    canGoBack: state.cursor > 0,
    canGoForward: state.cursor < state.history.length - 1,
    choose,
    advance,
    goBack,
    goForward,
    jumpTo,
    exploreAlternate,
    reset,
    toggleTheme,
    theme: state.theme as Theme,
  };
}
