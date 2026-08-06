'use client';

import { useCallback } from 'react';

import { isClient } from '@ahmetilhn/handy-utils';

/** Duyurunun aciliyeti. */
export type AnnouncePoliteness = 'polite' | 'assertive';

/**
 * EKRAN OKUYUCU DUYURU MERKEZİ.
 *
 * @example
 * const announce = useAnnounce();
 * announce(`${count} ürün bulundu`);
 * announce('Kart reddedildi', 'assertive');
 */

const REGION_ID = 'hanui-live-region';

/** Bölgeyi bulur; yoksa oluşturur. */
const getRegion = (politeness: AnnouncePoliteness): HTMLElement | null => {
  if (!isClient()) return null;

  const id = `${REGION_ID}-${politeness}`;
  const existing = document.getElementById(id);
  if (existing) return existing;

  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('aria-live', politeness);
  /* `aria-atomic` — bolge her degistiginde TAMAMI okunur. Kapali
     birakildiginda ekran okuyucular yalnizca DEGISEN kelimeleri okuyor ve
     "48 urun bulundu" ile "12 urun bulundu" arasinda yalnizca sayi
     duyuruluyordu. */
  region.setAttribute('aria-atomic', 'true');
  /* Gorsel olarak gizli ama DOM'da: `display: none` ya da `hidden` bolgeyi
     erisilebilirlik agacindan da cikarir ve hicbir sey duyurulmaz. */
  region.className = 'hanui-visually-hidden';

  document.body.appendChild(region);
  return region;
};

/** AYNI metni arka arkaya duyurmak. */
const write = (region: HTMLElement, message: string): void => {
  region.textContent = '';

  window.requestAnimationFrame(() => {
    region.textContent = message;
  });
};

/**
 * Duyuru fonksiyonu döndürür. Referans SABİT: bağımlılık dizisine güvenle
 * konur, her render'da yeni bir kapanış üretip etkileri tetiklemez.
 */
const useAnnounce = (): ((message: string, politeness?: AnnouncePoliteness) => void) =>
  useCallback((message: string, politeness: AnnouncePoliteness = 'polite') => {
    const trimmed = message.trim();
    /* Bos duyuru bolgeyi temizler ve bir sonraki gercek duyuruyu bastirir. */
    if (trimmed === '') return;

    const region = getRegion(politeness);
    if (region) write(region, trimmed);
  }, []);

export default useAnnounce;
