import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import { ChevronRightIcon } from '../../icons';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

export type Crumb = {
  label: string;
  /** Son öğede verilmez: bulunduğumuz sayfa bağlantı olmaz. */
  href?: string;
};

type Props = {
  items: Crumb[];
  /** Gezinme bölgesinin erişilebilir adı. Verilmezse `labels.breadcrumb`. */
  label?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  className?: string;
  testId?: string;
};

/**
 * Kırıntı yolu.
 *
 * <p>Son öğe bağlantı DEĞİL ve `aria-current="page"` taşır: bulunduğu sayfaya
 * bağlantı veren bir kırıntı yolu, ekran okuyucu kullanıcısını yanıltır.
 *
 * <p>Ayırıcı ikon `aria-hidden`; ekran okuyucu liste yapısından hiyerarşiyi
 * zaten anlar.
 */
const Breadcrumb: FC<Props> = ({ items, label, linkProps, className, testId }) => {
  const { labels } = useHanui();

  return (
    <nav
      className={className}
      aria-label={resolveLabel('Breadcrumb.label', label, labels?.breadcrumb)}
      data-testid={testId}
    >
      <ol className={cx(styles.breadcrumb)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className={styles.breadcrumb__item}>
              {item.href && !isLast ? (
                <HanuiLink href={item.href} className={styles.breadcrumb__link} {...linkProps}>
                  {item.label}
                </HanuiLink>
              ) : (
                <span className={styles.breadcrumb__current} aria-current="page">
                  {item.label}
                </span>
              )}

              {!isLast && <ChevronRightIcon className={styles.breadcrumb__separator} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default memo(Breadcrumb) as typeof Breadcrumb;
