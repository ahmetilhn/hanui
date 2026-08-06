'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

/** Yüzeyin tercih ettiği kenar. Yer yoksa karşıtına düşer. */
export type PositionSide = 'top' | 'bottom' | 'left' | 'right';

/** Tercih edilen kenar boyunca hizalama. */
export type PositionAlign = 'start' | 'center' | 'end';

export type PositioningOptions = {
  side?: PositionSide;
  align?: PositionAlign;
  /** Tetikleyici ile yüzey arasındaki boşluk (px). */
  offset?: number;
  /** Görünüm alanının kenarından bırakılacak asgari pay (px). */
  padding?: number;
  /** Kapalıyken ölçüm yapılmaz ve dinleyici kurulmaz. */
  isOpen: boolean;
};

export type PositioningState = {
  /** Yüzeye uygulanacak stil — `position: fixed` + hesaplanmış koordinat. */
  style: { position: 'fixed'; top: number; left: number };
  /** ÇÖZÜLMÜŞ kenar: çarpışma yüzünden tercih edilenin karşıtı olabilir. */
  side: PositionSide;
  /** İlk ölçüm yapıldı mı. Yapılmadan çizilen yüzey sol üst köşede parlıyor. */
  isPositioned: boolean;
};

const OPPOSITE: Record<PositionSide, PositionSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** Bir sayıyı [min, max] aralığına kırpar. */
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

type Rect = { top: number; left: number; width: number; height: number };

/** Verilen kenarda yüzeyin sol-üst köşesi nereye düşer. */
const place = (
  anchor: Rect,
  surface: { width: number; height: number },
  side: PositionSide,
  align: PositionAlign,
  offset: number,
): { top: number; left: number } => {
  const isVertical = side === 'top' || side === 'bottom';

  /* Ana eksen: tetikleyicinin disinda, `offset` kadar uzakta. */
  const main = {
    top: anchor.top - surface.height - offset,
    bottom: anchor.top + anchor.height + offset,
    left: anchor.left - surface.width - offset,
    right: anchor.left + anchor.width + offset,
  }[side];

  /* Capraz eksen: hizalama. */
  const crossStart = isVertical ? anchor.left : anchor.top;
  const crossSize = isVertical ? anchor.width : anchor.height;
  const surfaceSize = isVertical ? surface.width : surface.height;

  const cross = {
    start: crossStart,
    center: crossStart + crossSize / 2 - surfaceSize / 2,
    end: crossStart + crossSize - surfaceSize,
  }[align];

  return isVertical ? { top: main, left: cross } : { top: cross, left: main };
};

/** Yüzey görünüm alanına sığıyor mu (yalnızca ana eksende). */
const fits = (
  position: { top: number; left: number },
  surface: { width: number; height: number },
  side: PositionSide,
  padding: number,
  viewport: { width: number; height: number },
): boolean =>
  ({
    top: position.top >= padding,
    bottom: position.top + surface.height <= viewport.height - padding,
    left: position.left >= padding,
    right: position.left + surface.width <= viewport.width - padding,
  })[side];

/**
 * ÇARPIŞMAYA DUYARLI KONUMLANDIRMA — `Tooltip`, `Popover`, `Menu` ve açılır
 * listelerin ortak temeli.
 */
const usePositioning = (
  anchorRef: { current: HTMLElement | null },
  surfaceRef: { current: HTMLElement | null },
  { side = 'top', align = 'center', offset = 8, padding = 8, isOpen }: PositioningOptions,
): PositioningState => {
  const [state, setState] = useState<PositioningState>({
    style: { position: 'fixed', top: 0, left: 0 },
    side,
    isPositioned: false,
  });

  /* Olcum her karede yeniden planlanmasin: kaydirma sirasinda saniyede
     onlarca olay dusuyor ve her biri bir yerlesim okumasi. */
  const frameRef = useRef(0);

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    const surface = surfaceRef.current;
    if (!anchor || !surface) return;

    const anchorRect = anchor.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    /*
     * KENAR SECIMI: tercih edilen kenar sigmiyorsa KARSITI denenir; o da
     * sigmiyorsa tercih edilene donulur ve kirpma devreye girer. Ucuncu bir
     * kenara (dikeyden yataya) atlamak YOK — bir ipucu bir anda saga zipladiginda
     * kullanici onu tetikleyiciyle iliskilendiremiyor.
     */
    const preferred = place(anchorRect, surfaceRect, side, align, offset);
    const resolvedSide = fits(preferred, surfaceRect, side, padding, viewport)
      ? side
      : fits(
            place(anchorRect, surfaceRect, OPPOSITE[side], align, offset),
            surfaceRect,
            OPPOSITE[side],
            padding,
            viewport,
          )
        ? OPPOSITE[side]
        : side;

    const placed = place(anchorRect, surfaceRect, resolvedSide, align, offset);

    /* Capraz eksende KIRPMA: ekranin sag ucundaki bir tetikleyicinin balonu
       disari tasmak yerine kenara yaslanir. */
    setState({
      style: {
        position: 'fixed',
        top: Math.round(clamp(placed.top, padding, viewport.height - surfaceRect.height - padding)),
        left: Math.round(clamp(placed.left, padding, viewport.width - surfaceRect.width - padding)),
      },
      side: resolvedSide,
      isPositioned: true,
    });
  }, [anchorRef, surfaceRef, side, align, offset, padding]);

  const schedule = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      measure();
    });
  }, [measure]);

  /*
   * `useLayoutEffect`: olcum BOYAMADAN once yapilmali. `useEffect` ile
   * yuzey bir kare boyunca (0, 0) noktasinda — ekranin sol ust kosesinde —
   * cizilip sonra yerine ziplyordu.
   */
  const useIsomorphicLayoutEffect = isClient() ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      setState(current => (current.isPositioned ? { ...current, isPositioned: false } : current));
      return;
    }

    measure();

    window.addEventListener('resize', schedule);
    /* `capture: true` — kaydirma olayi BALONCUKLANMAZ; yakalama evresinde
       dinlemek, tetikleyicinin kaydirilan HER atasini tek dinleyiciyle
       kapsar. */
    document.addEventListener('scroll', schedule, true);

    /* Yuzeyin kendi olcusu degisebiliyor (icerik geldi, liste suzuldu) ve
       degistiginde konum yanlis kalir. */
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    if (observer && surfaceRef.current) observer.observe(surfaceRef.current);
    if (observer && anchorRef.current) observer.observe(anchorRef.current);

    return () => {
      window.removeEventListener('resize', schedule);
      document.removeEventListener('scroll', schedule, true);
      observer?.disconnect();

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [isOpen, measure, schedule, anchorRef, surfaceRef]);

  return state;
};

export default usePositioning;
