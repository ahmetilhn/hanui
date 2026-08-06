/** Kaydırma yardımcıları. */

/** Öğeyi görünür alana kaydırır; ortam desteklemiyorsa sessizce geçer. */
export const scrollIntoViewIfPossible = (
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions,
): void => {
  if (typeof element?.scrollIntoView === 'function') element.scrollIntoView(options);
};
