import { type CSSProperties, type FC, memo } from 'react';

import { isNumber } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  /** Genişlik: sayı px, dize doğrudan CSS değeri. */
  width?: number | string;
  height?: number | string;
  /** Metin satırı görünümü: yuvarlatılmış, satır yüksekliğinde. */
  variant?: 'block' | 'text' | 'circle';
  /** Kaç satır çizilecek (`text` için). */
  lines?: number;
  className?: string;
};

/**
 * Yükleme iskeleti.
 *
 * <h3>Neden dönen çark yerine iskelet</h3>
 * İskelet gelecek içeriğin <em>şeklini</em> gösterir; kullanıcı ne beklediğini
 * bilir ve içerik geldiğinde yerleşim kaymaz (CLS). Dönen bir çark hem konumu
 * hem boyutu belirsiz bırakır.
 *
 * <p>`aria-hidden`: ekran okuyucuya "yükleniyor" bilgisini veren, iskeletin
 * kendisi değil onu saran bölgenin `aria-busy` özelliğidir.
 */
const Skeleton: FC<Props> = ({ width, height, variant = 'block', lines = 1, className }) => {
  const style: CSSProperties = {
    width: isNumber(width) ? `${width}px` : width,
    height: isNumber(height) ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1)
    return (
      <span className={cx(styles.group, className)} aria-hidden>
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cx(styles.skeleton, styles['skeleton--text'])}
            // Son satır kısa: gerçek paragraflar tam genişlikte bitmez.
            style={index === lines - 1 ? { width: '60%' } : undefined}
          />
        ))}
      </span>
    );

  return (
    <span
      className={cx(styles.skeleton, styles[`skeleton--${variant}`], className)}
      style={style}
      aria-hidden
    />
  );
};

export default /*#__PURE__*/ memo(Skeleton) as typeof Skeleton;

type ShapeProps = {
  /** Kaç kopya çizilecek — bir listenin bilinen satır sayısı. */
  count?: number;
  className?: string;
};

/**
 * KART iskeleti — `Card` + `CardMedia` + iki satır metnin ölçüsü.
 *
 * <h3>Neden hazır biçimler</h3>
 * "İskelet yerleşimi kaydırmaz" sözü ancak iskelet gelecek içeriğin ÖLÇÜSÜNÜ
 * taşıyorsa doğru. Pratikte her çağıran ölçüyü gözle tahmin ediyordu ve
 * tahminler tutmuyordu: 180 px'lik bir görsel alanına 120 px'lik iskelet
 * konulunca içerik geldiğinde sayfa 60 px sıçrıyordu (CLS). Bu biçimler
 * ölçüyü gerçek bileşenlerden alıyor — `CardMedia`nın varsayılan oranı,
 * `$font-size-sm` satır yüksekliği, `Panel` dolgusu.
 */
const CardShape: FC<ShapeProps> = ({ count = 1, className }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className={cx(styles.card, className)} aria-hidden>
        <Skeleton className={styles.card__media} />
        <div className={styles.card__body}>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    ))}
  </>
);

/** SATIR iskeleti — avatar + iki metin satırı; liste satırlarının ölçüsü. */
const RowShape: FC<ShapeProps> = ({ count = 3, className }) => (
  <div className={cx(styles.rows, className)} aria-hidden>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className={styles.row}>
        <Skeleton variant="circle" width={36} height={36} />
        <div className={styles.row__text}>
          <Skeleton variant="text" width="45%" />
          <Skeleton variant="text" width="25%" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * TABLO iskeleti — `DataTable`ın satır yüksekliğinde.
 *
 * <p>Sütun genişlikleri EŞİT: gerçek genişlikler içeriğe göre değişiyor ve
 * onları taklit etmeye çalışmak, veri geldiğinde daha büyük bir sıçrama
 * üretiyordu. Eşit sütunlar "burada bir tablo olacak" der ve fazlasını vaat
 * etmez.
 */
const TableShape: FC<ShapeProps & { columns?: number }> = ({
  count = 5,
  columns = 4,
  className,
}) => (
  <div className={cx(styles.table, className)} aria-hidden>
    {Array.from({ length: count }, (_, rowIndex) => (
      <div key={rowIndex} className={styles.table__row}>
        {Array.from({ length: columns }, (_, columnIndex) => (
          <Skeleton key={columnIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCard = /*#__PURE__*/ named(/*#__PURE__*/ memo(CardShape), 'SkeletonCard');
export const SkeletonRows = /*#__PURE__*/ named(/*#__PURE__*/ memo(RowShape), 'SkeletonRows');
export const SkeletonTable = /*#__PURE__*/ named(/*#__PURE__*/ memo(TableShape), 'SkeletonTable');
