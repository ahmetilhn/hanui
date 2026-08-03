'use client';

import { memo, useId, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { StarFillIcon } from '../../icons';

import styles from './index.module.scss';

/** Beş puanın her birinin ne anlama geldiği. */
export type RatingLabels = Record<1 | 2 | 3 | 4 | 5, string>;

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  /** Grubun erişilebilir adı ("Ürün puanı"). */
  label: string;
  /**
   * Puan açıklamaları — ZORUNLU. Hem ekran okuyucuya okunur hem de seçildiğinde
   * yıldızların altında yazar.
   *
   * <p>Dolu yıldız sayısı tek başına bir renk/şekil sinyali. Yanına açıklama
   * yazmak hem anlamı netleştirir hem de renk körü kullanıcıya ikinci bir ipucu
   * verir (WCAG 1.4.1).
   */
  ratingLabels: RatingLabels;
  /** Ekran okuyucuda yıldız sayısını okuyan biçimlendirici ("4 yıldız"). */
  formatStarCount: (star: number) => string;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
};

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Yıldızla puan girişi.
 *
 * <h3>Beş gerçek radyo düğmesi</h3>
 * Yıldızlar `<span>` ile çizilip tıklama JavaScript'e bağlanabilirdi. Bunun
 * yerine `<fieldset>` içinde beş yerel `<input type="radio">` kullanılır ve
 * yıldız görünümü etiketlerine verilir. Böylece ok tuşlarıyla gezinme, Tab
 * davranışı, ekran okuyucuda "5 seçenekten 4'ü seçili" duyurusu ve form
 * gönderimine katılma <em>bedava</em> gelir.
 *
 * <p>{@link Rating} genişletilemez: o `<span>` üretiyor ve açıkça
 * salt-gösterim. İkisini tek bileşende toplamak, gösterim tarafına hiç
 * kullanılmayan etkileşim kodu taşımak olurdu.
 */
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
            <StarFillIcon />
            <span className={styles.rating__srOnly}>
              {formatStarCount(star)} — {ratingLabels[star]}
            </span>
          </label>
        ))}
      </div>

      {/* Secim metni: `aria-hidden` cunku ayni bilgi radyonun etiketinde var. */}
      {shown !== null && (
        <span className={styles.rating__caption} aria-hidden>
          {ratingLabels[shown as 1 | 2 | 3 | 4 | 5]}
        </span>
      )}
    </fieldset>
  );
};

export default memo(RatingInput) as typeof RatingInput;
