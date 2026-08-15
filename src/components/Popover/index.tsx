'use client';

import {
  cloneElement,
  isValidElement,
  memo,
  type ReactElement,
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
import { captureFocus, focusFirstMeaningful } from '../../helpers/focus.helper';
import { POPOVER_RESET, resolvePortalTarget, showTopLayer } from '../../helpers/portal.helper';
import usePositioning from '../../hooks/usePositioning';

import styles from './index.module.scss';
import type { PositionAlign, PositionSide } from '@/types/positioning.type';

type Props = {
  /**
   * Tetikleyici. TEK bir öğe olmak zorunda: bileşen ona `ref`, `onClick` ve
   * `aria-expanded` ekliyor.
   */
  trigger: ReactElement;
  children: ReactNode;
  /** Yüzeyin erişilebilir adı. ZORUNLU — adsız bir bölge "grup" diye okunur. */
  label: string;
  side?: PositionSide;
  align?: PositionAlign;
  /** Kontrollü kullanım. Verilmezse bileşen durumu kendisi tutar. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  testId?: string;
};

/** Popover — <strong>eylem taşıyabilen</strong>, odaklanabilir yüzey. */
const Popover = ({
  trigger,
  children,
  label,
  side = 'bottom',
  align = 'start',
  isOpen: controlledOpen,
  onOpenChange,
  className,
  testId,
}: Props) => {
  const id = useId();
  const anchorRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<(() => void) | null>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const positioning = usePositioning(anchorRef, surfaceRef, { side, align, isOpen });

  /* Portal hedefi yalnizca acikken cozulur; gerekce `helpers/portal.helper.ts`. */
  const portal = isOpen && isClient() ? resolvePortalTarget(anchorRef.current) : null;

  useEffect(() => {
    if (!isOpen || !portal?.needsTopLayer) return;
    return showTopLayer(surfaceRef.current);
  }, [isOpen, portal?.needsTopLayer]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /* Acilista odak ICERI girer, kapanista TETIKLEYICIYE doner. */
  useEffect(() => {
    if (!isOpen) return;

    restoreRef.current = captureFocus();
    const surface = surfaceRef.current;
    if (surface) focusFirstMeaningful(surface);

    return () => {
      restoreRef.current?.();
      restoreRef.current = null;
    };
  }, [isOpen]);

  const close = useCallback(() => setOpen(false), [setOpen]);
  useDismissOnEscape(isOpen, close);

  /* DISARI tiklama da belge duzeyinde: odak yuzeyin icinde olmayabilir
     (fareyle acilmis bir popover). */
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      setOpen(false);
    };

    /* `mousedown`: `click` beklerken kullanici surukleyerek secim yaparsa
       yuzey kapanmiyordu. */
    document.addEventListener('mousedown', handlePointerDown);

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, setOpen]);

  if (!isValidElement(trigger)) return null;

  const triggerProps = trigger.props as Record<string, unknown>;

  const anchor = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: anchorRef,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog',
    'aria-controls': isOpen ? id : undefined,
    onClick: (event: React.MouseEvent) => {
      (triggerProps.onClick as ((event: React.MouseEvent) => void) | undefined)?.(event);
      setOpen(!isOpen);
    },
  });

  return (
    <>
      {anchor}

      {isOpen &&
        portal &&
        createPortal(
          <div
            ref={surfaceRef}
            id={id}
            /* ⚠ Modal içinden açıldığında üst katman ZORUNLU — `portal.helper`. */
            {...(portal.needsTopLayer ? { popover: 'manual' as const } : {})}
            /*
             * `role="dialog"` ama `aria-modal` YOK: yuzey kipsel degil ve
             * `aria-modal="true"` yazmak ekran okuyucuya sayfanin geri
             * kalaninin erisilemez oldugunu soyluyordu — oysa erisilebilir.
             */
            role="dialog"
            aria-label={label}
            className={cx(styles.popover, styles[`popover--${positioning.side}`], className)}
            style={{
              ...positioning.style,
              ...(portal.needsTopLayer ? POPOVER_RESET : {}),
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
            data-testid={testId}
            /*
             * Odak yuzeyin DISINA ciktiginda kapanir: kipsel olmayan bir
             * yuzeyde odagi hapsetmek kullaniciyi sayfadan koparirdi.
             *
             * ⚠ AMA "DISI" DOM AGACIYLA OLCULEMEZ. Yuzeyin icindeki bir
             * `Select`/`Combobox`/`Menu` acildiginda kendi panelini
             * `document.body`ye (ya da ust katmana) PORTALLIYOR; odak oraya
             * gectiginde `relatedTarget` bu yuzeyin ICINDE degil, dolayisiyla
             * eski kural popover'i KAPATIYORDU — kullanicinin az once actigi
             * listeyle birlikte.
             *
             * `relatedTarget === null` de kapatmaz: odagin pencereden cikmasi
             * (sekme degistirme, gelistirici araclari) yuzeyi kapatmamali.
             */
            onBlur={event => {
              const next = event.relatedTarget as HTMLElement | null;
              if (!next) return;
              if (event.currentTarget.contains(next)) return;
              if (anchorRef.current?.contains(next)) return;

              /*
               * Bu yuzeyden PORTALLANMIS bir katman mi? `Menu`/`Select`/
               * `Combobox` panelleri `aria-controls`/`id` zinciriyle degil,
               * acildiklari an odagi tasiyarak baglaniyor; en guvenilir olcut
               * hedefin kipsel bir yuzeyin ya da bir listbox/menu'nun icinde
               * olmasi.
               */
              if (next.closest('[role="listbox"],[role="menu"],[role="dialog"]')) return;

              setOpen(false);
            }}
          >
            {children}
          </div>,
          portal.container,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Popover, 'Popover')) as typeof Popover;
