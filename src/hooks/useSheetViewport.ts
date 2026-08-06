'use client';

import { useEffect } from 'react';

/** Panelin kaplayabilecegi en fazla yukseklik — GORUNEN alanin yuksekligi. */
const HEIGHT_VAR = '--hanui-sheet-height';

/** Panelin dibinin, yerlesim gorunum alaninin dibinden ne kadar yukarida duracagi. */
const INSET_VAR = '--hanui-sheet-inset-bottom';

/* Tek olcum, tek dinleyici. */
let openCount = 0;
let frame = 0;

/** Gorsel gorunum alanini olcup CSS degiskenlerine yazar. */
/** MAKUL EN KÜÇÜK GÖRÜNÜM ALANI. */
const MIN_VIEWPORT_HEIGHT = 240;

const measure = () => {
  const viewport = window.visualViewport;
  if (!viewport) return;

  /* ABSURT OLCUM YAZILMAZ. */
  if (viewport.height < MIN_VIEWPORT_HEIGHT) return;

  const covered = window.innerHeight - viewport.height - viewport.offsetTop;
  const root = document.documentElement;

  root.style.setProperty(INSET_VAR, `${Math.max(0, Math.round(covered))}px`);
  root.style.setProperty(HEIGHT_VAR, `${Math.round(viewport.height)}px`);
};

/**
 * Kare başına bir ölçüm: klavye açılırken `resize` ve `scroll` ard arda
 * düşüyor ve her ölçüm bir yerleşim okuması.
 */
const schedule = () => {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    measure();
  });
};

/** Bekleyen kareyi iptal eder ve bayrağı serbest bırakır. */
const cancelScheduled = () => {
  if (!frame) return;
  window.cancelAnimationFrame(frame);
  frame = 0;
};

/**
 * Alt sayfayi <strong>gorunen</strong> alana yaslar.
 *
 * @param isActive Panel acik mi. Yalnizca acikken olculur: kendisi yalnizca
 * acikken cizilen bir panel varsayilani kullanir, ama sayfa boyunca DOM'da
 * duran bir panel bayraksiz cagirdiginda her kullanicida iki gorunum alani
 * dinleyicisi bos yere acik kaliyordu.
 */
const useSheetViewport = (isActive = true) => {
  useEffect(() => {
    if (!isActive) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    openCount += 1;

    if (openCount === 1) {
      viewport.addEventListener('resize', schedule);
      viewport.addEventListener('scroll', schedule);
      window.addEventListener('orientationchange', schedule);
    }

    /* Bekleyen kare IPTAL edilir ve olcum SENKRON yapilir. */
    cancelScheduled();
    measure();

    return () => {
      openCount -= 1;
      if (openCount > 0) return;

      viewport.removeEventListener('resize', schedule);
      viewport.removeEventListener('scroll', schedule);
      window.removeEventListener('orientationchange', schedule);

      cancelScheduled();

      /* Degiskenler SILINIR, sifirlanmaz: yedek deger CSS'te
         (`var(…, 0px)` / `var(…, 100dvh)`) ve panel kapaliyken dogru olan o. */
      document.documentElement.style.removeProperty(INSET_VAR);
      document.documentElement.style.removeProperty(HEIGHT_VAR);
    };
  }, [isActive]);
};

export default useSheetViewport;
