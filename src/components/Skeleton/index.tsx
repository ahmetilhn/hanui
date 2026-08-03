import { type CSSProperties, type FC, memo } from 'react';

import { isNumber } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';

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

export default memo(Skeleton) as typeof Skeleton;
