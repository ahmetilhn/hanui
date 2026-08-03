/**
 * Kipsel panel açılırken ekran klavyesinin kendiliğinden açılmasını engeller.
 *
 * <h3>Sorun</h3>
 * `showModal()` odağı panelin <strong>ilk odaklanabilir öğesine</strong> taşır
 * (HTML "dialog focusing steps"). O öğe bir metin alanıysa telefonda klavye
 * kendiliğinden açılır: alt sayfa yarı yüksekliğe sıkışır, liste kısalır ve
 * kullanıcı yazmak istemediği hâlde önce klavyeyi kapatmak zorunda kalır.
 *
 * <h3>Neden odak tümüyle bırakılmıyor</h3>
 * Odağı panelin dışında bırakmak kip semantiğini bozar: odak tuzağı çalışmaz,
 * Escape panele ulaşmaz ve ekran okuyucu paneli hiç duyurmaz. Odak panelin
 * KENDİSİNE alınır — kip davranışı durur, klavye açılmaz.
 */

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
 * <p>Kipsel bir yüzey kapandığında odak, onu AÇAN öğeye dönmeli. Dönmezse
 * odak `<body>`ye düşer ve klavye kullanıcısı sayfanın en başına gider —
 * yirmi kez Tab'ladığı bir listede seçim yapan kullanıcı, seçimden sonra
 * yeniden yirmi kez Tab'lamak zorunda kalıyordu.
 *
 * <p>Açan öğeyi çağıranın hatırlaması gerekiyor: kapanış anında
 * `document.activeElement` çoktan panelin içindeki bir şey. {@link captureFocus}
 * açılışta çağrılır, döndürdüğü fonksiyon kapanışta.
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
 * <h3>"Anlamlı" ne demek: kapatma düğmesi DEĞİL</h3>
 * `showModal()` odağı DOM sırasındaki ilk odaklanabilir öğeye taşıyor ve o
 * öğe neredeyse her zaman başlıktaki kapatma düğmesi oluyor. Ekran okuyucu
 * pencereyi "Kapat, düğme" diye açıyor — kullanıcının duyduğu ilk şey,
 * pencerenin ne olduğu değil ondan nasıl kaçılacağı.
 *
 * <p>Bu fonksiyon `[data-hanui-autofocus]` işaretli öğeyi arar, yoksa
 * kapatma düğmesi DIŞINDAKİ ilk odaklanabilir öğeyi, o da yoksa panelin
 * kendisini odaklar. Panelin kendisi son çare: odağı panelin dışında bırakmak
 * kip semantiğini bozar (odak tuzağı çalışmaz, `Escape` panele ulaşmaz).
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

/**
 * KİPSEL YIĞIN — üst üste binen paneller.
 *
 * <p>Aynı anda iki kipsel yüzey açılabiliyor: bir onay penceresinin içindeki
 * seçim kutusu, filtre panelinin içindeki alt sayfa. `<dialog>` üst katmanda
 * (top layer) yaşadığı için görsel sıra tarayıcıdan geliyor — ama `Escape`
 * ve odak geri dönüşü İKİSİNE de ulaşıyordu: bir `Escape` her iki paneli
 * birden kapatıyordu.
 *
 * <p>Yığın, "en üstteki kim" sorusuna tek bir cevap veriyor. Kapanış olayını
 * yalnızca en üstteki işler.
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
export const isTopModal = (token: symbol): boolean => modalStack[modalStack.length - 1] === token;

/** Yalnızca test içindir: modül düzeyindeki yığın testler arasında sızmamalı. */
export const resetModalStack = (): void => {
  modalStack.length = 0;
};
