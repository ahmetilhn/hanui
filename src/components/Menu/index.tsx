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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { captureFocus } from '../../helpers/focus.helper';
import usePortalSurface from '../../hooks/usePortalSurface';
import usePositioning from '../../hooks/usePositioning';

import styles from './index.module.scss';
import type { PositionAlign, PositionSide, PositioningRect } from '@/types/positioning.type';

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
  /** Tetikleyici. */
  trigger: ReactElement;
  items: MenuItem[];
  /** Menünün erişilebilir adı ("Satır eylemleri"). */
  label: string;
  side?: PositionSide;
  align?: PositionAlign;
  className?: string;
  testId?: string;
};

/** Pasif olmayan seçeneklerin dizinleri. */
const enabledIndexes = (items: MenuItem[]): number[] =>
  items.map((item, index) => (item.isDisabled ? -1 : index)).filter(index => index >= 0);

type SurfaceProps = {
  id: string;
  items: MenuItem[];
  label: string;
  /** Konumun ÖLÇÜLDÜĞÜ çapa: tetikleyici ya da imleç noktası. */
  anchorRef: { current: { getBoundingClientRect: () => PositioningRect } | null };
  /** Ağaçtaki sahip: portal hedefi (en yakın `<dialog>`) ve dışarı-tıklama istisnası. */
  ownerRef: { current: HTMLElement | null };
  side: PositionSide;
  align: PositionAlign;
  offset?: number;
  /** Açılışta odaklanan uç. */
  initial: 'first' | 'last';
  header?: ReactNode;
  className?: string;
  testId?: string;
  onClose: () => void;
  onContextMenu?: (event: MouseEvent) => void;
};

/**
 * MENÜ YÜZEYİ — `Menu` ve `ContextMenu`nün ortak gövdesi: konum, portal, odak, klavye ve
 * dışarı-tıklama TEK yerde. Yalnızca AÇIKKEN takılır; kapanış sökülmedir.
 */
const MenuSurface = ({
  id,
  items,
  label,
  anchorRef,
  ownerRef,
  side,
  align,
  offset,
  initial,
  header,
  className,
  testId,
  onClose,
  onContextMenu,
}: SurfaceProps) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  /* Harfe atlama tamponu: art arda basilan harfler tek bir arama olur. */
  const typedRef = useRef({ text: '', at: 0 });
  const enabled = enabledIndexes(items);

  const [activeIndex, setActiveIndex] = useState(() =>
    initial === 'first' ? enabled[0] : enabled[enabled.length - 1],
  );

  const positioning = usePositioning(anchorRef, surfaceRef, { side, align, offset, isOpen: true });

  /*
   * Portal hedefi HER RENDER'DA degil, yalnizca acikken cozulur. `closest` ucuzdur ama
   * tetikleyicinin DOM konumu acilistan sonra degismedigi icin tekrar…
   */
  const portal = usePortalSurface(true, ownerRef, surfaceRef);

  /*
   * Etkin oge GERCEKTEN odaklanir (APG menu deseni).
   * ⚠ KONUM OLCULDUKTEN SONRA: yuzey o ana kadar `visibility: hidden` tasir ve gizli oge odak ALMAZ.
   * Olcum `useLayoutEffect`te durum yazar, ama ayrik olayda (tik, sag tik) React bu commit'in pasif
   * etkilerini yeniden cizimden ONCE bosaltiyor — odak gizli yuzeye gidip sessizce dusuyordu ve
   * odak `<body>`de kaliyordu (olculdu: chromium, 5.5.0 `Menu` dahil). jsdom gorunurlugu bilmedigi
   * icin birim testleri bunu goremiyordu; nobetci `anchored-panel.spec.ts` "menü açılışında odak".
   */
  const { isPositioned } = positioning;

  useEffect(() => {
    if (!isPositioned) return;
    surfaceRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.focus({ preventScroll: true });
  }, [activeIndex, isPositioned]);

  useEffect(() => {
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target) || ownerRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [ownerRef, onClose]);

  const step = (offsetBy: number) => {
    const position = enabled.indexOf(activeIndex);
    const next = (position + offsetBy + enabled.length) % enabled.length;
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
        /*
         * `preventDefault` SAYFAYA "bu Escape islendi" der: `window`da Escape dinleyen kod
         * (`event.defaultPrevented`) menuyu kapatan tusla kendi eylemini de calistirmaz.
         */
        event.preventDefault();
        onClose();
        break;

      case 'Tab':
        /*
         * Menu KAPANIR ama gezinme SURER: kullanici menuden cikip sayfaya devam ediyor.
         * `preventDefault` yok.
         */
        onClose();
        break;

      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) jumpToLetter(event.key);
    }
  };

  if (!portal.container) return null;

  const buttons = items.map((item, index) => (
    <button
      key={item.id}
      type="button"
      role="menuitem"
      data-index={index}
      /* DONEN `tabindex`: menu Tab sirasinda TEK durak. */
      tabIndex={index === activeIndex ? 0 : -1}
      disabled={item.isDisabled}
      className={cx(styles.menu__item, item.isDanger && styles['menu__item--danger'])}
      onClick={() => {
        item.onSelect();
        onClose();
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
  ));

  const surface = {
    ref: surfaceRef,
    /* ⚠ Modalin ICINDEN acildiginda yuzey UST KATMANA cikmak ZORUNDA. */
    ...portal.attributes,
    className: cx(styles.menu, styles[`menu--${positioning.side}`], className),
    style: {
      ...positioning.style,
      ...portal.style,
      visibility: positioning.isPositioned ? ('visible' as const) : ('hidden' as const),
    },
    'data-testid': testId,
    onContextMenu,
  };

  const headerId = `${id}-header`;

  return createPortal(
    /*
     * BASLIK `role="menu"`nun DISINDA: menu yalniz `menuitem` tasir. Baslik menuye
     * `aria-describedby` ile baglanir — ok tuslari ogeler arasinda gezerken baglam okunur.
     */
    header ? (
      <div {...surface}>
        <div id={headerId} className={styles.menu__header}>
          {header}
        </div>
        <div
          id={id}
          role="menu"
          aria-label={label}
          aria-describedby={headerId}
          className={styles.menu__list}
          onKeyDown={handleMenuKeyDown}
        >
          {buttons}
        </div>
      </div>
    ) : (
      <div {...surface} id={id} role="menu" aria-label={label} onKeyDown={handleMenuKeyDown}>
        {buttons}
      </div>
    ),
    portal.container,
  );
};

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
  const restoreRef = useRef<(() => void) | null>(null);

  /* Acilisin hangi uca odaklanacagi; `null` = kapali. */
  const [opening, setOpening] = useState<'first' | 'last' | null>(null);
  const isOpen = opening !== null;
  const enabled = enabledIndexes(items);

  const open = useCallback(
    (target: 'first' | 'last') => {
      if (enabled.length === 0) return;
      restoreRef.current = captureFocus();
      setOpening(target);
    },
    [enabled],
  );

  const close = useCallback(() => {
    setOpening(null);
    /*
     * Odak TETIKLEYICIYE doner: donmezse `<body>`ye duser ve klavye kullanicisi sayfanin en basina
     * giderdi.
     */
    restoreRef.current?.();
    restoreRef.current = null;
  }, []);

  /*
   * Geri yukleme YALNIZCA `close()` icindeydi, yani menu ACIKKEN sokuldugunde hic calismiyordu.
   * ⚠ SOKULME de bir kapanistir.
   */
  useEffect(
    () => () => {
      restoreRef.current?.();
      restoreRef.current = null;
    },
    [],
  );

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

      {opening && (
        <MenuSurface
          id={id}
          items={items}
          label={label}
          anchorRef={anchorRef}
          ownerRef={anchorRef}
          side={side}
          align={align}
          initial={opening}
          className={className}
          testId={testId}
          onClose={close}
        />
      )}
    </>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Menu, 'Menu')) as typeof Menu;

type ContextMenuProps = {
  /**
   * Açılış noktası — `contextmenu` olayının `clientX` / `clientY`si (görünüm alanı koordinatı).
   * `null` iken menü kapalı.
   */
  point: { x: number; y: number } | null;
  /** Escape, Tab, dışarı tıklama ya da seçilen eylemden sonra çağrılır; çağıran `point`i `null` yapar. */
  onClose: () => void;
  items: MenuItem[];
  /** Menünün erişilebilir adı ("Seçim seçenekleri"). */
  label: string;
  /** Eylemlerin ÜSTÜNDE okunan bağlam (seçimin özeti, ölçümler) — `role="menu"`nün DIŞINDA. */
  header?: ReactNode;
  className?: string;
  testId?: string;
};

/* Nokta ile menu arasindaki bosluk: imlecin ucu ilk ogenin kenarini ortmesin. */
const POINT_OFFSET = 2;

/* Menunun ICINDE sag tik tarayicinin menusunu acmaz. */
const preventNativeMenu = (event: MouseEvent) => event.preventDefault();

/**
 * Bağlam menüsü — `Menu`nün imleç noktasında açılanı (sağ tık). Çağıran `contextmenu` olayında
 * `preventDefault()` çağırıp `point` yazar; menü noktanın sağ altına açılır, sığmazsa üste döner ve
 * görünüm alanına kırpılır. Odak açılışta ilk etkin öğeye gider, kapanışta önceki öğeye döner.
 */
const ContextMenuBase = ({
  point,
  onClose,
  items,
  label,
  header,
  className,
  testId,
}: ContextMenuProps) => {
  const id = useId();
  /*
   * Agactaki SAHIP: noktanin DOM ogesi yok, ama portal hedefi (en yakin acik `<dialog>`) agactaki
   * konumdan cozulur — modalin icindeki menu govdeye portallanirsa ust katmanin ALTINDA kalirdi.
   */
  const ownerRef = useRef<HTMLSpanElement>(null);
  const isOpen = point !== null && enabledIndexes(items).length > 0;

  const x = point?.x ?? 0;
  const y = point?.y ?? 0;
  const anchorRef = useMemo(
    () => ({
      current: { getBoundingClientRect: () => ({ top: y, left: x, width: 0, height: 0 }) },
    }),
    [x, y],
  );

  /*
   * Odak YAKALAMA yuzeyin odagi tasimasindan ONCE olmali: yuzeyin `useEffect`i (ilk ogeye odak)
   * cocukta, bu `useLayoutEffect` ise tum pasif etkilerden once kosar. Temizlik = geri yukleme
   * (kapanis da sokulme de).
   */
  useLayoutEffect(() => {
    if (!isOpen) return;
    return captureFocus();
  }, [isOpen]);

  return (
    <>
      <span ref={ownerRef} hidden />

      {isOpen && (
        <MenuSurface
          /* Yeni nokta = yeni acilis: konum yeniden olculur, odak ilk ogeye doner. */
          key={`${x}:${y}`}
          id={id}
          items={items}
          label={label}
          anchorRef={anchorRef}
          ownerRef={ownerRef}
          side="bottom"
          align="start"
          offset={POINT_OFFSET}
          initial="first"
          header={header}
          className={className}
          testId={testId}
          onClose={onClose}
          onContextMenu={preventNativeMenu}
        />
      )}
    </>
  );
};

export const ContextMenu = /*#__PURE__*/ named(/*#__PURE__*/ memo(ContextMenuBase), 'ContextMenu');
