/**
 * The aside-page registry.
 *
 * Add a new aside by:
 *   1. Creating a component in src/pages/YourPage.tsx
 *   2. Adding an entry to `asidePages` below with its route, label, icon SVG, and component
 *
 * The NavBar reads this registry to build its navigation items, and the PageShell
 * switches the main content area based on the current hash route.
 */

import type { ComponentType } from 'react';
import { AdventurePage } from './AdventurePage';
import { CalculatorPage } from './CalculatorPage';
import { GlossaryPage } from './GlossaryPage';

export interface AsidePageDef {
  /** Hash route path, e.g. "/adventure", "/calculator". */
  route: string;
  /** Human-readable label shown in the nav bar. */
  label: string;
  /** Inline SVG string (should be a simple 24x24 or 20x20 icon). */
  icon: string;
  /** The React component rendered for this page. */
  component: ComponentType;
}

export const asidePages: AsidePageDef[] = [
  {
    route: '/adventure',
    label: 'Adventure',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    component: AdventurePage,
  },
  {
    route: '/calculator',
    label: 'Calculator',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/></svg>`,
    component: CalculatorPage,
  },
  {
    route: '/glossary',
    label: 'Glossary',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>`,
    component: GlossaryPage,
  },
];

/** Look up a page definition by route path. */
export function pageForRoute(route: string): AsidePageDef | undefined {
  return asidePages.find((p) => p.route === route);
}
