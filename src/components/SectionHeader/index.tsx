import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  title: string;
  description?: string;
  /** Üstte gösterilen küçük büyük-harf etiket. */
  overline?: string;
  /** Sağda gösterilen eylem ("Tümünü gör"). */
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  testId?: string;
};

/**
 * Bölüm başlığı.
 *
 * <p>Başlık düzeyi (`as`) görsel boyuttan (`size`) <strong>ayrı</strong>:
 * sayfa hiyerarşisi anlamsal olmak zorunda ama görsel boyut bağlamla değişir.
 * İkisini birbirine bağlamak, doğru görünüm için yanlış başlık düzeyi seçmeye
 * zorlardı.
 */
const SectionHeader: FC<Props> = ({
  title,
  description,
  overline,
  action,
  as: Heading = 'h2',
  size = 'md',
  className,
  testId,
}) => (
  <header className={cx(styles.header, styles[`header--${size}`], className)} data-testid={testId}>
    <div className={styles.header__text}>
      {overline && <span className={styles.header__overline}>{overline}</span>}
      <Heading className={styles.header__title}>{title}</Heading>
      {description && <p className={styles.header__description}>{description}</p>}
    </div>

    {action && <div className={styles.header__action}>{action}</div>}
  </header>
);

export default memo(SectionHeader) as typeof SectionHeader;
