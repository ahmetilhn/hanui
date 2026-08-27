/**
 * Portal hedefi çözümü — üst katman (top layer) farkındalığıyla.
 * ⚠ `createPortal(..., document.body)` TEK BAŞINA YANLIŞ. `<dialog>.showModal()` elemanı
 * tarayıcının **üst katmanına** taşır ve üst katman…
 */

/** Portal hedefi ve o hedefte üst katmana çıkmanın gerekip gerekmediği. */
export type PortalTarget = {
  container: HTMLElement;
  /** `true` ise yüzey `popover="manual"` taşımalı ve `showPopover()` çağırmalı. */
  needsTopLayer: boolean;
};

/**
 * `anchor`ın en yakın açık `<dialog>` atası varsa oraya, yoksa `document.body`e.
 * ⚠ `dialog[open]` yerine `:modal` denenmedi: `show()` ile açılan modalsız bir dialog üst katmana
 * GİRMEZ, ama içine portallamak yine de…
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
 * ⚠ `:modal` bazı ortamlarda (jsdom) desteklenmiyor ve `matches` fırlatıyor
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
 * ⚠ UA stil sayfası `[popover]`a `inset: 0` ve `margin: auto` veriyor.
 */
export const POPOVER_RESET = {
  margin: 0,
  right: 'auto',
  bottom: 'auto',
} as const;

/*
 * Yenilemeyen tek şey satır içi stilin YAZMADIĞI kutu özellikleri: `usePositioning` yalnızca
 * `top`/`left` üretiyor, dolayısıyla UA'nın `inset: 0` +…
 * ⚠ SIFIRLAMA BİLİNÇLİ OLARAK ÜÇ ÖZELLİK.
 */

/** `showPopover()` çağırır ve kapatma fonksiyonunu döndürür. */
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
