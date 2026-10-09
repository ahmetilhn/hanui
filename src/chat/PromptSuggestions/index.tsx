import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type PromptSuggestion = {
  id: string;
  /** Gönderilecek istem ya da kısa adı. */
  label: string;
  /** İkinci satır — neyi sorduğu. */
  description?: string;
};

type Props = {
  /** Grubun erişilebilir adı ("Örnek istemler"). */
  label: string;
  items: PromptSuggestion[];
  onPick: (item: PromptSuggestion) => void;
  className?: string;
  testId?: string;
};

/**
 * Hazır istem önerileri — boş sohbetin başlangıç kartları.
 *
 * ⚠ Bunlar EYLEM, seçim değil: `ChipGroup` (seçim) yerine düğme ızgarası. Basmak bir şey seçmez,
 * istemi gönderir ya da yazma alanına koyar.
 */
const PromptSuggestions: FC<Props> = ({ label, items, onPick, className, testId }) => (
  <div role="group" aria-label={label} className={cx(styles.grid, className)} data-testid={testId}>
    {items.map(item => (
      <button key={item.id} type="button" className={styles.card} onClick={() => onPick(item)}>
        <span className={styles.card__label}>{item.label}</span>
        {item.description && <span className={styles.card__description}>{item.description}</span>}
      </button>
    ))}
  </div>
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(PromptSuggestions, 'PromptSuggestions'),
) as typeof PromptSuggestions;
