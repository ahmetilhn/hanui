'use client';

import {
  memo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { isClient } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import useDismissOnEscape from '../../hooks/useDismissOnEscape';
import { POPOVER_RESET, resolvePortalTarget, showTopLayer } from '../../helpers/portal.helper';
import usePositioning from '../../hooks/usePositioning';

import styles from './index.module.scss';
import type { PositionSide } from '@/types/positioning.type';

type Props = {
  /** Balonda gösterilecek açıklama. */
  content: ReactNode;
  /** Açıklamanın bağlandığı öğe — düğme, ikon, etiket. */
  children: ReactNode;
  /**
   * Tercih edilen kenar. Yer yoksa KARŞITINA düşer; üçüncü bir kenara
   * atlamaz (bkz. `usePositioning`).
   */
  side?: PositionSide;
  /**
   * Açılma gecikmesi (ms). Fare bir araç çubuğunun üzerinden geçerken sıfır
   * gecikme, art arda beş balon açıp kapatıyordu.
   */
  openDelay?: number;
  /**
   * @deprecated `side` kullanın. Bu prop bir sonraki büyük sürümde kalkacak.
   *
   * <p>Ad değişti çünkü davranış değişti: `position` SABİT bir kenar
   * yazıyordu ve balon oraya sığmadığında görünüm alanının dışına taşıyordu.
   * `side` yalnızca TERCİH — yer yoksa karşıt kenara düşülüyor. Aynı adı
   * korumak, artık doğru olmayan bir sözü sürdürmek olurdu.
   */
  position?: 'top' | 'bottom';
  className?: string;
};

/** Balonun kapanmadan önce beklediği süre — imlecin balona ulaşması için. */
const CLOSE_DELAY = 120;

/** Dokunmatikte balonu açan basma süresi. Daha kısası kaydırma jestini yakalıyordu. */
const LONG_PRESS_DELAY = 500;

/** İmleç öğenin üzerinde beklemeden balon açılmaz. */
const OPEN_DELAY = 300;

/** İpucu balonu. */
const Tooltip = ({
  content,
  children,
  side,
  position,
  openDelay = OPEN_DELAY,
  className,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  /* Eski prop bir surum boyunca calisir; `side` verilmisse o kazanir. */
  const resolvedSide: PositionSide = side ?? position ?? 'top';

  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef(0);
  const longPressRef = useRef(0);

  const positioning = usePositioning(anchorRef, bubbleRef, {
    side: resolvedSide,
    align: 'center',
    isOpen,
  });

  /* Portal hedefi yalnizca acikken cozulur; gerekce `helpers/portal.helper.ts`. */
  const portal = isOpen && isClient() ? resolvePortalTarget(anchorRef.current) : null;

  useEffect(() => {
    if (!isOpen || !portal?.needsTopLayer) return;
    return showTopLayer(bubbleRef.current);
  }, [isOpen, portal?.needsTopLayer]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  }, []);

  const open = useCallback(
    (delay: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => setIsOpen(true), delay);
    },
    [clearTimer],
  );

  const close = useCallback(
    (delay: number = CLOSE_DELAY) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => setIsOpen(false), delay);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  /*
   * ⚠ UZUN BASMA zamanlayıcısı AYRI temizlenir. `clearTimer` yalnızca açılış/
   * kapanış gecikmesini iptal ediyor; `longPressRef` ise `onPointerUp`,
   * `onPointerLeave` ve `onPointerCancel` ile iptal ediliyordu — yani parmak
   * hâlâ ekrandayken bileşen sökülürse (liste yeniden çizildi, satır silindi)
   * zamanlayıcı ateşlenip sökülmüş bir ağaçta `setIsOpen(true)` çağırıyordu.
   */
  useEffect(
    () => () => {
      if (longPressRef.current) window.clearTimeout(longPressRef.current);
    },
    [],
  );

  /* Escape ANINDA kapatir: gecikme, ipucunu kapatmak icin bastigi tusun
     islemedigi izlenimi veriyordu. */
  const closeNow = useCallback(() => close(0), [close]);
  useDismissOnEscape(isOpen, closeNow);

  /* Dokunmatikte ekranin herhangi bir yerine dokunmak kapatir: balonun kendi
     kapatma yolu yok ve `pointer-events: none` oldugu icin ona da
     dokunulamiyor. */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      if (anchorRef.current?.contains(event.target as Node)) return;
      close(0);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, close]);

  const cancelLongPress = () => {
    if (longPressRef.current) window.clearTimeout(longPressRef.current);
    longPressRef.current = 0;
  };

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse') return;
    longPressRef.current = window.setTimeout(() => setIsOpen(true), LONG_PRESS_DELAY);
  };

  return (
    <>
      <span
        ref={anchorRef}
        className={cx(styles.tooltip, className)}
        onPointerEnter={event => event.pointerType === 'mouse' && open(openDelay)}
        onPointerLeave={event => {
          cancelLongPress();
          if (event.pointerType === 'mouse') close();
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onFocus={() => open(0)}
        onBlur={() => close(0)}
        onContextMenu={event => {
          if (isOpen || longPressRef.current) event.preventDefault();
        }}
      >
        <span aria-describedby={isOpen ? id : undefined} className={styles.tooltip__trigger}>
          {children}
        </span>
      </span>

      {/*
        Balon DOM'da yalnizca ACIKKEN: kapaliyken de birakip gizlemek, ekran
        okuyucunun onu `aria-describedby` olmadan da bulup okumasina yol
        aciyordu.
      */}
      {isOpen &&
        portal &&
        createPortal(
          <span
            ref={bubbleRef}
            /* ⚠ Modal içinden açıldığında üst katman ZORUNLU — `portal.helper`. */
            {...(portal.needsTopLayer ? { popover: 'manual' as const } : {})}
            id={id}
            role="tooltip"
            className={cx(styles.bubble, styles[`bubble--${positioning.side}`])}
            style={{
              ...positioning.style,
              ...(portal.needsTopLayer ? POPOVER_RESET : {}),
              /* Olculmeden cizilen balon bir kare boyunca sol ust kosede
                 parliyordu. */
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
            /* Imlec balona giderken tetikleyiciden cikiyor; balon uzerindeyken
               kapanis iptal edilir ve metin secilebilir kalir. */
            onPointerEnter={clearTimer}
            onPointerLeave={() => close()}
          >
            {content}
          </span>,
          portal.container,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Tooltip, 'Tooltip')) as typeof Tooltip;
