import { useState } from 'react';
import { ReactComponent as TrashIcon } from '../../svgs/trash.svg';
import { ReactComponent as XMarksIcon } from '../../svgs/x.svg';
import styles from './AddToFavModal.module.scss';
import { jsonTryParse } from '../../utils/utils';

export default function AddToFavModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (label: string | null) => void;
  onClose: () => void;
}) {
  const [labelHistory, setLabelHistory] = useState<string[]>(jsonTryParse(localStorage.getItem('label-history')) ?? []);
  const [label, setLabel] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedLabel = label.trim();
    onSubmit(trimmedLabel);

    if (trimmedLabel && !labelHistory.includes(trimmedLabel)) {
      updateHistory([...labelHistory, trimmedLabel]);
    }
  }

  function handleSelect(label: string) {
    onSubmit(label);
  }

  function updateHistory(history: string[]) {
    setLabelHistory(history);
    localStorage.setItem('label-history', JSON.stringify(history));
  }

  function handleDelete(label: string) {
    updateHistory(labelHistory.filter((curr) => curr !== label));
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          הוספה למועדפים
          <button className={styles.closeButton} onClick={onClose} type="button">
            <XMarksIcon />
          </button>
        </div>
        <form className={styles.body} onSubmit={handleAdd}>
          <label htmlFor="label">הזן תווית (לא חובה):</label>
          <input id="label" type="text" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
          {labelHistory.length > 0 && (
            <div className={styles.labelHistory}>
              <div className={styles.title}>תוויות אחרונות</div>
              {labelHistory.map((label) => (
                <div key={label} className={styles.entry}>
                  <button className={styles.labelButton} type="button" onClick={handleSelect.bind(null, label)}>
                    {label}
                  </button>
                  <button className={styles.deleteButton} type="button" onClick={handleDelete.bind(null, label)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.gutter}>
            <button className={styles.addButton} type="submit">
              הוספה
            </button>
            <button className={styles.cancelButton} type="button" onClick={onClose}>
              ביטול
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
