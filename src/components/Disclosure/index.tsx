'use client';

import { type FC, memo, type ReactNode, useEffect, useRef, useState } from 'react';

import { CaretRightFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type DisclosureVariant = 'framed' | 'plain';

type Props = {
  /** Başlık satırı — tıklanabilir olan bu. */
  summary: ReactNode;
  /** Başlığın sağında duran ikincil bilgi (süre, sayaç, rozet). */
  meta?: ReactNode;
  children: ReactNode;
  /**
   * Kontrollü kullanım; `onOpenChange` ile birlikte verilir.
   * ⚠ Ebeveyn `onOpenChange`i yok sayarsa DOM bir sonraki render'da prop'a döner, AYNI tuş vuruşunda
   * değil: `toggle` olayı eşzamansız ve anında geri çevirmek kendi `toggle`ıyla yarışıyordu.
   */
  isOpen?: boolean;
  /** Kontrolsüz kullanımda açılış durumu (boolean prop adı `is*` — API kuralı). */
  isDefaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  isDisabled?: boolean;
  /** `framed` kendi kenarlığı ve zemini olan kutu; `plain` kenarlıksız satır (liste içinde). */
  variant?: DisclosureVariant;
  className?: string;
  testId?: string;
};

/**
 * Tek başına açılır-kapanır bölüm — yerel `<details>` / `<summary>`.
 *
 * Klavye: `Enter` / `Space` başlıkta açar-kapar (tarayıcının kendi davranışı).
 *
 * ⚠ Yerel öğe bilinçli: odak, klavye ve ekran okuyucunun "genişletildi / daraltıldı" duyurusu
 * tarayıcıdan geliyor. Taklit bir `button[aria-expanded]` bunları yeniden yazmak demekti.
 */
const Disclosure: FC<Props> = ({
  summary,
  meta,
  children,
  isOpen: controlledOpen,
  isDefaultOpen = false,
  onOpenChange,
  isDisabled,
  variant = 'framed',
  className,
  testId,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(isDefaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  /*
   * `<details>` YERLI bir aciliyor/kapaniyor ogesi: kullanici tikladiginda DOM ozelligini TARAYICI
   * degistirir. `open` PROP'U TEK BASINA YETMEZ — React ayni degeri ikinci kez yazmadigi icin
   * kontrollu kipte kalici desenkronizasyon uretiyordu; surekliligi bu effect tutar.
   */
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) detailsRef.current.open = isOpen;
  });

  return (
    <details
      ref={detailsRef}
      className={cx(
        styles.disclosure,
        styles[`disclosure--${variant}`],
        isDisabled && styles['disclosure--disabled'],
        className,
      )}
      /* Ilk boyama ve SSR icin. */
      open={isOpen}
      /*
       * `onToggle` YEREL olaydir ve tarayici durumu DEGISTIRDIKTEN sonra dusuyor. `onClick` ile
       * yakalamak yetmiyordu: klavyeyle acilan bolum (Enter/Space) da buradan gecer.
       */
      onToggle={event => {
        const next = (event.currentTarget as HTMLDetailsElement).open;
        if (next === isOpen) return;

        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
      data-testid={testId}
    >
      <summary
        className={styles.disclosure__summary}
        /* Pasif bolum: `<summary>`nin `disabled` hali YOK. */
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={event => isDisabled && event.preventDefault()}
      >
        <CaretRightFill aria-hidden className={styles.disclosure__marker} />

        <span className={styles.disclosure__title}>{summary}</span>
        {meta && <span className={styles.disclosure__meta}>{meta}</span>}
      </summary>

      {/*
        Ic sarmalayici ZORUNLU: yukseklik gecisi `<details>`in KENDISINE verilemez (isaretcinin
        yuksekligi de gecise girip basligi titretiyordu).
      */}
      <div className={styles.disclosure__panel}>
        <div className={styles.disclosure__content}>{children}</div>
      </div>
    </details>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(Disclosure, 'Disclosure'),
) as typeof Disclosure;
