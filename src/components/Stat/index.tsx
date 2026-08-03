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
  size = 'md',
  className,
  testId,
}) => {
  /* Yonun IYI mi KOTU mu oldugu ayri bir karar: "artis" her zaman iyi degil. */
  const isPositive = trend === 'flat' ? undefined : (trend === 'up') === isUpPositive;

  return (
    <div className={cx(styles.stat, styles[`stat--${size}`], className)} data-testid={testId}>
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
