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
  /** Değişimin yönü. */
  trend?: StatTrend;
  /** Artış İYİ mi. Varsayılan `true`. */
  isUpPositive?: boolean;
  /** Değerin altındaki bir cümlelik bağlam ("geçen haftaya göre"). */
  description?: ReactNode;
  /** Sol üstte duran ikon madalyonu. */
  icon?: ReactNode;
  /**
   * `plain` KUTUYU kaldırır: zemin, kenarlık ve dolgu gider, yalnızca sayı
   * kalır. Varsayılan `card`.
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

/** Ölçüm kutusu (KPI). */
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
     * `card` icin ayri bir sinif YOK: taban sinifin kendisi kart. Arama
     * `undefined` doner ve `cx` onu atar — varsayilan gorunum tek yerde kalir,
     * iki sinif arasinda bolunmez.
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
