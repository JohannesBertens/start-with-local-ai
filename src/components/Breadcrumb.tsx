import { useId, useState } from 'react';
import type { Choice } from '../content/types';
import type { TrailItem } from '../state/useAdventure';
import styles from './Breadcrumb.module.css';

interface Props {
  trail: TrailItem[];
  onJump: (index: number) => void;
  onExplore: (index: number, choice: Choice) => void;
}

/**
 * A minimal breadcrumb that, by default, collapses the whole path to
 * `root › … › current`. Expanding it reveals the trail as a small DAG: a
 * vertical spine of the nodes you visited, with each branch point showing the
 * edge you took (✓) alongside the alternatives you didn't — clickable to
 * rewind and explore that branch instead.
 */
export function Breadcrumb({ trail, onJump, onExplore }: Props) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  if (trail.length <= 1) return null;

  const first = trail[0];
  const current = trail[trail.length - 1];
  const hasMiddle = trail.length > 2;

  const handleExplore = (index: number, choice: Choice) => {
    onExplore(index, choice);
    // Collapse so attention returns to the freshly chosen path/content.
    setExpanded(false);
  };

  return (
    <nav className={styles.trail} aria-label="Your path so far">
      {!expanded ? (
        <button
          type="button"
          className={styles.summary}
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          aria-controls={regionId}
        >
          <span className={styles.crumbText}>{first.title}</span>
          <span aria-hidden="true" className={styles.sep}>
            ›
          </span>
          {hasMiddle ? (
            <>
              <span className={styles.ellipsis} aria-hidden="true">
                …
              </span>
              <span className={styles.sep} aria-hidden="true">
                ›
              </span>
              <span className={styles.srOnly}>
                {trail.length - 2} earlier steps,
              </span>
            </>
          ) : null}
          <span className={`${styles.crumbText} ${styles.current}`}>
            {current.title}
          </span>
          <span aria-hidden="true" className={styles.chevron}>
            ⌄
          </span>
        </button>
      ) : (
        <div id={regionId} className={styles.expanded}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setExpanded(false)}
            aria-expanded
            aria-controls={regionId}
          >
            <span aria-hidden="true" className={styles.chevronUp}>
              ⌃
            </span>
            Hide path
          </button>

          <ol className={styles.tree}>
            {trail.map((item) => (
              <li key={item.id + item.index} className={styles.step}>
                <button
                  type="button"
                  className={`${styles.node} ${item.active ? styles.active : ''}`}
                  onClick={() => onJump(item.index)}
                  aria-current={item.active ? 'step' : undefined}
                >
                  {item.title}
                </button>

                {item.branches.length > 0 ? (
                  <ul className={styles.branches}>
                    {item.branches.map((branch) =>
                      branch.taken ? (
                        <li
                          key={branch.to + branch.label}
                          className={`${styles.branch} ${styles.taken}`}
                        >
                          <span aria-hidden="true" className={styles.tick}>
                            ✓
                          </span>
                          <span>{branch.label}</span>
                          <span className={styles.srOnly}> (your choice)</span>
                        </li>
                      ) : (
                        <li
                          key={branch.to + branch.label}
                          className={styles.branch}
                        >
                          <button
                            type="button"
                            className={styles.alt}
                            onClick={() =>
                              handleExplore(item.index, branch.choice)
                            }
                          >
                            <span aria-hidden="true" className={styles.altMark}>
                              ↳
                            </span>
                            <span>{branch.label}</span>
                            <span className={styles.srOnly}>
                              {' '}
                              — explore this path instead
                            </span>
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}
    </nav>
  );
}
