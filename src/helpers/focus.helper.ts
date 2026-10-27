/** Kipsel panel açılırken ekran klavyesinin kendiliğinden açılmasını engeller. */

/** Odaklanınca ekran klavyesi AÇMAYAN giriş türleri. */
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

/** Odaklanınca mobilde ekran klavyesini açacak bir öğe mi? */
export const isKeyboardOpeningElement = (element: Element | null): boolean => {
  if (!(element instanceof HTMLElement)) return false;

  /*
   * `isContentEditable` mirasi da kapsar (duzenlenebilir bolgenin ICINDEKI oge), ama jsdom onu
   * uygulamiyor ve her zaman false donuyor
   */
  if (element.isContentEditable) return true;
  const editable = element.getAttribute('contenteditable');
  if (editable === '' || editable === 'true' || editable === 'plaintext-only') return true;

  const tagName = element.tagName;
  if (tagName === 'TEXTAREA') return true;
  if (tagName !== 'INPUT') return false;

  return !NON_TEXT_INPUT_TYPES.has((element as HTMLInputElement).type);
};

/** `showModal()` ÇAĞRILDIKTAN SONRA çağrılır. */
export const preventAutoKeyboard = (dialog: HTMLDialogElement): void => {
  const active = dialog.ownerDocument.activeElement;
  if (!dialog.contains(active) || !isKeyboardOpeningElement(active)) return;

  (active as HTMLElement).blur();
  // `<dialog>` varsayılan olarak odaklanabilir değil; odağı alabilmesi için sıra dışı bırakılır
  // (Tab ile gezinmede görünmez, `focus()` ile alınır).
  dialog.tabIndex = -1;
  dialog.focus({ preventScroll: true });
};

/**
 * ODAK GERİ DÖNÜŞÜ.
 * @returns Odağı geri veren fonksiyon.
 */
export const captureFocus = (): (() => void) => {
  const previous = typeof document === 'undefined' ? null : document.activeElement;

  return () => {
    if (!(previous instanceof HTMLElement)) return;

    /*
     * Oge hala BELGEDE mi: acan dugme, panel kapanirken DOM'dan kalkmis olabilir (bir satiri silen
     * onay penceresi, satirla birlikte dugmeyi de goturuyor).
     */
    if (!previous.isConnected) return;

    /*
     * `preventScroll` — odaklanan oge gorunum alaninin disindaysa tarayici sayfayi oraya kaydiriyor
     * ve kullanici kapattigi pencerenin yerine bambaska bir…
     */
    previous.focus({ preventScroll: true });
  };
};

/** Odaklanabilir öğelerin seçicisi — `inert` ve `disabled` olanlar hariç. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
]
  .map(selector => `${selector}:not([inert]):not([aria-hidden="true"])`)
  .join(', ');

/**
 * Panelin İLK ANLAMLI öğesine odaklanır.
 * @param container Odak aranacak kök.
 * @param skipSelector Atlanacak öğe (varsayılan: kapatma düğmesi).
 */
export const focusFirstMeaningful = (
  container: HTMLElement,
  skipSelector = '[data-hanui-close]',
): void => {
  const explicit = container.querySelector<HTMLElement>('[data-hanui-autofocus]');
  if (explicit) {
    explicit.focus({ preventScroll: true });
    return;
  }

  const candidates = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
  const target = candidates.find(element => !element.matches(skipSelector)) ?? candidates[0];

  if (target) {
    target.focus({ preventScroll: true });
    return;
  }

  container.tabIndex = -1;
  container.focus({ preventScroll: true });
};

/**
 * KİPSEL YIĞIN — üst üste binen paneller. Sahiplik LIFO: en son açılan yüzey tuşu tüketir.
 * ⚠ Yığın yalnızca `<dialog>` tabanlı kipsel yüzeyleri DEĞİL, `Escape` ile kapanan HER yüzeyi taşır
 * (`Popover`, `Toast`, `Tooltip`).
 */
const modalStack: symbol[] = [];

/** Yığına katılır; dönen fonksiyon çıkarır. */
export const pushModal = (): { token: symbol; pop: () => void } => {
  const token = Symbol('hanui-modal');
  modalStack.push(token);

  return {
    token,
    pop: () => {
      const index = modalStack.indexOf(token);
      if (index >= 0) modalStack.splice(index, 1);
    },
  };
};

/** Verilen panel yığının EN ÜSTÜNDE mi. */
export const isTopModal = (token: symbol): boolean => modalStack.at(-1) === token;

/**
 * `Escape`i tüketecek AÇIK bir yüzey var mı — kipsel pencere, açılır panel, bildirim.
 * ⚠ Sayfa düzeyinde `Escape` dinleyen her kod (sohbetin "akışı durdur" kısayolu gibi) İKİSİNİ BİRDEN
 * sorar: `event.defaultPrevented || hasOpenSurface()`. Sormayan bir dinleyici, kullanıcı yalnızca bir
 * yüzeyi kapatmak isterken arkadaki işi de iptal ediyordu.
 * - `Popover`, `Tooltip` ve `Toast` tuşu belge düzeyindeki kendi dinleyicilerinde tüketir, işaretler
 *   (`preventDefault`) ve AYNI tuş vuruşunda yığından düşer: gerçek tarayıcıda React ayrık olayın
 *   güncellemesini dinleyiciler arasında boşaltır. Yüzeyin dinleyicisinden SONRA koşan kod (pencerede
 *   ya da belgede sonradan eklenmiş) burada `false` görür; ona kalan kanıt `defaultPrevented`.
 *   Ölçüldü (2026-10-27): yardım `Popover`ını kapatan `Escape` bir grafik seçimini de siliyordu.
 *   jsdom bunu göremez: `fireEvent` betikten gönderilir, dinleyiciler arasında mikro görev
 *   boşaltılmaz.
 * - Yüzeyin dinleyicisinden ÖNCE koşan kod işareti göremez ama yığın henüz düşmemiştir: `true`.
 * - `<dialog>` tabanlı kipsel yüzeyler (`Modal`, `Drawer`, `BottomSheet`, `CommandPalette`) tuş olayı
 *   bittikten sonra `cancel` ile kapanır: tuş boyunca burada `true`.
 */
export const hasOpenSurface = (): boolean => modalStack.length > 0;

/** Yalnızca test içindir: modül düzeyindeki yığın testler arasında sızmamalı. */
export const resetModalStack = (): void => {
  modalStack.length = 0;
};
