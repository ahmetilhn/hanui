/** Kaydırma yardımcıları. */

import { isClient } from '@handijit/utils';

/**
 * Pencereyi en üste alır; ortam desteklemiyorsa sessizce geçer.
 * ⚠ Kaydırma ANIDIR.
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
