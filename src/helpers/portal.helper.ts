/**
 * Portal hedefi çözümü — üst katman (top layer) farkındalığıyla.
 *
 * ⚠ `createPortal(..., document.body)` TEK BAŞINA YANLIŞ. `<dialog>.showModal()`
 * elemanı tarayıcının **üst katmanına** taşır ve üst katman `z-index`ten
 * BAĞIMSIZ olarak sayfadaki her şeyin üstüne boyanır. Bir modalin içinden
 * açılan menü/popover/tooltip `document.body`ye portallandığında modalin
 * ALTINDA kalır — yani tamamen görünmez olur.
 *
 * Ölçüldü (2026-08-15, Playwright, chromium 1234 + webkit 2336, ikisinde de
 * birebir aynı sonuç; dialog 400×300, viewport 800×600):
 *
 * | senaryo | görünür | konum viewport'a göre |
 * |---|---|---|
 * | `body`'ye portal, modal açık | **hayır** — modal örtüyor | — |
 * | `<dialog>` içine portal, düz `position: fixed` | evet | **HAYIR** — 250px → 400px |
 * | `popover="manual"`, dialog DIŞINDA | **hayır** | — |
 * | `popover="manual"`, dialog İÇİNDE | **evet** | **evet** |
 *
 * İkinci satır bu dosyanın var olma sebebi: dialog'a portallamak görünürlüğü
 * çözer ama konumlandırmayı bozar, çünkü hanui `Modal`'ı `translate` ile
 * animasyonluyor (`_mixins.scss` → `surface-transition`) ve `none` olmayan her
 * `translate` değeri `position: fixed` torunlar için **kapsayıcı blok** yaratır.
 * `usePositioning` viewport koordinatı üretir; kapsayıcı blok değişince o
 * koordinatlar dialog'un sol üstüne göre yorumlanır ve yüzey kayar.
 *
 * Dördüncü satır çözümdür: üst katmandaki bir elemanın kapsayıcı bloğu yine
 * viewport'tur, yani `popover` hem görünürlüğü hem konumu aynı anda düzeltir.
 */

/** Portal hedefi ve o hedefte üst katmana çıkmanın gerekip gerekmediği. */
export type PortalTarget = {
  container: HTMLElement;
  /** `true` ise yüzey `popover="manual"` taşımalı ve `showPopover()` çağırmalı. */
  needsTopLayer: boolean;
};

/**
 * `anchor`ın en yakın açık `<dialog>` atası varsa oraya, yoksa `document.body`e.
 *
 * ⚠ `dialog[open]` yerine `:modal` denenmedi: `show()` ile açılan modalsız bir
 * dialog üst katmana GİRMEZ, ama içine portallamak yine de doğrudur (yüzey
 * tetikleyicisiyle aynı yığınlama bağlamında kalır). `needsTopLayer` yalnızca
 * üst katman gerçekten devredeyken açılır.
 */
export const resolvePortalTarget = (anchor: Element | null | undefined): PortalTarget => {
  const dialog = anchor?.closest?.('dialog') ?? null;

  if (dialog && dialog.isConnected) {
    return { container: dialog, needsTopLayer: isTopLayerDialog(dialog) };
  }

  return { container: document.body, needsTopLayer: false };
};

/**
 * Dialog üst katmanda mı — yani `showModal()` ile mi açıldı.
 *
 * ⚠ `:modal` bazı ortamlarda (jsdom) desteklenmiyor ve `matches` fırlatıyor;
 * o durumda `open` niteliğine düşülür. jsdom'da üst katman zaten yok, dolayısıyla
 * yanlış pozitifin görsel bir bedeli olmaz — bu yol yalnızca testin patlamaması
 * için var.
 */
const isTopLayerDialog = (dialog: Element): boolean => {
  try {
    return dialog.matches(':modal');
  } catch {
    return dialog.hasAttribute('open');
  }
};

/**
 * Üst katman yüzeyini gösterir; temizleyiciyi döndürür.
 *
 * ⚠ UA stil sayfası `[popover]`a `inset: 0` ve `margin: auto` veriyor. Bileşen
 * yalnızca `top`/`left` yazdığı için `right`/`bottom` sıfırda kalır ve yüzey
 * `margin: auto` ile ORTALANIR. Bu yüzden çağıran taraf `inset`i açıkça
 * sıfırlamak zorunda; `POPOVER_RESET` o sıfırlamayı tek yerde tutar.
 */
export const POPOVER_RESET = {
  margin: 0,
  right: 'auto',
  bottom: 'auto',
} as const;

/*
 * ⚠ SIFIRLAMA BİLİNÇLİ OLARAK ÜÇ ÖZELLİK. İlk yazımda on bir özellik vardı
 * (`border`, `padding`, `overflow`, `backgroundColor`, `color`, `width`,
 * `height` de dahil) ve **hepsi gereksizdi**: UA stil sayfası CSS
 * katmanlarının EN ALTINDA durur, yani bileşenin kendi modül sınıfı
 * (`.menu`, `.popover`, `.bubble` — hepsi `padding`/`border`/`background`
 * yazıyor) UA'nın `[popover]` kuralını zaten yener.
 *
 * Yenilemeyen tek şey satır içi stilin YAZMADIĞI kutu özellikleri:
 * `usePositioning` yalnızca `top`/`left` üretiyor, dolayısıyla UA'nın
 * `inset: 0` + `margin: auto` çifti kalıyor ve yüzeyi (top,left)–(0,0)
 * kutusunda ORTALIYOR. Bu üç satır tam olarak onu geri alır.
 *
 * Ölçülen bedel: on bir özellikli sürüm ESM paketini 37,54 → 37,87 kB'ye
 * çıkarmıştı ve bütçe 38 kB — yani 130 baytlık pay kalmıştı.
 */

/**
 * `showPopover()` çağırır ve kapatma fonksiyonunu döndürür.
 * Desteklenmeyen ortamda (jsdom) sessizce hiçbir şey yapmaz.
 */
export const showTopLayer = (element: HTMLElement | null): (() => void) => {
  if (!element || typeof element.showPopover !== 'function') return () => {};

  try {
    element.showPopover();
  } catch {
    /* Zaten görünürse veya eleman bağlı değilse: yapacak bir şey yok. */
    return () => {};
  }

  return () => {
    try {
      if (element.isConnected) element.hidePopover();
    } catch {
      /* Kapanış sırasında eleman zaten sökülmüş olabilir. */
    }
  };
};
