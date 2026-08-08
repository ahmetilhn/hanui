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

  /* `isContentEditable` mirasi da kapsar (duzenlenebilir bolgenin ICINDEKI
     oge), ama jsdom onu uygulamiyor ve her zaman false donuyor; oznitelik
     kontrolu testte de gecerli olan yedek. */
  if (element.isContentEditable) return true;
  const editable = element.getAttribute('contenteditable');
  if (editable === '' || editable === 'true' || editable === 'plaintext-only') return true;

  const tagName = element.tagName;
  if (tagName === 'TEXTAREA') return true;
  if (tagName !== 'INPUT') return false;

  return !NON_TEXT_INPUT_TYPES.has((element as HTMLInputElement).type);
};

/**
 * `showModal()` ÇAĞRILDIKTAN SONRA çağrılır. Odak bir metin alanına düştüyse
 * panelin kendisine geri alınır; düşmediyse hiçbir şey yapılmaz.
 */
export const preventAutoKeyboard = (dialog: HTMLDialogElement): void => {
  const active = dialog.ownerDocument.activeElement;
  if (!dialog.contains(active) || !isKeyboardOpeningElement(active)) return;

  (active as HTMLElement).blur();
  // `<dialog>` varsayılan olarak odaklanabilir değil; odağı alabilmesi için
  // sıra dışı bırakılır (Tab ile gezinmede görünmez, `focus()` ile alınır).
  dialog.tabIndex = -1;
  dialog.focus({ preventScroll: true });
};

/**
 * ODAK GERİ DÖNÜŞÜ.
 *
 * @returns Odağı geri veren fonksiyon.
 */
export const captureFocus = (): (() => void) => {
  const previous = typeof document === 'undefined' ? null : document.activeElement;

  return () => {
    if (!(previous instanceof HTMLElement)) return;

    /*
     * Oge hala BELGEDE mi: acan dugme, panel kapanirken DOM'dan kalkmis
     * olabilir (bir satiri silen onay penceresi, satirla birlikte dugmeyi de
     * goturuyor). Kalkmis bir ogeye `focus()` sessizce hicbir sey yapmiyor ve
     * odak yine `<body>`ye dusuyordu; cagiran taraf bunu bilip alternatif bir
     * hedef verebilmeli.
     */
    if (!previous.isConnected) return;

    /* `preventScroll` — odaklanan oge gorunum alaninin disindaysa tarayici
       sayfayi oraya kaydiriyor ve kullanici kapattigi pencerenin yerine bambaska
       bir yere bakiyordu. */
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
 *
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

/** KİPSEL YIĞIN — üst üste binen paneller. */
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

/** Yalnızca test içindir: modül düzeyindeki yığın testler arasında sızmamalı. */
export const resetModalStack = (): void => {
  modalStack.length = 0;
};
