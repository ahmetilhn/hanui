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

/**
 * Karo — ikon madalyonu + etiket.
 *
 * <h3>Neden ikon, neden yuvarlak madalyon</h3>
 * Ana giriş noktaları metin listesi olarak verildiğinde kullanıcı satır satır
 * okuyor. İkon, aranan öğeyi <em>okumadan</em> bulmayı sağlar; madalyon ise
 * ikona sabit bir kutu verir — farklı ikonların doğal genişlikleri karoları
 * düzensiz hizalıyordu.
 *
 * <h3>Karonun tamamı tıklanabilir</h3>
 * Bağlantı yalnızca etiketi değil karonun tümünü kaplar. Küçük bir metin
 * bağlantısını hedeflemek, özellikle dokunmatik ekranda gereksiz bir hassasiyet
 * talebiydi.
 *
 * <h3>`meta` neden sayı değil `ReactNode`</h3>
 * "1.248 ürün" cümlesi hem sayı biçimine hem dile bağlı. Bileşen içinde
 * `toLocaleString` çağırmak, o kararı kütüphanenin varsayımına bağlıyordu.
 */
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
