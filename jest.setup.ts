import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

/*
 * Eksen eslesticisi GLOBAL kaydedilir: `axe` ile taramak isteyen her test dosyasi ayrica
 * `expect.extend` yazmak zorunda kalmasin.
 */
expect.extend(toHaveNoViolations);

/* jsdom `<dialog>`i uygulamıyor: `showModal()` ve `close()` tanımsız. */
if (typeof HTMLDialogElement !== 'undefined') {
  if (!HTMLDialogElement.prototype.showModal)
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
    };

  if (!HTMLDialogElement.prototype.close)
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
}

/*
 * jsdom yerleşim (layout) yapmıyor, dolayısıyla `scrollIntoView` de yok. `Select` ve `Combobox`
 * etkin seçeneği görünür alanda tutmak için onu her ok…
 */
/* Node ortamında koşan testler (sunucu çizimi) DOM'suz: yamalar yalnızca jsdom'da. */
const hasDom = typeof window !== 'undefined';

if (hasDom && !Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

/* `visualViewport` jsdom'da yok; `useSheetViewport` onsuz sessizce çıkar. */
if (hasDom && !window.matchMedia)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
