/** Kaydırma yardımcıları. */

import { isClient } from '@ahmetilhn/handy-utils';

/**
 * Pencereyi en üste alır; ortam desteklemiyorsa sessizce geçer.
 *
 * ⚠ Kaydırma ANIDIR. Yumuşak kaydırma sayfalamada içerik değişirken sürüyor
 * olur: kullanıcı yeni listeyi hareket hâlinde görür ve uzun katalog
 * sayfasında tıklama ile üste varış arasında saniyeler geçer.
 */
export const scrollWindowToTop = (): void => {
  if (!isClient() || typeof window.scrollTo !== 'function') return;

  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

/** Öğeyi görünür alana kaydırır; ortam desteklemiyorsa sessizce geçer. */
export const scrollIntoViewIfPossible = (
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions,
): void => {
  if (typeof element?.scrollIntoView === 'function') element.scrollIntoView(options);
};
