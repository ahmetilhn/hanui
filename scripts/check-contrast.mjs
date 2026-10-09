/** KONTRAST DENETÇİSİ — `npm run check:contrast`, `verify` içinde. */
import { contrast, round } from './lib/contrast.mjs';
import { loadTokens } from './lib/load-tokens.mjs';

const { LIGHT_THEME, DARK_THEME } = await loadTokens();

const THRESHOLD = { text: 4.5, large: 3, graphic: 3 };

/** Yüzeyler: temanın "arkasında ne var" kümesi. */
const SURFACES = ['page', 'surface', 'surface-2', 'surface-3', 'surface-inset'];

/** Durum üçlüleri: `<ad>-bg` / `<ad>-fg` / `<ad>-line`. */
const TINTS = ['ok', 'warn', 'off', 'bad', 'oem', 'alt'];

/** Bantlar kendi yüzey merdivenini taşır; metinleri de ayrı. */
const NAV_SURFACES = ['nav-bg', 'nav-bg-2', 'footer-bg'];

/**
 * Ölçülecek çiftler.
 * @returns `{ fg, bg, tier, base? }` — `base`, saydam bir ZEMİNİN arkasında duran…
 */
const buildPairs = () => {
  const pairs = [];
  const add = (fg, bg, tier, base) => pairs.push({ fg, bg, tier, base });

  // --- Gövde metni ---
  for (const surface of SURFACES) add('text', surface, 'text');
  for (const surface of ['page', 'surface', 'surface-2', 'surface-inset'])
    add('text-2', surface, 'text');
  /* `text-3` de `surface-2` üzerinde ölçülür. */
  for (const surface of ['page', 'surface', 'surface-inset', 'surface-2'])
    add('text-3', surface, 'text');

  // --- Dolgu üzerindeki metin: her etkileşim durumu ayrı ölçülür ---
  for (const fill of ['action', 'action-hover', 'action-active']) add('on-action', fill, 'text');
  for (const fill of ['cart', 'cart-hover', 'cart-active']) add('on-cart', fill, 'text');

  /*
   * PASİF DOLGU ÜZERİNDEKİ METİN — WCAG'in muaf tuttuğu ama kütüphanenin kendine ŞART KOŞTUĞU tek
   * çift.
   */
  add('on-action-soft', 'action-soft', 'text');
  for (const fill of ['danger-solid', 'danger-solid-hover']) add('on-danger', fill, 'text');

  /*
   * Seçim dolgusu üzerindeki metin — etkin sayfa numarası (`Pagination`), etkin karo madalyonu
   * (`Tile`), geçerli adım (`Steps`). Koyu temada dolgu krem, metin siyah.
   */
  for (const fill of ['selected', 'selected-hover', 'selected-active'])
    add('on-selected', fill, 'text');
  /* Seçili satır / seçenek: zemin `selected-tint`, metin gövde metni. */
  add('text', 'selected-tint', 'text');

  /* Mürekkep yüzey (terminal, teknik blok) — temadan bağımsız. */
  for (const fill of ['shell', 'shell-2', 'shell-3']) {
    add('on-shell', fill, 'text');
    add('on-shell-2', fill, 'text');
    add('on-shell-danger', fill, 'text');
  }

  /* `on-green` YALNIZCA `green-accent` ile ölçülür, hover'ıyla değil. */
  add('on-green', 'green-accent', 'text');

  // --- Bağlantı ---
  for (const surface of ['page', 'surface', 'surface-2', 'surface-inset']) {
    add('link', surface, 'text');
    add('link-hover', surface, 'text');
  }

  // --- Durum üçlüleri ---
  for (const tint of TINTS) add(`${tint}-fg`, `${tint}-bg`, 'text');
  add('sale-fg', 'sale-bg', 'text');

  // --- Bantlar ---
  for (const band of NAV_SURFACES) {
    add('nav-fg', band, 'text');
    add('nav-fg-2', band, 'text');
    add('nav-fg-3', band, 'text');
  }

  /* Marka şeridi: temadan bağımsız, iki temada da aynı çift ölçülür. */
  add('band-fg', 'band-bg', 'text');
  add('band-fg-2', 'band-bg', 'text');
  add('band-fg-3', 'band-bg', 'text');

  // --- Örtü ve cam: saydam; arkalarında sayfa var ---
  add('on-scrim', 'scrim', 'text', 'page');
  add('text', 'glass', 'text', 'page');
  add('text', 'glass-solid', 'text');

  /*
   * `scrim-soft` metin taşımaz — görselin üzerine binen HAFİF bir örtü, altındaki fotoğrafın
   * görünür kalması için var.
   */

  // --- Grafik ve ikon (1.4.11) ---
  for (const surface of ['page', 'surface', 'surface-2']) {
    /*
     * Birincil düğmenin SINIRI eşiği taşıyan taraf: dolgunun kendisi (çam) koyu temada koyu yüzeyde
     * 1,04:1 ve advisory listede kalıyor.
     */
    add('action-line', surface, 'graphic');
    add('ring-color', surface, 'graphic');
    add('red-accent', surface, 'graphic');
    add('green-accent', surface, 'graphic');
    add('star', surface, 'graphic');
    /* Seçim dolgusu tek başına durum taşır (onay kutusu, anahtar, ilerleme): grafik eşiği. */
    add('selected', surface, 'graphic');
    for (const series of ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'series-1', 'series-2'])
      add(series, surface, 'graphic');
  }

  return pairs;
};

/** Ölçülür ama derlemeyi kırmaz — gerekçe dosya başlığında. */
const buildAdvisoryPairs = () => {
  const pairs = [];
  const add = (fg, bg) => pairs.push({ fg, bg, tier: 'advisory' });

  for (const tint of TINTS) add(`${tint}-line`, `${tint}-bg`);
  for (const surface of ['page', 'surface', 'surface-2']) {
    add('border', surface);
    add('border-strong', surface);
  }
  add('action-soft', 'surface');
  add('track', 'surface');
  add('selected-tint', 'surface');
  add('shell-line', 'page');
  add('nav-line', 'nav-bg');
  add('nav-line-strong', 'nav-bg');

  /* Dolu düğmenin sayfaya karşı sınırı. */
  for (const fill of ['action', 'cart', 'danger-solid', 'selected'])
    for (const surface of ['page', 'surface']) add(fill, surface);

  return pairs;
};

const measure = (theme, pairs) =>
  pairs.map(pair => {
    const ratio = round(contrast(theme[pair.fg], theme[pair.bg], theme[pair.base ?? 'page']));
    const required = THRESHOLD[pair.tier] ?? 0;

    return { ...pair, ratio, required, isFailing: pair.tier !== 'advisory' && ratio < required };
  });

const format = row =>
  `${row.isFailing ? '✗' : '·'} ${String(row.ratio.toFixed(2)).padStart(6)}:1 ` +
  `(≥${row.required || '—'})  ${row.fg} / ${row.bg}`;

const themes = [
  ['LIGHT', LIGHT_THEME],
  ['DARK', DARK_THEME],
];

const pairs = buildPairs();
const advisory = buildAdvisoryPairs();
const failures = [];

for (const [name, theme] of themes) {
  const rows = measure(theme, pairs);
  const failed = rows.filter(row => row.isFailing);
  failures.push(...failed.map(row => ({ ...row, theme: name })));

  console.log(`\n${name} — ${rows.length} çift, ${failed.length} ihlal`);
  for (const row of failed) console.log(`  ${format(row)}`);

  if (process.env.HANUI_CONTRAST_VERBOSE) {
    console.log(`  — advisory (kırmaz) —`);
    for (const row of measure(theme, advisory)) console.log(`  ${format(row)}`);
  }
}

if (failures.length > 0) {
  console.error(
    `\nhanui: ${failures.length} kontrast ihlali. Düzeltme src/theme/palette.ts` +
      ` içinde yapılır — bileşenin SCSS'ine tek seferlik bir renk yazmak,` +
      ` aynı tonu kullanan diğer yerleri sessizce ihlalde bırakır.\n`,
  );
  process.exit(1);
}

console.log(
  `\nhanui: ${pairs.length * 2} kontrast çifti temiz` +
    ` (metin ≥${THRESHOLD.text}:1, grafik ≥${THRESHOLD.graphic}:1).` +
    ` Advisory için: HANUI_CONTRAST_VERBOSE=1\n`,
);
