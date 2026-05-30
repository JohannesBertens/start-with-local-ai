import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Choice, NodeId, StoryNode } from '../content/types';
import { story } from '../content/story';
import {
  adventureReducer,
  initState,
  toPersisted,
} from './adventure';
import type { Theme } from './storage';
import { loadState, saveState } from './storage';

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

  const currentNode: StoryNode = story[state.currentNodeId];

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
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const toggleTheme = useCallback(
    () => dispatch({ type: 'toggleTheme' }),
    [],
  );

  const trail = useMemo(
    () =>
      state.history.map((id, index) => ({
        id,
        index,
        title: story[id]?.title ?? id,
        active: index === state.cursor,
      })),
    [state.history, state.cursor],
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
    reset,
    toggleTheme,
    theme: state.theme as Theme,
  };
}
