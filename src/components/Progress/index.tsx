'use client';

import { memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

/** Yüzdeyi 0-100 aralığına kırpar; ölçek sıfır genişlikteyse 0 döner. */
const toPercent = (value: number, max: number): number => {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
};

type Props = {
  /**
   * Tamamlanan miktar. `undefined` → BELİRSİZ ilerleme (sonu bilinmiyor);
   * çubuk kendi kendine akar.
   */
  value?: number;
  /** Ölçeğin üst ucu. */
  max?: number;
  /** Çubuğun erişilebilir adı ("Yükleme", "Ödeme adımı"). ZORUNLU. */
  label: string;
  /**
   * Ekran okuyucuya okunan METİN karşılığı ("3 / 5 dosya").
   *
   * <p>Verilmezse ekran okuyucu ham yüzdeyi okur. Bir dosya yüklemesinde
   * "yüzde altmış" ile "5 dosyadan 3'ü" arasındaki fark, kullanıcının
   * bekleyip beklememeye karar verebilmesi.
   */
  valueText?: string;
  /** Yüzdeyi çubuğun yanında GÖRÜNÜR olarak yazar. */
  isValueVisible?: boolean;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  testId?: string;
};

/**
 * İlerleme çubuğu — <strong>ölçülebilir</strong> bekleme.
 *
 * <h3>{@link Spinner} ile farkı: sonu bilinip bilinmediği</h3>
 * `Spinner` "bir şey oluyor" der ve başka bir şey söyleyemez. Ölçülebilir bir
 * işte (dosya yükleme, içe aktarma, çok adımlı ödeme) bu yetmiyor: kullanıcı
 * beklemeye değip değmeyeceğine karar veremiyor ve iki saniyeyle iki dakika
 * arasındaki farkı ancak bekleyerek öğreniyordu.
 *
 * <p>`value` verilmediğinde çubuk BELİRSİZ kipe düşer: yine bir çubuk çizer
 * ama `aria-valuenow` yazmaz. Bu kasıtlı — bilinmeyen bir değeri "0" diye
 * bildirmek, ekran okuyucuya işin hiç ilerlemediğini söylüyordu.
 *
 * <h3>Yüzde tek başına yeterli DEĞİL</h3>
 * `valueText` verildiğinde ekran okuyucu onu okur ("5 dosyadan 3'ü"), yüzdeyi
 * değil. Aynı bilgi görsel tarafta `isValueVisible` ile yazılabiliyor; ikisi
 * de aynı gerçeği söylemek zorunda.
 *
 * <h3>Renk tek başına anlam taşımaz</h3>
 * `tone` yalnızca bir vurgu: "tamamlandı" ya da "başarısız" durumu çubuğun
 * rengiyle DEĞİL, yanındaki metinle ve çağıran tarafın çizdiği ikonla
 * anlatılır (WCAG 1.4.1).
 */
const Progress = ({
  value,
  max = 100,
  label,
  valueText,
  isValueVisible,
  tone = 'brand',
  size = 'md',
  className,
  testId,
}: Props) => {
  const isIndeterminate = value === undefined;
  const percent = isIndeterminate ? 0 : toPercent(value, max);

  return (
    <div className={cx(styles.progress, className)} data-testid={testId}>
      <div
        role="progressbar"
        aria-label={label}
        /*
         * BELIRSIZ kipte `aria-valuenow` YAZILMAZ. Ozniteligin yoklugu, ARIA'da
         * "deger bilinmiyor" demek; `0` yazmak ekran okuyucuya isin hic
         * ilerlemedigini soyluyordu.
         */
        aria-valuenow={isIndeterminate ? undefined : Math.round(percent)}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : 100}
        aria-valuetext={isIndeterminate ? undefined : valueText}
        className={cx(
          styles.progress__track,
          styles[`progress__track--${size}`],
          isIndeterminate && styles['progress__track--indeterminate'],
        )}
      >
        <span
          className={cx(styles.progress__fill, styles[`progress__fill--${tone}`])}
          style={isIndeterminate ? undefined : { inlineSize: `${percent}%` }}
        />
      </div>

      {isValueVisible && !isIndeterminate && (
        /* Gorsel yuzde `aria-hidden`: ayni bilgi zaten `progressbar`in
           degerinde ve iki kez duyurulmasi gurultu. */
        <span className={styles.progress__value} aria-hidden>
          {valueText ?? `%${Math.round(percent)}`}
        </span>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Progress, 'Progress')) as typeof Progress;

type CircleProps = {
  /** Tamamlanan miktar. `undefined` → BELİRSİZ; çember döner. */
  value?: number;
  max?: number;
  /** Erişilebilir ad. ZORUNLU. */
  label: string;
  valueText?: string;
  /** Yüzdeyi çemberin ortasına yazar. */
  isValueVisible?: boolean;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  /** Dış çap (px). */
  size?: number;
  className?: string;
  testId?: string;
};

/**
 * Dairesel ilerleme.
 *
 * <h3>Ne zaman çubuk, ne zaman çember</h3>
 * Çubuk bir SATIRA aittir ve yanındaki metinle okunur; çember bir KUTUYA
 * aittir (kart köşesi, avatar yerine geçen madalyon, dip şeritteki adım
 * göstergesi). Kararı yer belirler, tercih değil: dar bir kutuda çubuk 30
 * piksele düşüp okunamaz hâle geliyordu.
 *
 * <h3>Ölçü prop, token DEĞİL</h3>
 * Çemberin çapı `stroke-dasharray` hesabına giriyor ve o hesap JavaScript'te
 * yapılıyor: CSS değişkeninden okunamaz. Bu yüzden `size` bir sayı — ölçü
 * ölçeğinin dışında kalan tek yer ve nedeni bu.
 */
const ProgressCircleBase = ({
  value,
  max = 100,
  label,
  valueText,
  isValueVisible,
  tone = 'brand',
  size = 44,
  className,
  testId,
}: CircleProps) => {
  const isIndeterminate = value === undefined;
  const percent = isIndeterminate ? 25 : toPercent(value, max);

  /* Cizgi kalinligi capin ~%10'u: sabit bir kalinlik kucuk cemberde kutuyu
     dolduruyor, buyugunde sac teline donuyordu. */
  const stroke = Math.max(3, Math.round(size * 0.1));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cx(styles.circle, isIndeterminate && styles['circle--indeterminate'], className)}
      style={{ width: size, height: size }}
      data-testid={testId}
    >
      <svg
        className={styles.circle__svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="progressbar"
        aria-label={label}
        aria-valuenow={isIndeterminate ? undefined : Math.round(percent)}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : 100}
        aria-valuetext={isIndeterminate ? undefined : valueText}
      >
        <circle
          className={styles.circle__track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className={cx(styles.circle__fill, styles[`circle__fill--${tone}`])}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>

      {isValueVisible && !isIndeterminate && (
        <span className={styles.circle__label} aria-hidden>
          {valueText ?? `%${Math.round(percent)}`}
        </span>
      )}
    </div>
  );
};

export const ProgressCircle = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(ProgressCircleBase),
  'ProgressCircle',
);
