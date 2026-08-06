import { memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

type Props = {
  label: string;
  /** İkon DIŞARIDAN gelir: hangi ikonun hangi konuya ait olduğu uygulamanın bilgisi. */
  icon: ReactNode;
  href: string;
  /** Etiketin altında gösterilen ikincil satır ("1.248 kayıt"). */
  meta?: ReactNode;
  isActive?: boolean;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  className?: string;
  testId?: string;
};

/** Karo — ikon madalyonu + etiket. */
const Tile = ({ label, icon, href, meta, isActive, linkProps, className, testId }: Props) => (
  <HanuiLink
    href={href}
    className={cx(styles.tile, isActive && styles['tile--active'], className)}
    aria-current={isActive ? 'page' : undefined}
    data-testid={testId}
    {...linkProps}
  >
    <span className={styles.tile__medallion} aria-hidden>
      {icon}
    </span>

    <span className={styles.tile__label}>{label}</span>

    {meta && <span className={styles.tile__meta}>{meta}</span>}
  </HanuiLink>
);

export default /*#__PURE__*/ memo(Tile) as typeof Tile;
