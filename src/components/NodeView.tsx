import type { Choice, StoryNode } from '../content/types';
import { ContentBlocks } from './ContentBlocks/ContentBlocks';
import styles from './NodeView.module.css';

interface Props {
  node: StoryNode;
  onChoose: (choice: Choice) => void;
  onAdvance: (to: string) => void;
}

export function NodeView({ node, onChoose, onAdvance }: Props) {
  return (
    <article className={styles.node} aria-live="polite">
      <h2 className={styles.title}>{node.title}</h2>
      <div className={styles.body}>
        <ContentBlocks blocks={node.body} />
      </div>

      {node.choices && node.choices.length > 0 ? (
        <ul className={styles.choices}>
          {node.choices.map((choice) => (
            <li key={choice.to + choice.label}>
              <button
                type="button"
                className={styles.choice}
                onClick={() => onChoose(choice)}
              >
                <span className={styles.choiceLabel}>{choice.label}</span>
                {choice.hint ? (
                  <span className={styles.choiceHint}>{choice.hint}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {node.next ? (
        <div className={styles.continueRow}>
          <button
            type="button"
            className={styles.continue}
            onClick={() => onAdvance(node.next as string)}
          >
            {node.nextLabel ?? 'Continue'} →
          </button>
        </div>
      ) : null}

      {node.terminal && !node.next ? (
        <p className={styles.endMark}>— end of this path —</p>
      ) : null}
    </article>
  );
}
