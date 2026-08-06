'use client';

import { memo, useId, useState } from 'react';

import { StarFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveFormatter } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

/** Beş puanın her birinin ne anlama geldiği. */
export type RatingLabels = Record<1 | 2 | 3 | 4 | 5, string>;

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  /** Grubun erişilebilir adı ("Ürün puanı"). */
  label: string;
  /**
   * Puan açıklamaları. Hem ekran okuyucuya okunur hem de seçildiğinde
   * yıldızların altında yazar. Verilmezse `labels.rating.scale`.
   */
  ratingLabels?: RatingLabels;
  /**
   * Ekran okuyucuda yıldız sayısını okuyan biçimlendirici ("4 yıldız").
   * Verilmezse `labels.rating.starCount`.
   */
  formatStarCount?: (star: number) => string;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
};

const STARS = [1, 2, 3, 4, 5] as const;

/** Yıldızla puan girişi. */
const RatingInput = ({
  value,
  onChange,
  label,
  ratingLabels,
  formatStarCount,
  isDisabled,
  className,
  testId,
}: Props) => {
  const { labels } = useHanui();
  const scale = ratingLabels ?? labels?.rating?.scale;
  const name = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  // Fare yildizlarin uzerindeyken onizleme gosterilir; ayrilinca gercek
  // secime doner.
  const shown = hovered ?? value;

  return (
    <fieldset
      className={cx(styles.rating, isDisabled && styles['rating--disabled'], className)}
      disabled={isDisabled}
      data-testid={testId}
    >
      <legend className={styles.rating__legend}>{label}</legend>

      <div className={styles.rating__stars} onMouseLeave={() => setHovered(null)}>
        {STARS.map(star => (
          <label
            key={star}
            className={cx(
              styles.rating__star,
              shown !== null && star <= shown && styles['rating__star--filled'],
            )}
            onMouseEnter={() => setHovered(star)}
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className={styles.rating__input}
            />
            <StarFill aria-hidden />
            <span className={styles.rating__srOnly}>
              {resolveFormatter(
                'RatingInput.formatStarCount',
                formatStarCount ?? labels?.rating?.starCount,
                star,
              )}{' '}
              — {scale?.[star] ?? ''}
            </span>
          </label>
        ))}
      </div>

      {/* Secim metni: `aria-hidden` cunku ayni bilgi radyonun etiketinde var. */}
      {shown !== null && (
        <span className={styles.rating__caption} aria-hidden>
          {scale?.[shown as 1 | 2 | 3 | 4 | 5] ?? ''}
        </span>
      )}
    </fieldset>
  );
};

export default /*#__PURE__*/ memo(RatingInput) as typeof RatingInput;
