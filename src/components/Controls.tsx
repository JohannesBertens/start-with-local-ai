import { useState } from 'react';
import styles from './Controls.module.css';

interface Props {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onReset: () => void;
}

export function Controls({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onReset,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    if (confirming) {
      onReset();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.btn}
          onClick={onBack}
          disabled={!canGoBack}
        >
          ← Back
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={onForward}
          disabled={!canGoForward}
        >
          Forward →
        </button>
      </div>
      <button
        type="button"
        className={`${styles.btn} ${styles.reset} ${confirming ? styles.confirming : ''}`}
        onClick={handleReset}
      >
        {confirming ? 'Click again to reset' : 'Start over'}
      </button>
    </div>
  );
}
