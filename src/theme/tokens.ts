import {
  ACCENT,
  AMBER,
  BLUE,
  DANGER_SOLID,
  GRAPHITE,
  NEUTRAL,
  SALE,
  STAR,
  STATUS,
} from './palette';

/**
 * TEMA TOKEN'LARI.
 *
 * <p>Her anahtar bir CSS özel özelliğine karşılık gelir: `page` →
 * `--hanui-page`. Bileşenler SCSS tarafında yalnızca bu adları görür ve hepsi
 * bir `var(--hanui-…)` işaret eder.
 *
 * <h3>Neden CSS değişkeni, neden SCSS değişkeni değil</h3>
 * Açık/koyu tema ÇALIŞMA ZAMANINDA değişir; SCSS değişkeni derleme anında
 * sabitlenir ve tek derlemeden iki tema çıkmaz. Bunun iki sonucu var:
 *
 * <ol>
 *   <li>Renk üzerinde SCSS renk fonksiyonu ÇALIŞMAZ (`rgba($surface, .9)`
 *       derlenmez). Gereken her saydam değer hazır token olarak durur:
 *       `scrim`, `glass`, `ring`, `track`, `glow-1`…</li>
 *   <li>`prefers-color-scheme` ile renk SEÇİLMEZ. Tema `data-hanui-theme`
 *       üzerinden gelir; medya sorgusu kullanıcının açık seçimini görmez —
 *       yalnızca hiç seçim yapılmadığında yedek olarak devreye girer.</li>
 * </ol>
 */

/** Hex rengi `rgba(...)` dizesine çevirir. Renk fonksiyonu üretim ANINDA çalışır. */
const alpha = (hex: string, value: number): string => {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map(character => character + character)
          .join('')
      : normalized;

  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${value})`;
};

const BLACK = '#000000';

/**
 * AÇIK TEMA — varsayılan.
 *
 * <p>Bilgi yoğunluğu yüksek ekranlarda açık zeminde okunurluk daha yüksek.
 */
export const LIGHT_THEME = {
  // --- Yüzey ---
  page: NEUTRAL.n50,
  surface: NEUTRAL.n0,
  'surface-2': NEUTRAL.n100,
  'surface-3': NEUTRAL.n150,
  'surface-inset': NEUTRAL.n25,

  // --- Kenarlık ---
  border: NEUTRAL.n250,
  'border-strong': NEUTRAL.n300,

  // --- Metin ---
  text: NEUTRAL.n900,
  'text-2': NEUTRAL.n600,
  'text-3': NEUTRAL.n550,

  // --- Grafit: bant, alt bilgi, tablo başlığı, teknik blok ---
  graphite: GRAPHITE.base,
  'graphite-2': GRAPHITE.two,
  'graphite-3': GRAPHITE.three,

  /*
   * BİRİNCİL EYLEM (dolgulu, nötr).
   *
   * `action` grafittir, amber DEĞİL. Amber tek bir dönüşüm noktasına
   * ayrılmıştır; her dolu düğmeyi amber yapmak o tekilliği yok eder ve
   * kullanıcı hangi turuncunun dönüşüm olduğunu bilemez.
   */
  action: GRAPHITE.base,
  'action-hover': GRAPHITE.two,
  'action-active': GRAPHITE.three,
  'on-action': NEUTRAL.n0,
  /** Pasif dolgu; saydamlık DEĞİL kendi rengi (bkz. Button `:disabled`). */
  'action-soft': NEUTRAL.n300,

  // --- Dönüşüm eylemi: ekrandaki tek doygun turuncu ---
  amber: AMBER.base,
  'amber-hover': AMBER.hover,
  'amber-active': AMBER.active,
  'amber-soft': AMBER.soft,
  'on-amber': AMBER.on,

  // --- Mavi: gezinme ve keşif ---
  blue: BLUE.base,
  'blue-hover': BLUE.hover,
  'blue-active': BLUE.active,
  'blue-text': BLUE.text,
  'blue-tint': BLUE.tint,
  'blue-line': BLUE.line,

  // --- Durum: tint zemin + koyu metin + eşleşen hairline ---
  'ok-bg': STATUS.okBg,
  'ok-fg': STATUS.okFg,
  'ok-line': STATUS.okLine,

  'warn-bg': STATUS.warnBg,
  'warn-fg': STATUS.warnFg,
  'warn-line': STATUS.warnLine,

  'off-bg': STATUS.offBg,
  'off-fg': STATUS.offFg,
  'off-line': STATUS.offLine,

  'bad-bg': STATUS.badBg,
  'bad-fg': STATUS.badFg,
  'bad-line': STATUS.badLine,

  'oem-bg': STATUS.oemBg,
  'oem-fg': STATUS.oemFg,
  'oem-line': STATUS.oemLine,

  'alt-bg': STATUS.altBg,
  'alt-fg': STATUS.altFg,
  'alt-line': STATUS.altLine,

  'sale-bg': SALE.bg,
  'sale-fg': SALE.fg,

  // --- İkon vurguları: METİN DEĞİL (WCAG grafik eşiği 3:1) ---
  'red-accent': ACCENT.red,
  'green-accent': ACCENT.green,
  'green-accent-hover': ACCENT.greenHover,
  'on-green': ACCENT.onGreen,
  star: STAR.light,

  // --- Yıkıcı eylem: durum tinti DEĞİL, gerçek bir dolgu ---
  'danger-solid': DANGER_SOLID.base,
  'danger-solid-hover': DANGER_SOLID.hover,
  'on-danger': NEUTRAL.n0,

  /*
   * ÜST BANT / ALT BİLGİ / KAHRAMAN BÖLÜMÜ.
   *
   * BU TOKEN'LAR TEMAYI İZLER: açık temada her yer açık, koyu temada her yer
   * koyu. Ayrı bir ad kümesi olarak kalıyorlar çünkü bantların KENDİ yüzey
   * merdiveni var: üst bant sayfadan bir kademe yükselir (beyaz zemin, gri
   * sayfa üzerinde), alt bilgi bir kademe çöker. Bunu `surface` ile yazmak
   * iki bandı sayfayla aynı tonda bırakıyordu.
   */
  'nav-bg': NEUTRAL.n0,
  'nav-bg-2': NEUTRAL.n100,
  'nav-fg': NEUTRAL.n900,
  'nav-fg-2': NEUTRAL.n600,
  'nav-fg-3': NEUTRAL.n500,
  'nav-line': NEUTRAL.n200,
  'nav-line-strong': NEUTRAL.n300,
  'nav-hover': NEUTRAL.n100,
  'footer-bg': NEUTRAL.n100,

  // --- Gölge: nötr-serin (sıcak gölge serin gri zeminde kirli durur) ---
  'shadow-xs': `0 1px 2px ${alpha(NEUTRAL.n900, 0.05)}`,
  'shadow-sm': `0 1px 2px ${alpha(NEUTRAL.n900, 0.05)}, 0 1px 3px ${alpha(NEUTRAL.n900, 0.04)}`,
  'shadow-md': `0 2px 4px ${alpha(NEUTRAL.n900, 0.04)}, 0 6px 16px ${alpha(NEUTRAL.n900, 0.07)}`,
  'shadow-lg': `0 4px 8px ${alpha(NEUTRAL.n900, 0.05)}, 0 16px 32px ${alpha(NEUTRAL.n900, 0.1)}`,
  'shadow-xl': `0 8px 16px ${alpha(NEUTRAL.n900, 0.06)}, 0 28px 56px ${alpha(NEUTRAL.n900, 0.13)}`,
  /** Yapışkan alt bar; gölge YUKARI düşer. */
  'shadow-up': `0 -2px 4px ${alpha(NEUTRAL.n900, 0.03)}, 0 -8px 24px ${alpha(NEUTRAL.n900, 0.08)}`,

  /** Odak halkası MAVİ: odak bir gezinme olayıdır, bir dönüşüm değil. */
  ring: `0 0 0 3px ${alpha(BLUE.base, 0.28)}`,
  'ring-color': BLUE.base,
  'ring-danger': `0 0 0 3px ${alpha(DANGER_SOLID.base, 0.24)}`,
  'ring-ok': `0 0 0 4px ${alpha(STATUS.okFg, 0.16)}`,

  // --- Örtü ve cam: görsel üzerine binen yüzeyler ---
  scrim: alpha(NEUTRAL.n900, 0.55),
  'scrim-soft': alpha(NEUTRAL.n900, 0.32),
  glass: alpha(NEUTRAL.n0, 0.92),
  'glass-solid': NEUTRAL.n0,
  'on-scrim': NEUTRAL.n0,

  // --- İskelet ve dönen gösterge ---
  'skeleton-a': NEUTRAL.n100,
  'skeleton-b': NEUTRAL.n25,
  track: alpha(NEUTRAL.n900, 0.12),

  /** Görsel yer tutucu (medya yoksa). */
  'media-bg': NEUTRAL.n100,

  /*
   * Vurgu bloğundaki ışık lekeleri. Açık temada ZEMİN DE AÇIK olduğu için
   * lekeler çok daha hafif: koyu bant için ayarlanmış %22 opaklık açık
   * zeminde lekeyi kirli bir dasa çeviriyordu.
   */
  'glow-1': alpha(BLUE.base, 0.1),
  'glow-2': alpha(BLUE.base, 0.06),
  'glow-amber': alpha(AMBER.base, 0.09),
} as const;

/**
 * KOYU TEMA.
 *
 * <p>Yüzey merdiveni açık temanın AYNISI DEĞİL, tersi: koyu temada yükselen
 * yüzey AÇILIR (`surface` > `page`), çünkü ışık yukarıdan gelir. Aynı sırayı
 * korumak kartları sayfaya gömüyordu.
 */
export const DARK_THEME: Record<keyof typeof LIGHT_THEME, string> = {
  page: '#0e1116',
  surface: '#171b22',
  'surface-2': '#1f242d',
  'surface-3': '#262c36',
  'surface-inset': '#13171d',

  border: '#262c36',
  'border-strong': '#363e4a',

  text: '#e7eaee',
  'text-2': '#9aa4b2',
  'text-3': '#6b7583',

  graphite: GRAPHITE.ink,
  'graphite-2': GRAPHITE.inkTwo,
  'graphite-3': GRAPHITE.two,

  /*
   * Koyu temada grafit dolgu sayfadan ayırt edilemez. Birincil eylem AÇIK bir
   * nötr yüzeye döner — koyu zeminde en yüksek vurgu budur.
   */
  action: NEUTRAL.n150,
  'action-hover': NEUTRAL.n0,
  'action-active': NEUTRAL.n300,
  'on-action': NEUTRAL.n900,
  'action-soft': '#414a58',

  amber: AMBER.dark,
  'amber-hover': AMBER.darkHover,
  'amber-active': AMBER.base,
  'amber-soft': '#6d5316',
  'on-amber': AMBER.on,

  blue: BLUE.dark,
  'blue-hover': BLUE.darkHover,
  'blue-active': BLUE.base,
  'blue-text': BLUE.dark,
  'blue-tint': BLUE.darkTint,
  'blue-line': BLUE.darkLine,

  'ok-bg': STATUS.okBgDark,
  'ok-fg': STATUS.okFgDark,
  'ok-line': STATUS.okLineDark,

  'warn-bg': STATUS.warnBgDark,
  'warn-fg': STATUS.warnFgDark,
  'warn-line': STATUS.warnLineDark,

  'off-bg': STATUS.offBgDark,
  'off-fg': STATUS.offFgDark,
  'off-line': STATUS.offLineDark,

  'bad-bg': STATUS.badBgDark,
  'bad-fg': STATUS.badFgDark,
  'bad-line': STATUS.badLineDark,

  'oem-bg': STATUS.oemBgDark,
  'oem-fg': STATUS.oemFgDark,
  'oem-line': STATUS.oemLineDark,

  'alt-bg': STATUS.altBgDark,
  'alt-fg': STATUS.altFgDark,
  'alt-line': STATUS.altLineDark,

  'sale-bg': SALE.bgDark,
  'sale-fg': SALE.fgDark,

  'red-accent': ACCENT.redDark,
  'green-accent': ACCENT.greenDark,
  'green-accent-hover': ACCENT.greenHoverDark,
  'on-green': ACCENT.onGreen,
  star: STAR.dark,

  'danger-solid': DANGER_SOLID.dark,
  'danger-solid-hover': DANGER_SOLID.darkHover,
  'on-danger': DANGER_SOLID.onDark,

  /* Koyu temada bant sayfadan daha KOYU: aynı tonda olsa yüzüyor görünüyor. */
  'nav-bg': GRAPHITE.ink,
  'nav-bg-2': GRAPHITE.inkTwo,
  'nav-fg': '#e7eaee',
  'nav-fg-2': '#9aa4b2',
  'nav-fg-3': '#6b7583',
  'nav-line': '#262c36',
  'nav-line-strong': '#363e4a',
  'nav-hover': alpha(NEUTRAL.n0, 0.07),
  'footer-bg': GRAPHITE.ink,

  /*
   * Koyu zeminde gölge okunmaz; derinlik daha çok kenarlıkla kurulur.
   * Gölgeler yine de KORUNUR ama daha derin: modal ve açılır liste yüzeyin
   * üzerinde durmalı.
   */
  'shadow-xs': `0 1px 2px ${alpha(BLACK, 0.4)}`,
  'shadow-sm': `0 1px 2px ${alpha(BLACK, 0.4)}, 0 1px 3px ${alpha(BLACK, 0.3)}`,
  'shadow-md': `0 2px 4px ${alpha(BLACK, 0.35)}, 0 6px 16px ${alpha(BLACK, 0.45)}`,
  'shadow-lg': `0 4px 8px ${alpha(BLACK, 0.4)}, 0 16px 32px ${alpha(BLACK, 0.55)}`,
  'shadow-xl': `0 8px 16px ${alpha(BLACK, 0.45)}, 0 28px 56px ${alpha(BLACK, 0.6)}`,
  'shadow-up': `0 -2px 4px ${alpha(BLACK, 0.3)}, 0 -8px 24px ${alpha(BLACK, 0.45)}`,

  ring: `0 0 0 3px ${alpha(BLUE.dark, 0.36)}`,
  'ring-color': BLUE.dark,
  'ring-danger': `0 0 0 3px ${alpha(DANGER_SOLID.dark, 0.32)}`,
  'ring-ok': `0 0 0 4px ${alpha(STATUS.okFgDark, 0.2)}`,

  scrim: alpha(BLACK, 0.68),
  'scrim-soft': alpha(BLACK, 0.45),
  glass: alpha('#1f242d', 0.92),
  'glass-solid': '#1f242d',
  'on-scrim': NEUTRAL.n0,

  'skeleton-a': '#1f242d',
  'skeleton-b': '#262c36',
  track: alpha(NEUTRAL.n0, 0.14),

  'media-bg': '#1f242d',

  'glow-1': alpha(BLUE.base, 0.2),
  'glow-2': alpha(BLUE.dark, 0.1),
  'glow-amber': alpha(AMBER.dark, 0.12),
};

/** Token adları — `LIGHT_THEME`den türetilir, elle listelenmez. */
export type HanuiToken = keyof typeof LIGHT_THEME;

/** Bir temanın token → değer eşlemesi. Kısmî verilebilir; eksikler varsayılandan gelir. */
export type HanuiThemeTokens = Partial<Record<HanuiToken, string>>;

/** Bir temanın TAM eşlemesi. */
export type HanuiResolvedTokens = Record<HanuiToken, string>;

/** Kullanıcının seçtiği tema. `system` işletim sistemi tercihini izler. */
export type HanuiColorScheme = 'light' | 'dark';

/**
 * Yazı tipi ailesi sözleşmesi.
 *
 * <p>Üç rol ayrı: başlık (≥19 px), arayüz metni (11–16 px) ve teknik veri
 * (kod, seri numarası, tutar). KÜÇÜK ARAYÜZ METNİ BAŞLIK FONTUNU KULLANMAZ —
 * grotesk başlık yüzleri 12–14 px yarı-kalında sıkışıp okunurluğu düşürüyor
 * ve düğme etiketleri bir arayüzün en çok okunan kısa metinleri.
 *
 * <p>Kütüphane font YÜKLEMEZ: değerler `font-family` dizesi olarak geçer ve
 * yüklemeyi (next/font, @font-face, CDN) tüketici yapar. Bir UI paketinin
 * ağdan font çekmesi, tüketicinin ölçemediği bir istek demek.
 */
export type HanuiFonts = Partial<{
  heading: string;
  body: string;
  mono: string;
}>;

/** Kütüphanenin varsayılan font yığınları — hepsi sistem fontlarına iner. */
export const DEFAULT_FONTS: Required<HanuiFonts> = {
  heading: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};

/**
 * Dışarıdan verilebilecek tema yapılandırması.
 *
 * @example
 * initHanui({
 *   theme: {
 *     light: { blue: '#0d6efd', 'blue-text': '#0a58ca' },
 *     dark:  { blue: '#6ea8fe' },
 *     fonts: { heading: 'Archivo, sans-serif' },
 *   },
 * });
 */
export type HanuiThemeConfig = Partial<{
  light: HanuiThemeTokens;
  dark: HanuiThemeTokens;
  fonts: HanuiFonts;
}>;
