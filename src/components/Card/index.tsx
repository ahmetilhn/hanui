import { type ElementType, type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import type { HanuiLinkExtraProps } from '../../types/link.type';
import HanuiLink from '../Link';

import styles from './index.module.scss';

type CardProps = {
  children: ReactNode;
  /** Kartın tamamı bir hedefe götürüyorsa hover geri bildirimi açılır. */
  isInteractive?: boolean;
  /** Semantik etiket: liste öğesi kartları `article` olmalı. */
  as?: ElementType;
  className?: string;
  testId?: string;
};

/**
 * Kart — medya + gövde + eylem şeridi.
 *
 * <h3>Neden bileşik (compound) bir bileşen</h3>
 * Bir uygulamadaki her kart (ürün, kampanya, sipariş) aynı üç bölümden oluşur
 * ama içerikleri tamamen farklıdır. Tek bir "her şeyi yapan" kart bileşeni on
 * beş isteğe bağlı prop'a şişiyordu. Bunun yerine <em>yerleşim</em>
 * paylaşılır, içerik çağırana bırakılır: kenarlık, yarıçap, gölge, medya oranı
 * ve eylem şeridinin dipte durması tek yerde tanımlıdır.
 *
 * <h3>Eylem şeridi hep dipte</h3>
 * {@link CardFooter} `margin-top: auto` alır. Izgarada yan yana duran kartların
 * başlıkları farklı uzunlukta olsa da alt şerit aynı hizada kalır; aksi hâlde
 * satır dalgalı görünüyordu.
 *
 * @example
 * <Card as="article" isInteractive>
 *   <CardMedia href="/urun/x" ratio={1}>
 *     <CardOverlay position="top-left"><Badge>Yeni</Badge></CardOverlay>
 *     <img src={…} alt="" />
 *   </CardMedia>
 *   <CardBody>…</CardBody>
 *   <CardFooter>…</CardFooter>
 * </Card>
 */
const Card: FC<CardProps> = ({ children, isInteractive, as: Tag = 'div', className, testId }) => (
  <Tag
    className={cx(styles.card, isInteractive && styles['card--interactive'], className)}
    data-testid={testId}
  >
    {children}
  </Tag>
);

/**
 * Görselin çerçeveyi NASIL doldurduğu.
 *
 * <p>Üçü de aynı soruyu yanıtlıyor — <em>kırpılsın mı, sığsın mı, yoksa
 * içeriden mi dursun</em> — bu yüzden tek bir prop'un değerleri; ayrı ayrı
 * boolean'lar olsalardı `isContained={false} isInset` gibi anlamsız
 * bileşimler yazılabilir hâle gelirdi.
 *
 * <ul>
 *   <li><b>`cover`</b> — çerçeveyi tamamen doldurur, taşan kenarları KIRPAR.
 *       Kadraj kenara kadar anlamlı olan fotoğraflar (kampanya, kapak).</li>
 *   <li><b>`contain`</b> — kırpmadan sığdırır; uzun kenarı çerçeve dolgusuna
 *       dayanır. Karışık oranlarda gelen görseller.</li>
 *   <li><b>`inset`</b> — sığdırır ve <b>%85</b>e çekip merkezler. Şeffaf
 *       zeminli ürün fotoğrafları: parçanın kenarı kartın kenarına
 *       değmiyor.</li>
 * </ul>
 */
export type CardMediaFit = 'cover' | 'contain' | 'inset';

type CardMediaProps = {
  children: ReactNode;
  /** Genişlik / yükseklik oranı. Sabit oran yükleme sırasında kaymayı önler. */
  ratio?: number;
  /** Medya alanı tıklanabilirse: görsel bağlantının içine alınır. */
  href?: string;
  /** Yönlendiriciye geçirilecek ek props. */
  linkProps?: HanuiLinkExtraProps;
  /** Görsel çerçeveyi nasıl doldurur — bkz. {@link CardMediaFit}. */
  fit?: CardMediaFit;
  /**
   * @deprecated `fit` kullanın: `isContained` → `fit="contain"`,
   * `isContained={false}` → `fit="cover"`. Boolean yalnızca iki durumu
   * anlatabiliyordu, üçüncüsü (`inset`) ona sığmadı. Eski yol bir sürüm daha
   * çalışır; `docs/MIGRATION.md`.
   */
  isContained?: boolean;
  className?: string;
};

/**
 * `fit` ile eski `isContained` arasındaki köprü.
 *
 * <p>Sıra ÖNEMLİ: açıkça verilen `fit` her zaman kazanır. Tersi olsaydı
 * (eskiyi öne almak) `isContained` varsayılanı `true` olduğu için yeni
 * prop'un hiçbir etkisi olmazdı — sessizce çalışmayan bir API.
 */
const resolveFit = (
  fit: CardMediaFit | undefined,
  isContained: boolean | undefined,
): CardMediaFit => fit ?? (isContained === false ? 'cover' : 'contain');

/**
 * Kartın görsel alanı.
 *
 * <p>Oran <strong>sabittir</strong>: görsel yüklenene kadar yer tutar ve
 * yerleşim kaymasını (CLS) önler. Oransız bırakıldığında kartlar görseller
 * yüklendikçe zıplıyordu.
 *
 * <p>Görselin çerçeveyi doldurma biçimi ÇAĞIRANIN kararı ({@link CardMediaFit}):
 * kütüphane "her ürün fotoğrafı içeriden dursun" gibi bir tercihi kendi
 * varsayılanına gömmez. Varsayılan `contain` — kırpmayan, yani hiçbir bilgiyi
 * sessizce yok etmeyen seçenek.
 */
export const CardMedia: FC<CardMediaProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, ratio = 1, href, linkProps, fit, isContained, className }) => {
    const content = (
      <span
        className={cx(styles.media__frame, styles[`media__frame--${resolveFit(fit, isContained)}`])}
        style={{ aspectRatio: ratio }}
      >
        {children}
      </span>
    );

    return (
      <div className={cx(styles.media, className)}>
        {href ? (
          // `tabIndex={-1}` + `aria-hidden`: aynı hedefe giden başlık bağlantısı
          // zaten sekme sırasında. Görseli ikinci bir durak yapmak klavye
          // gezinmesini iki katına çıkarıyor, ekran okuyucuda da aynı kayıt
          // arka arkaya iki kez duyuruluyordu.
          <HanuiLink
            href={href}
            className={styles.media__link}
            tabIndex={-1}
            aria-hidden
            {...linkProps}
          >
            {content}
          </HanuiLink>
        ) : (
          content
        )}
      </div>
    );
  }),
  'CardMedia',
);

type CardOverlayProps = {
  children: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
};

/**
 * Görselin üzerine binen katman: rozetler ve hızlı eylemler.
 *
 * <p>Varsayılan olarak `pointer-events: none` — rozet yığını, altındaki görsel
 * bağlantısının tıklanmasını engellememeli. İçindeki gerçek düğmeler kendi
 * olaylarını geri açar.
 */
export const CardOverlay: FC<CardOverlayProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, position = 'top-left', className }) => (
    <div className={cx(styles.overlay, styles[`overlay--${position}`], className)}>{children}</div>
  )),
  'CardOverlay',
);

type CardSectionProps = {
  children: ReactNode;
  className?: string;
};

/** Kartın metin gövdesi: başlık, açıklama, üstyazı. */
export const CardBody: FC<CardSectionProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, className }) => (
    <div className={cx(styles.body, className)}>{children}</div>
  )),
  'CardBody',
);

/** Eylem şeridi — tutar, düğmeler. Kartın dibine yapışır. */
export const CardFooter: FC<CardSectionProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, className }) => (
    <div className={cx(styles.footer, className)}>{children}</div>
  )),
  'CardFooter',
);

export default /*#__PURE__*/ memo(Card) as typeof Card;
