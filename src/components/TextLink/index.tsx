import { type AnchorHTMLAttributes, memo, type ReactNode } from 'react';

import { ArrowRight } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  children: ReactNode;
  /** Sonda ok gösterilir — "devam et" anlamı taşıyan bağlantılarda. */
  hasArrow?: boolean;
  tone?: 'brand' | 'muted';
  size?: 'sm' | 'md';
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
};

/** Metin bağlantısı. */
const TextLink = ({
  href,
  children,
  hasArrow,
  tone = 'brand',
  size = 'md',
  className,
  linkProps,
  ...rest
}: Props) => (
  <HanuiLink
    href={href}
    className={cx(styles.link, styles[`link--${tone}`], styles[`link--${size}`], className)}
    {...linkProps}
    {...rest}
  >
    <span className={styles.link__label}>{children}</span>
    {/*
     * Ok DOLU DEĞİL: Bootstrap Icons'ta uzun okun dolu bir eşi yok ve dolu
     * caret bir "devam" oku değil, bir açılır menü işareti okunuyor.
     */}
    {hasArrow && <ArrowRight aria-hidden className={styles.link__arrow} />}
  </HanuiLink>
);

export default /*#__PURE__*/ memo(TextLink) as typeof TextLink;
