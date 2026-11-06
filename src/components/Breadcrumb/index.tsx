'use client';

import { type FC, memo } from 'react';

import { CaretRightFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useUi } from '../../theme/context';
import type { UiLinkExtraProps } from '../../types/link.type';
import UiLink from '../Link';

import styles from './index.module.scss';

export type Crumb = {
  label: string;
  /** Son öğede verilmez: bulunduğumuz sayfa bağlantı olmaz. */
  href?: string;
};

type Props = {
  items: Crumb[];
  /** Gezinme bölgesinin erişilebilir adı. */
  label?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: UiLinkExtraProps;
  className?: string;
  testId?: string;
};

/** Kırıntı yolu. */
const Breadcrumb: FC<Props> = ({ items, label, linkProps, className, testId }) => {
  const { labels } = useUi();

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
                <UiLink href={item.href} className={styles.breadcrumb__link} {...linkProps}>
                  {item.label}
                </UiLink>
              ) : (
                <span className={styles.breadcrumb__current} aria-current="page">
                  {item.label}
                </span>
              )}

              {!isLast && <CaretRightFill aria-hidden className={styles.breadcrumb__separator} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default /*#__PURE__*/ memo(Breadcrumb) as typeof Breadcrumb;
