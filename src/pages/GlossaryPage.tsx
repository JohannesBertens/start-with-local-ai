import { useState, useMemo, useId, useRef, useEffect } from 'react';
import { glossary, type GlossaryEntry } from '../content/glossary';
import styles from './GlossaryPage.module.css';

const entries = Object.values(glossary).sort((a, b) => a.label.localeCompare(b.label));

export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(entries.map((e) => e.term)),
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const lower = query.toLowerCase();
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(lower) ||
        e.label.toLowerCase().includes(lower) ||
        e.definition.toLowerCase().includes(lower) ||
        (e.detail && e.detail.toLowerCase().includes(lower)),
    );
  }, [query]);

  const toggleExpand = (term: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setExpanded(new Set());
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Glossary</h1>
        <p className={styles.pageSubtitle}>
          Terms and concepts from the local AI ecosystem, gathered from the adventure content.
        </p>
      </header>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          ref={searchRef}
          id="glossary-search"
          className={styles.search}
          type="search"
          placeholder="Search terms…"
          value={query}
          onChange={handleSearchChange}
          aria-label="Search glossary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          No terms match "{query}". Try a broader search.
        </p>
      ) : (
        <ul className={styles.list} aria-label="Glossary entries" id={listId}>
          {filtered.map((entry) => (
            <GlossaryItem
              key={entry.term}
              entry={entry}
              expanded={expanded.has(entry.term)}
              onToggle={() => toggleExpand(entry.term)}
            />
          ))}
        </ul>
      )}

      <p className={styles.count}>
        {filtered.length} of {entries.length} term{entries.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function GlossaryItem({
  entry,
  expanded,
  onToggle,
}: {
  entry: GlossaryEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const termId = `glossary-term-${entry.term}`;
  const defId = `glossary-def-${entry.term}`;

  return (
    <li className={styles.item}>
      <button
        type="button"
        className={styles.termBtn}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={defId}
        id={termId}
      >
        <span className={styles.termLabel}>{entry.label}</span>
        <span className={styles.chevron} aria-hidden="true">
          {expanded ? '⌃' : '⌄'}
        </span>
      </button>

      <p className={styles.definition} id={defId} role="region" aria-labelledby={termId}>
        {entry.definition}
      </p>

      {expanded && (
        <div className={styles.detail}>
          {entry.detail && (
            <div className={styles.detailBody}>
              {entry.detail.split('\n').map((line, i) => (
                <p key={i} className={styles.detailPara}>{line}</p>
              ))}
            </div>
          )}

          {entry.seeAlso && entry.seeAlso.length > 0 && (
            <p className={styles.seeAlso}>
              <strong>See also: </strong>
              {entry.seeAlso
                .map((slug) => glossary[slug])
                .filter(Boolean)
                .map((ref, i, arr) => (
                  <span key={ref.term}>
                    <a
                      href={`#glossary-term-${ref.term}`}
                      className={styles.seeLink}
                      onClick={(e) => {
                        e.preventDefault();
                        // Scroll to the term and expand it
                        const el = document.getElementById(`glossary-term-${ref.term}`);
                        if (el) {
                          el.closest('li')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.click();
                        }
                      }}
                    >
                      {ref.label}
                    </a>
                    {i < arr.length - 1 ? ', ' : ''}
                  </span>
                ))}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
