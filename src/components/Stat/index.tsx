'use client';

import { type FC, memo, type ReactNode } from 'react';

import { ArrowDownShort, ArrowUpShort, DashLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Değişimin yönü. `flat` "değişmedi" — yokluk DEĞİL. */
export type StatTrend = 'up' | 'down' | 'flat';

type Props = {
  /** Ölçülen şeyin adı ("Bugünkü sipariş"). */
  label: string;
  /** Değerin KENDİSİ — biçimlendirilmiş dize. Bileşen hesap yapmaz. */
  value: ReactNode;
  /** Değerin yanındaki birim ("₺", "adet"). */
  unit?: string;
  /** Değişim metni ("%12", "+3"). `trend` ile birlikte anlamlı. */
  delta?: string;
  /**
   * Değişimin yönü.
   *
   * <p>Yön TEK BAŞINA iyi/kötü demek değildir: "iade oranı %12 arttı" kötü,
   * "ciro %12 arttı" iyi. Renk kararı {@link isUpPositive} ile ayrı veriliyor.
   */
  trend?: StatTrend;
  /**
   * Artış İYİ mi. Varsayılan `true`.
   *
   * <p>`false` verildiğinde yukarı ok kırmızı, aşağı ok yeşil çizilir — iade
   * oranı, hata sayısı, terk edilen sepet gibi ölçüler için. Yönü her zaman
   * yeşil çizmek, kötüleşen bir ölçüyü iyi haber gibi gösteriyordu.
   */
  isUpPositive?: boolean;
  /** Değerin altındaki bir cümlelik bağlam ("geçen haftaya göre"). */
  description?: ReactNode;
  /** Sol üstte duran ikon madalyonu. */
  icon?: ReactNode;
  /**
   * `plain` KUTUYU kaldırır: zemin, kenarlık ve dolgu gider, yalnızca sayı
   * kalır. Varsayılan `card`.
   *
   * <p>Kendi zemini olan bir bandın (kahraman, güvence şeridi) üzerinde
   * ölçümler kart olarak istenmiyor. Bunun tek yolu kapsayıcıda
   * `--hanui-surface: transparent` yazmaktı ve iki şeyi birden bozuyordu:
   * dolgu <em>görünmez oluyor ama YER KAPLIYOR</em> — ölçüldü, telefonda 2×2
   * ızgarada satır arası 48 px'e çıkıyor ve dört sayı tek bir grup gibi
   * okunmuyordu — ayrıca o değişken kapsayıcıdaki <strong>her</strong> hanui
   * yüzeyini birden düzleştiriyordu. `plain` niyeti tek yerde söyler ve
   * yüzey değişkenine dokunmaya gerek bırakmaz.
   */
  variant?: 'card' | 'plain';
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

const TREND_ICON: Record<StatTrend, ReactNode> = {
  up: <ArrowUpShort aria-hidden />,
  down: <ArrowDownShort aria-hidden />,
  flat: <DashLg aria-hidden />,
};

/** Yönün ekran okuyucuya okunan karşılığı. */
const TREND_TEXT: Record<StatTrend, string> = {
  up: 'artış',
  down: 'azalış',
  flat: 'değişim yok',
};

/**
 * Ölçüm kutusu (KPI).
 *
 * <h3>Bileşen HESAP YAPMAZ</h3>
 * `value` ve `delta` biçimlendirilmiş dizeler. Yüzde hesabı, para birimi ve
 * yuvarlama çağıranın: bir gösterge panelinde "%12,5" ile "%13" arasındaki
 * farkı belirleyen şey ürün kararı, bileşenin varsayılanı değil. Aynı sebeple
 * `Price` de hesap yapmıyor.
 *
 * <h3>Yön TEK BAŞINA iyi/kötü demek DEĞİL</h3>
 * "İade oranı %12 arttı" kötü haber, "ciro %12 arttı" iyi. Yükselen her oku
 * yeşile boyamak, kötüleşen bir ölçüyü iyi gibi gösteriyordu — `isUpPositive`
 * bu kararı çağırana bırakıyor.
 *
 * <h3>Renk tek sinyal değil</h3>
 * Değişim üç şeyle birden anlatılıyor: <strong>ok yönü</strong> (biçim),
 * <strong>renk</strong> ve ekran okuyucuya okunan <strong>metin</strong>
 * ("artış" / "azalış" / "değişim yok"). Yalnızca renk kullanılsaydı renk körü
 * bir kullanıcı için artışla azalış aynı görünüyordu (WCAG 1.4.1).
 *
 * <h3>Rakamlar TABULAR</h3>
 * Alt alta duran ölçüm kutularında orantılı rakamlar sütunu tırtıklı
 * gösteriyor; `tabular-nums` her basamağı aynı genişlikte çiziyor.
 *
 * <h3>GENİŞLİK KARARI KAPSAYICININ</h3>
 * `Stat` kendine `flex` ya da `width` yazmaz ve bu bilinçli. Esnek bir sırada
 * içeriği kadar büzülür — yan yana dört kutu 148-177 px arasında tırtıklı
 * çıkabilir — ama çözüm kutuya `flex: 1` yazmak DEĞİL: aynı bileşen bir
 * ızgara hücresinde, bir kartın içinde ve tek başına da kullanılıyor ve orada
 * `flex: 1` çağıranın kararını sessizce eziyor. Eşit genişlik isteniyorsa
 * kapsayıcı söyler:
 *
 * ```scss
 * .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
 * ```
 *
 * <h3>Kendi zemini olan bandın üzerinde: `variant="plain"`</h3>
 * Kart görünümü (zemin + kenarlık + dolgu) sayfa yüzeyi için. Bir kahraman
 * bandının içinde ölçümler kart olarak istenmediğinde `plain` verilir; zemini
 * `transparent`a çevirmek dolguyu <em>görünmez</em> yapar ama kaldırmaz ve
 * ızgara sessizce dağılır.
 */
const Stat: FC<Props> = ({
  label,
  value,
  unit,
  delta,
  trend,
  isUpPositive = true,
  description,
  icon,
  variant = 'card',
  size = 'md',
  className,
  testId,
}) => {
  /* Yonun IYI mi KOTU mu oldugu ayri bir karar: "artis" her zaman iyi degil. */
  const isPositive = trend === 'flat' ? undefined : (trend === 'up') === isUpPositive;

  return (
    /*
      `card` icin ayri bir sinif YOK: taban sinifin kendisi kart. Arama
      `undefined` doner ve `cx` onu atar — varsayilan gorunum tek yerde kalir,
      iki sinif arasinda bolunmez.
    */
    <div
      className={cx(styles.stat, styles[`stat--${size}`], styles[`stat--${variant}`], className)}
      data-testid={testId}
    >
      {icon && (
        <span className={styles.stat__icon} aria-hidden>
          {icon}
        </span>
      )}

      <span className={styles.stat__label}>{label}</span>

      <span className={styles.stat__value}>
        {value}
        {unit && <span className={styles.stat__unit}>{unit}</span>}
      </span>

      {delta && trend && (
        <span
          className={cx(
            styles.stat__delta,
            isPositive === true && styles['stat__delta--positive'],
            isPositive === false && styles['stat__delta--negative'],
          )}
        >
          {TREND_ICON[trend]}
          {delta}
          {/* Yon METIN olarak da okunur: ok ve renk ekran okuyucuya gecmiyor. */}
          <span className={styles.stat__srOnly}>{TREND_TEXT[trend]}</span>
        </span>
      )}

      {description && <span className={styles.stat__description}>{description}</span>}
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Stat, 'Stat')) as typeof Stat;
