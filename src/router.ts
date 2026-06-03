import { useCallback, useSyncExternalStore } from 'react';

/**
 * A minimal hash router — no dependencies, works with Vite dev server and
 * static hosting with no fallback config needed.
 *
 * Routes are specified as `#/route-name`. The default/adventure route is `#/adventure`.
 * Parsing is just `location.hash.slice(1)` (with the leading `/` retained).
 */

export type Route = string;

function getHash(): Route {
  // Default to the adventure route when there is no hash, or the hash is bare "#".
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') return '/adventure';
  // Normalise: strip the leading '#' from location.hash so we get "/adventure".
  return hash.startsWith('#') ? hash.slice(1) : hash;
}

function setHash(route: Route) {
  // Push a new hash without creating an extra history entry for the default case.
  if (route === '/adventure' && !window.location.hash) return;
  window.location.hash = route;
}

function subscribeToHash(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

/**
 * Returns the current hash route as a reactive value.
 * Components re-render only when the hash changes.
 */
export function useHashRoute(): { route: Route; setRoute: (route: Route) => void } {
  const route = useSyncExternalStore(subscribeToHash, getHash);

  const setRoute = useCallback((r: Route) => {
    setHash(r);
  }, []);

  return { route, setRoute };
}
