/** Aranabilir seçim kutusunun ölçüleri. */

/** Sanallaştırmanın devreye girdiği eşik. */
export const VIRTUAL_THRESHOLD = 80;

/** Seçenek satırının yüksekliği (`--sheet` dışında). */
export const OPTION_HEIGHT = 40;

/**
 * Uzak arama tetiklenmeden önce beklenen süre — her tuşta istek atılmaz.
 *
 * ⚠ `Tooltip.openDelay` da 300 ms ama İKİSİ AYNI ŞEY DEĞİL: biri ağ isteğini
 * geciktirir, diğeri balonun açılmasını. Ortak bir sabite katlamak, birini
 * ayarlayanın diğerini de sessizce değiştirmesi olurdu.
 */
export const SEARCH_DEBOUNCE_MS = 300;
