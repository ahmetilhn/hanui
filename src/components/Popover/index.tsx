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
import { captureFocus, focusFirstMeaningful } from '../../helpers/focus.helper';
import usePositioning, { type PositionAlign, type PositionSide } from '../../hooks/usePositioning';

import styles from './index.module.scss';

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

/**
 * Popover — <strong>eylem taşıyabilen</strong>, odaklanabilir yüzey.
 *
 * <h3>{@link Tooltip} ile farkı: içine ne konabildiği</h3>
 * İkisi de tetikleyiciye yapışan bir yüzey açıyor; ayrım içeriğin
 * ERİŞİLEBİLİR olup olmamasında:
 *
 * <ul>
 *   <li>`Tooltip` yalnızca AÇIKLAMA taşır. `pointer-events: none` ve klavyeyle
 *       içine girilemez — içine bir bağlantı konsa ona ulaşmanın yolu olmazdı
 *       (fare balona giderken tetikleyiciden çıkıyor).</li>
 *   <li><b>`Popover` odak alır.</b> Açıldığında odak içeri girer, `Escape`
 *       kapatır ve odak tetikleyiciye döner. Bağlantı, düğme, kısa bir form
 *       konabilir.</li>
 * </ul>
 *
 * <h3>Kipsel DEĞİL</h3>
 * Arka plan tıklanabilir kalır ve sayfa kaydırılabilir. Kararı bekleyen,
 * kaçınılmaz bir seçim `Modal`ın işi; popover yardımcı bir yüzey ve
 * kullanıcıyı hapsetmemeli. Bu yüzden `<dialog>` DEĞİL portal + `usePositioning`:
 * `showModal()` arka planı inert bırakıyor, `<dialog open>` (kipsiz) ise üst
 * katmana hiç girmiyor ve `z-index` yarışına dönüyordu.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Enter` / `Space`</td><td>tetikleyicide: açar</td></tr>
 *   <tr><td>`Escape`</td><td>kapatır, odak TETİKLEYİCİYE döner</td></tr>
 *   <tr><td>`Tab`</td><td>yüzeyin içinde gezinir; dışına çıkınca KAPANIR</td></tr>
 * </table>
 * Odak tuzağı YOK — kipsel olmayan bir yüzeyde odağı hapsetmek, kullanıcıyı
 * sayfadan koparır. Odak dışarı çıktığında yüzey kapanır.
 */
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

  /* Escape ve DISARI tiklama. Ikisi de belge duzeyinde: odak yuzeyin icinde
     olmayabilir (fareyle acilmis bir popover). */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    /* `mousedown`: `click` beklerken kullanici surukleyerek secim yaparsa
       yuzey kapanmiyordu. */
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
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
        isClient() &&
        createPortal(
          <div
            ref={surfaceRef}
            id={id}
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
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
            data-testid={testId}
            /* Odak yuzeyin DISINA ciktiginda kapanir: kipsel olmayan bir
               yuzeyde odagi hapsetmek kullaniciyi sayfadan koparirdi. */
            onBlur={event => {
              if (event.currentTarget.contains(event.relatedTarget as Node)) return;
              if (anchorRef.current?.contains(event.relatedTarget as Node)) return;
              setOpen(false);
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Popover, 'Popover')) as typeof Popover;
