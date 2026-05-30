import styles from './Breadcrumb.module.css';

export interface TrailItem {
  id: string;
  index: number;
  title: string;
  active: boolean;
}

interface Props {
  trail: TrailItem[];
  onJump: (index: number) => void;
}

export function Breadcrumb({ trail, onJump }: Props) {
  if (trail.length <= 1) return null;

  return (
    <nav className={styles.trail} aria-label="Your path so far">
      <ol className={styles.list}>
        {trail.map((item) => (
          <li key={item.id + item.index} className={styles.item}>
            <button
              type="button"
              className={`${styles.crumb} ${item.active ? styles.active : ''}`}
              onClick={() => onJump(item.index)}
              aria-current={item.active ? 'step' : undefined}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
