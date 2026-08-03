import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

type DirectoryProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Dizin — harf veya konu başlıklı, gruplanmış bağlantı listesi.
 *
 * <h3>Neden ortak bir bileşen</h3>
 * Bir marka dizini ile bir kategori dizini aynı işi yapıyor: yüzlerce
 * bağlantıyı gruplayıp taranabilir kılmak. Ama iki container bunu ayrı ayrı
 * kurmuştu ve sonuç iki farklı sayfa oldu — birinde grup başlığı alt çizgili
 * 19 px, diğerinde çizgisiz; birinde satırlar ızgarada, diğerinde tek kolonda.
 *
 * <p>Ortak olan <em>görsel dilbilgisi</em>: grup başlığı + ızgara + satır
 * öğesi. O buraya taşındı; ne listelendiği çağırana kaldı.
 *
 * @example
 * <Directory>
 *   <DirectoryGroup label="A">
 *     <DirectoryRow href="/marka/ate" name="ATE" media={<img … />} />
 *   </DirectoryGroup>
 * </Directory>
 */
const Directory: FC<DirectoryProps> = ({ children, className }) => (
  <div className={cx(styles.directory, className)}>{children}</div>
);

type DirectoryGroupProps = {
  /** Grup başlığı: harf ("A", "0-9") veya konu ("Fren sistemi"). */
  label: string;
  /**
   * Başlık kendisi bir hedefe götürüyorsa. Harf gruplarında verilmez — "A"
   * diye bir sayfa yok.
   */
  href?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  /** Başlığın sağında duran sayaç ("14 alt kategori"). */
  meta?: ReactNode;
  children: ReactNode;
  /** Çıpa hedefi: alfabe şeridinden atlamak için. */
  id?: string;
};

/**
 * Dizin grubu.
 *
 * <p>Başlık <strong>yapışkan</strong>: uzun bir listede kaydırırken hangi
 * harfte olduğunu görmek, listeyi yukarı sarıp kontrol etmekten iyi.
 */
export const DirectoryGroup: FC<DirectoryGroupProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ label, href, linkProps, meta, children, id }) => (
    <section className={styles.group} id={id}>
      <header className={styles.group__header}>
        <h2 className={styles.group__label}>
          {href ? (
            <HanuiLink href={href} className={styles.group__link} {...linkProps}>
              {label}
            </HanuiLink>
          ) : (
            label
          )}
        </h2>
        {meta && <span className={styles.group__meta}>{meta}</span>}
      </header>

      <ul className={styles.group__list}>{children}</ul>
    </section>
  )),
  'DirectoryGroup',
);

type DirectoryRowProps = {
  href: string;
  name: string;
  /** Logo, ikon veya baş harf madalyonu. Satırın solunda. */
  media?: ReactNode;
  /** Sağ uçta duran işaret: rozet, kayıt sayısı. */
  marker?: ReactNode;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  className?: string;
};

/**
 * Dizin satırı — tek bir bağlantı.
 *
 * <p>Tüm satır tıklanabilir ve en az 44 px yüksekliğinde (WCAG 2.5.8):
 * yalnızca metnin tıklanabilir olduğu bir listede dokunmatik kullanıcılar
 * satırın boşluğuna basıp hiçbir şey olmadığını görüyordu.
 */
export const DirectoryRow: FC<DirectoryRowProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ href, name, media, marker, linkProps, className }) => (
    <li>
      <HanuiLink href={href} className={cx(styles.row, className)} {...linkProps}>
        {media && <span className={styles.row__media}>{media}</span>}
        <span className={styles.row__name}>{name}</span>
        {marker && <span className={styles.row__marker}>{marker}</span>}
      </HanuiLink>
    </li>
  )),
  'DirectoryRow',
);

type DirectoryJumpProps = {
  /** Grup etiketleri; her biri kendi çıpasına bağlanır. */
  labels: string[];
  /** Çıpa kimliğini üretir; `DirectoryGroup id` ile aynı olmalı. */
  toId: (label: string) => string;
  /** Şeridin erişilebilir adı. Verilmezse `labels.directoryJump`. */
  label?: string;
};

/**
 * Alfabe atlama şeridi.
 *
 * <p>Uzun bir listede "V" harfine ulaşmak için kaydırmak dakikalar alıyordu.
 * Şerit yatay kayar ve `#çıpa` bağlantıları taşır — JavaScript gerekmez,
 * tarayıcı kaydırmayı kendisi yapar ve bağlantı paylaşılabilir.
 *
 * <p>Bağlantılar HAM `<a>`: bunlar sayfa içi çıpa, gezinme değil. Bir
 * yönlendiriciden geçirmek aynı sayfayı yeniden çözümleyip kaydırmayı
 * kaçırıyordu.
 */
export const DirectoryJump: FC<DirectoryJumpProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ labels, toId, label }) => {
    /* Prop adi `labels` (grup etiketleri) config'in adiyla cakisiyor; config
     `config` olarak alinir. */
    const { labels: config } = useHanui();

    return (
      <nav
        className={styles.jump}
        aria-label={resolveLabel('DirectoryJump.label', label, config?.directoryJump)}
      >
        {labels.map(item => (
          <a key={item} href={`#${toId(item)}`} className={styles.jump__link}>
            {item}
          </a>
        ))}
      </nav>
    );
  }),
  'DirectoryJump',
);

export default /*#__PURE__*/ memo(Directory) as typeof Directory;
