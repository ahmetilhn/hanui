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

/*
 * jsdom'un CSS ayrıştırıcısı `@layer`ı tanımıyor ve her tema ezmesinde "Could not parse CSS
 * stylesheet" basıyor; ezme 5.6.3'ten beri `@layer hanui` içinde. Tarayıcıda geçerli bir kural —
 * yalnız bu ayrıştırma hatası susturulur, başka her hata görünür kalır.
 */
if (hasDom) {
  const consoleError = console.error.bind(console);

  console.error = (...args: unknown[]) => {
    /* Hata jsdom'un realm'inden geliyor: `instanceof Error` orada tutmuyor. */
    const { message, detail } = (args[0] ?? {}) as { message?: unknown; detail?: unknown };
    const isLayerParseError =
      String(message).startsWith('Could not parse CSS stylesheet') &&
      String(detail).startsWith('@layer');

    if (!isLayerParseError) consoleError(...args);
  };
}
