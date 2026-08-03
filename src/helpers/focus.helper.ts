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
