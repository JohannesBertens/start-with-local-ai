import type { Route } from '../router';
import { asidePages, type AsidePageDef } from '../pages/registry';
import styles from './NavBar.module.css';

interface Props {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

function NavItem({ page, active, onNavigate }: { page: AsidePageDef; active: boolean; onNavigate: (route: Route) => void }) {
  return (
    <button
      type="button"
      className={`${styles.item} ${active ? styles.active : ''}`}
      onClick={() => onNavigate(page.route)}
      aria-current={active ? 'page' : undefined}
      title={page.label}
    >
      <span
        className={styles.icon}
        dangerouslySetInnerHTML={{ __html: page.icon }}
        aria-hidden="true"
      />
      <span className={styles.label}>{page.label}</span>
    </button>
  );
}

export function NavBar({ currentRoute, onNavigate }: Props) {
  return (
    <nav className={styles.bar} aria-label="Main navigation">
      {asidePages.map((page) => (
        <NavItem
          key={page.route}
          page={page}
          active={currentRoute === page.route}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
