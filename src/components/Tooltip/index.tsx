'use client';

import {
  isValidElement,
  memo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import useDismissOnEscape from '../../hooks/useDismissOnEscape';
import usePortalSurface from '../../hooks/usePortalSurface';
import usePositioning from '../../hooks/usePositioning';

import styles from './index.module.scss';
import type { PositionSide } from '@/types/positioning.type';

type Props = {
  /** Balonda gösterilecek açıklama. */
  content: ReactNode;
  /** Açıklamanın bağlandığı öğe — düğme, ikon, etiket. */
  children: ReactNode;
  /** Tercih edilen kenar. */
  side?: PositionSide;
  /** Açılma gecikmesi (ms). */
  openDelay?: number;
  /**
   * Ad değişti çünkü davranış değişti: `position` SABİT bir kenar yazıyordu ve balon oraya
   * sığmadığında görünüm alanının dışına taşıyordu. `side`…
   * @deprecated `side` kullanın.
   */
  position?: 'top' | 'bottom';
  className?: string;
};

/** Balonun kapanmadan önce beklediği süre — imlecin balona ulaşması için. */
const CLOSE_DELAY = 120;

/** Dokunmatikte balonu açan basma süresi. */
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

  /*
   * Cocuk kendi basina odak alabiliyor mu — capaya `tabIndex` verilip verilmeyecegini bu belirler.
   */
  const staticallyFocusableChild = useMemo(() => {
    if (!isValidElement(children)) return false;
    const type = children.type;
    const props = children.props as { href?: unknown; tabIndex?: unknown; disabled?: unknown };

    if (props.tabIndex !== undefined) return true;
    if (props.disabled === true) return false;
    if (typeof type !== 'string') return false;
    if (type === 'a') return props.href !== undefined;

    return ['button', 'input', 'select', 'textarea'].includes(type);
  }, [children]);

  /*
   * `typeof type!== 'string'` her BILESENI "odaklanamaz" sayiyor; hanui'nin her bileseni bir `memo`
   * NESNESI, yani `<Tooltip><Button/></Tooltip>` icin…
   * ⚠ STATIK KONTROL TEK BASINA YANLIS CEVAP VERIYORDU.
   */
  const [hasFocusableDescendant, setHasFocusableDescendant] = useState(false);

  useEffect(() => {
    const node = anchorRef.current;
    if (!node) return;

    setHasFocusableDescendant(
      Boolean(
        node.querySelector(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ),
    );
  }, [children]);

  const hasFocusableChild = staticallyFocusableChild || hasFocusableDescendant;

  const positioning = usePositioning(anchorRef, bubbleRef, {
    side: resolvedSide,
    align: 'center',
    isOpen,
  });

  const portal = usePortalSurface(isOpen, anchorRef, bubbleRef);

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
   * ⚠ UZUN BASMA zamanlayıcısı AYRI temizlenir. `clearTimer` yalnızca açılış/ kapanış gecikmesini
   * iptal ediyor
   */
  useEffect(
    () => () => {
      if (longPressRef.current) window.clearTimeout(longPressRef.current);
    },
    [],
  );

  /*
   * Escape ANINDA kapatir: gecikme, ipucunu kapatmak icin bastigi tusun islemedigi izlenimi
   * veriyordu.
   */
  const closeNow = useCallback(() => close(0), [close]);
  useDismissOnEscape(isOpen, closeNow);

  /*
   * Dokunmatikte ekranin herhangi bir yerine dokunmak kapatir: balonun kendi kapatma yolu yok ve
   * `pointer-events: none` oldugu icin ona da dokunulamiyor.
   */
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
        /*
         * ⚠ CAPA ODAKLANABILIR OLMAK ZORUNDA. `onFocus`/`onBlur` zaten bagli ama ` ` varsayilan
         * olarak odak almiyor: cocuk kendisi odaklanabilir…
         * ⚠ Cocuk zaten odaklanabiliyorsa (dugme, baglanti) `tabIndex` KONULMAZ: aksi halde ayni
         * ipucu icin sekmede IKI durak olusur.
         */
        tabIndex={hasFocusableChild ? undefined : 0}
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
        portal.container &&
        createPortal(
          <span
            ref={bubbleRef}
            /* ⚠ Modal içinden açıldığında üst katman ZORUNLU — `portal.helper`. */
            {...portal.attributes}
            id={id}
            role="tooltip"
            className={cx(styles.bubble, styles[`bubble--${positioning.side}`])}
            style={{
              ...positioning.style,
              ...portal.style,
              /* Olculmeden cizilen balon bir kare boyunca sol ust kosede parliyordu. */
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
          >
            {content}
          </span>,
          portal.container,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Tooltip, 'Tooltip')) as typeof Tooltip;
