import { useEffect, useRef } from 'react';
import type { ChoiceInfo } from '../content/types';
import { ContentBlocks } from './ContentBlocks/ContentBlocks';
import styles from './InfoModal.module.css';

interface Props {
  info: ChoiceInfo;
  onClose: () => void;
}

/** A lightweight, accessible modal that reveals a choice's background info. */
export function InfoModal({ info, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape; move focus into the dialog when it opens.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="info-modal-title" className={styles.title}>
            {info.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className={styles.body}>
          <ContentBlocks blocks={info.body} />
        </div>
      </div>
    </div>
  );
}
