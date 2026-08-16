'use client';

import {
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  memo,
  type MouseEvent,
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
import { captureFocus } from '../../helpers/focus.helper';
import { POPOVER_RESET, resolvePortalTarget, showTopLayer } from '../../helpers/portal.helper';
import usePositioning from '../../hooks/usePositioning';

import styles from './index.module.scss';
import type { PositionAlign, PositionSide } from '@/types/positioning.type';

export type MenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  isDisabled?: boolean;
  /** Geri alınamaz eylem: yıkıcı tonda çizilir. */
  isDanger?: boolean;
};

type Props = {
  /** Tetikleyici. TEK öğe; bileşen ona `ref` ve ARIA ekliyor. */
  trigger: ReactElement;
  items: MenuItem[];
  /** Menünün erişilebilir adı ("Satır eylemleri"). ZORUNLU. */
  label: string;
  side?: PositionSide;
  align?: PositionAlign;
  className?: string;
  testId?: string;
};

/** Pasif olmayan seçeneklerin dizinleri. */
const enabledIndexes = (items: MenuItem[]): number[] =>
  items.map((item, index) => (item.isDisabled ? -1 : index)).filter(index => index >= 0);

/** Menü — bir listeden EYLEM seçme. */
const Menu = ({
  trigger,
  items,
  label,
  side = 'bottom',
  align = 'start',
  className,
  testId,
}: Props) => {
  const id = useId();
  const anchorRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<(() => void) | null>(null);
  /* Harfe atlama tamponu: art arda basilan harfler tek bir arama olur. */
  const typedRef = useRef({ text: '', at: 0 });

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const positioning = usePositioning(anchorRef, surfaceRef, { side, align, isOpen });
  const enabled = enabledIndexes(items);

  /*
   * Portal hedefi HER RENDER'DA degil, yalnizca acikken cozulur. `closest`
   * ucuzdur ama tetikleyicinin DOM konumu acilistan sonra degismedigi icin
   * tekrar hesaplamanin da bir anlami yok — `isOpen` false iken `null`.
   */
  const portal = isOpen && isClient() ? resolvePortalTarget(anchorRef.current) : null;

  /*
   * ⚠ `popover` niteligi TEK BASINA yetmez: eleman `showPopover()` cagrilana
   * kadar `display: none` kalir. Cagri yuzey MONTE EDILDIKTEN sonra olmali,
   * bu yuzden `useEffect` — render sirasinda ref henuz dolu degil.
   */
  useEffect(() => {
    if (!isOpen || !portal?.needsTopLayer) return;
    return showTopLayer(surfaceRef.current);
  }, [isOpen, portal?.needsTopLayer]);

  const open = useCallback(
    (target: 'first' | 'last') => {
      if (enabled.length === 0) return;
      restoreRef.current = captureFocus();
      setActiveIndex(target === 'first' ? enabled[0] : enabled[enabled.length - 1]);
      setIsOpen(true);
    },
    [enabled],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    /* Odak TETIKLEYICIYE doner: donmezse `<body>`ye duser ve klavye
       kullanicisi sayfanin en basina giderdi. */
    restoreRef.current?.();
    restoreRef.current = null;
  }, []);

  /*
   * ⚠ SOKULME de bir kapanistir.
   *
   * Geri yukleme YALNIZCA `close()` icindeydi, yani menu ACIKKEN sokuldugunde
   * hic calismiyordu. Somut yol: satir eylemleri menusundeki "Sil" ogesi.
   * `onSelect()` kaydi siliyor, satir (ve icindeki menu) bir sonraki render'da
   * sokuluyor ve `close()` ya hic kosmuyor ya da artik DOM'da olmayan bir
   * dugume odaklanmaya calisiyor. Odak `<body>`ye dusuyor ve klavye kullanicisi
   * tam da yukaridaki yorumun engellemeyi vaat ettigi yere — sayfanin basina —
   * atiliyordu.
   *
   * `Modal`, `Drawer`, `Popover` ve `BottomSheet` bunu temizlikte zaten
   * yapiyor; ayrisan tek yuzey `Menu`ydu.
   */
  useEffect(
    () => () => {
      restoreRef.current?.();
      restoreRef.current = null;
    },
    [],
  );

  /* Etkin oge GERCEKTEN odaklanir (APG menu deseni). */
  useEffect(() => {
    if (!isOpen) return;
    surfaceRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.focus({ preventScroll: true });
  }, [isOpen, activeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, close]);

  const step = (offset: number) => {
    const position = enabled.indexOf(activeIndex);
    const next = (position + offset + enabled.length) % enabled.length;
    setActiveIndex(enabled[next]);
  };

  /** Harfe atlama: 500 ms içinde basılan harfler tek bir arama. */
  const jumpToLetter = (key: string) => {
    const now = Date.now();
    const buffer = now - typedRef.current.at > 500 ? key : typedRef.current.text + key;
    typedRef.current = { text: buffer, at: now };

    const match = enabled.find(index =>
      items[index].label.toLocaleLowerCase('tr').startsWith(buffer.toLocaleLowerCase('tr')),
    );

    if (match !== undefined) setActiveIndex(match);
  };

  const handleMenuKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        step(1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        step(-1);
        break;

      case 'Home':
        event.preventDefault();
        setActiveIndex(enabled[0]);
        break;

      case 'End':
        event.preventDefault();
        setActiveIndex(enabled[enabled.length - 1]);
        break;

      case 'Escape':
        event.preventDefault();
        close();
        break;

      case 'Tab':
        /* Menu KAPANIR ama gezinme SURER: kullanici menuden cikip sayfaya
           devam ediyor. `preventDefault` yok. */
        close();
        break;

      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) jumpToLetter(event.key);
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      open('last');
      return;
    }

    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      open('first');
    }
  };

  if (!isValidElement(trigger)) return null;

  const triggerProps = trigger.props as Record<string, unknown>;

  const anchor = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: anchorRef,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? id : undefined,
    onClick: (event: MouseEvent) => {
      (triggerProps.onClick as ((event: MouseEvent) => void) | undefined)?.(event);
      if (isOpen) close();
      else open('first');
    },
    onKeyDown: (event: KeyboardEvent) => {
      (triggerProps.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event);
      if (!isOpen) handleTriggerKeyDown(event);
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
            role="menu"
            aria-label={label}
            /*
             * ⚠ Modalin ICINDEN acildiginda yuzey UST KATMANA cikmak ZORUNDA.
             * Gerekce ve olculen dort senaryo: `helpers/portal.helper.ts`.
             */
            {...(portal.needsTopLayer ? { popover: 'manual' as const } : {})}
            className={cx(styles.menu, styles[`menu--${positioning.side}`], className)}
            style={{
              ...positioning.style,
              ...(portal.needsTopLayer ? POPOVER_RESET : {}),
              visibility: positioning.isPositioned ? 'visible' : 'hidden',
            }}
            data-testid={testId}
            onKeyDown={handleMenuKeyDown}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                data-index={index}
                /*
                 * DONEN `tabindex`: menu Tab sirasinda TEK durak. Her oge
                 * odaklanabilir olsaydi sekiz ogeli bir menude klavye
                 * kullanicisi sayfaya donmek icin sekiz kez Tab'liyordu.
                 */
                tabIndex={index === activeIndex ? 0 : -1}
                disabled={item.isDisabled}
                className={cx(styles.menu__item, item.isDanger && styles['menu__item--danger'])}
                onClick={() => {
                  item.onSelect();
                  close();
                }}
                /*
                 * ⚠ `onMouseEnter` KALDIRILDI. Eskiden fare bir ogenin uzerine
                 * geldiginde `setActiveIndex` cagriliyordu; asagidaki etki de
                 * `activeIndex` degisince `.focus()` cagirdigi icin sonuc
                 * **farenin klavye odagini calmasi** oluyordu: kullanici ok
                 * tuslariyla gezinirken imlecin durdugu yer ya da menunun
                 * imlecin altinda kaymasi odagi geri firlatiyordu.
                 *
                 * Kaldirilan yorumun gerekcesi "iki ayri vurgu kullaniciyi
                 * sasirtiyordu" idi; o sorun VURGULARI AYIRARAK cozuldu:
                 * hover = arka plan, klavye odagi = halka (`index.module.scss`).
                 * Ikisi artik farkli sey soyluyor, cakismiyor.
                 */
              >
                {item.icon && (
                  <span className={styles.menu__icon} aria-hidden>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>,
          portal.container,
        )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Menu, 'Menu')) as typeof Menu;
