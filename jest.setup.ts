import '@testing-library/jest-dom';

/*
 * jsdom `<dialog>`i uygulamıyor: `showModal()` ve `close()` tanımsız.
 * Kip pencere ve alt sayfa testleri onlara dayanıyor — saplama, açık/kapalı
 * durumunu `open` özniteliğine yazar ve `cancel` olayını gerçek tarayıcı gibi
 * `Escape` üzerinden tetiklenebilir bırakır.
 */
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
 * jsdom yerleşim (layout) yapmıyor, dolayısıyla `scrollIntoView` de yok.
 * `Select` ve `Combobox` etkin seçeneği görünür alanda tutmak için onu her
 * ok tuşunda çağırıyor — saplama olmadan test, ürün kodundaki bir hatayı
 * değil jsdom'un bir eksiğini raporluyordu.
 */
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

/* `visualViewport` jsdom'da yok; `useSheetViewport` onsuz sessizce çıkar. */
if (!window.matchMedia)
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
