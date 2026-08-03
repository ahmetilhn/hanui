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

/**
 * Metin bağlantısı.
 *
 * <h3>Ok bir süs değil</h3>
 * Sondaki ok yalnızca <em>gezinme</em> bağlantılarında kullanılır ("Tümünü gör
 * →"). Bir eylemi tetikleyen bağlantıya ok koymak, kullanıcıya başka bir
 * sayfaya gideceğini söyler ve beklentiyi yanıltır.
 *
 * <p>Ok, üzerine gelindiğinde <strong>ilerler</strong>: hareket, bağlantının
 * götürdüğü yönü fiziksel olarak sezdirir.
 *
 * <h3>Alt çizgi hover'da eklenir, kaldırılmaz</h3>
 * Sürekli altı çizili bağlantılar yoğun bir liste sayfasında görsel gürültü
 * yaratıyordu. Ama alt çizginin <em>hiç</em> olmaması bağlantıyı düz metinden
 * ayırt edilemez kılar; renk tek başına yeterli değil (WCAG 1.4.1). Çözüm:
 * renk her zaman, alt çizgi etkileşimde.
 */
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
