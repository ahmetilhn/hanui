import { type FC, memo } from 'react';

import { isDefined } from '@ahmetilhn/handy-utils';

import { StarFill, StarHalf } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveFormatter } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  /** 0–5 arası puan. Yarım yıldız desteklenir. */
  value: number;
  /** Değerlendirme sayısı; verilirse yıldızların yanında gösterilir. */
  count?: number;
  /**
   * Ekran okuyucuya okunan metin.
   *
   * <p>Yıldızlar `aria-hidden`: beş ayrı ikonu tek tek duyurmak anlamsız.
   * Yerine bir cümle okunur ("5 üzerinden 4,5 — 12 değerlendirme") ve o cümle
   * hem dile hem sayı biçimine bağlı; kütüphane onu uyduramaz.
   *
   * <p>Verilmezse `labels.rating.srLabel(value, count)` çağrılır — cümle
   * değere bağlı olduğu için config bir DİZE değil bir biçimlendirici tutar.
   */
  srLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/**
 * Yıldız puanı — salt gösterim.
 *
 * <p>Ortalama sunucuda hesaplanır; burada yalnızca gösterilir. Puanı
 * istemcide hesaplamak, sayfalama yüzünden eksik veriyle yanlış ortalama
 * üretirdi.
 *
 * <p>Etkileşimli kardeşi {@link RatingInput}.
 */
const Rating: FC<Props> = ({ value, count, srLabel, size = 'sm', className, testId }) => {
  const { labels } = useHanui();
  const rounded = Math.round(value * 2) / 2;

  return (
    <span className={cx(styles.rating, styles[`rating--${size}`], className)} data-testid={testId}>
      {/*
       * BOS YILDIZ DA DOLU — farkı renk taşır (`rating__empty`), çizgi değil.
       *
       * <p>İçi boş yıldız yalnızca bir konturdur: dolu komşusunun yanında
       * "eksik çizilmiş" gibi durur ve küçük boyda kontur tek piksele inip
       * kayboluyordu. Aynı gövde + soluk ton, beş yıldızın silüetini bozmadan
       * doluluğu okutur.
       */}
      <span className={styles.rating__stars} aria-hidden>
        {Array.from({ length: 5 }, (_, index) => {
          const position = index + 1;
          if (rounded >= position) return <StarFill key={index} />;
          if (rounded >= position - 0.5) return <StarHalf key={index} />;
          return <StarFill key={index} className={styles.rating__empty} />;
        })}
      </span>

      <span className={styles.rating__srOnly}>
        {srLabel ?? resolveFormatter('Rating.srLabel', labels?.rating?.srLabel, value, count)}
      </span>

      {isDefined(count) && (
        <span className={styles.rating__count} aria-hidden>
          ({count})
        </span>
      )}
    </span>
  );
};

export default /*#__PURE__*/ memo(Rating) as typeof Rating;
