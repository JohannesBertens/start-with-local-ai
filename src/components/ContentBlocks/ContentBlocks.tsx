import { useState } from 'react';
import type { ContentBlock } from '../../content/types';
import styles from './ContentBlocks.module.css';

function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <figure className={styles.codeWrap}>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={copy}
        aria-label="Copy code to clipboard"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className={styles.code}>
        <code>{code}</code>
      </pre>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}

function Linkify({ text }: { text: string }) {
  // Turn bare URLs in prose into clickable links.
  const parts = text.split(/(https?:\/\/[^\s)]+)(?=[\s)]|$)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer noopener">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className={styles.paragraph}>
                <Linkify text={block.text} />
              </p>
            );
          case 'heading':
            return (
              <h3 key={i} className={styles.heading}>
                {block.text}
              </h3>
            );
          case 'list': {
            const items = block.items.map((item, j) => (
              <li key={j}>
                <Linkify text={item} />
              </li>
            ));
            return block.ordered ? (
              <ol key={i} className={styles.list}>
                {items}
              </ol>
            ) : (
              <ul key={i} className={styles.list}>
                {items}
              </ul>
            );
          }
          case 'code':
            return <CodeBlock key={i} code={block.code} caption={block.caption} />;
          case 'callout':
            return (
              <aside
                key={i}
                className={`${styles.callout} ${styles[block.tone ?? 'info']}`}
              >
                <Linkify text={block.text} />
              </aside>
            );
          case 'link':
            return (
              <p key={i} className={styles.paragraph}>
                <a href={block.href} target="_blank" rel="noreferrer noopener">
                  {block.label}
                </a>
              </p>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
