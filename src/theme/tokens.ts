import {
  ACCENT,
  ACTION_LINE,
  AMBER,
  BAND,
  BLUE,
  BRAND,
  CORPORATE,
  DANGER_SOLID,
  NEUTRAL,
  SALE,
  STAR,
  STATUS,
  SURFACE_DARK,
} from './palette';
import { HanuiFonts } from '@/types/theme.type';

/** TEMA TOKEN'LARI. */

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

/** AÇIK TEMA — varsayılan. */
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

  // --- Bant: üst bant, alt bilgi, tablo başlığı, teknik blok ---
  graphite: BAND.base,
  'graphite-2': BAND.two,
  'graphite-3': BAND.three,

  /* BİRİNCİL EYLEM (dolgulu, kurumsal koyu yeşil). */
  action: BAND.base,
  'action-hover': BAND.two,
  'action-active': BAND.three,
  'on-action': NEUTRAL.n0,
  /** Dolgunun SINIRI; açık temada dolgunun kendisi (bkz. `ACTION_LINE`). */
  'action-line': ACTION_LINE.light,
  /** Pasif dolgu; saydamlık DEĞİL kendi rengi (bkz. Button `:disabled`). */
  'action-soft': NEUTRAL.n300,
  /** PASİF DOLGU ÜZERİNDEKİ METİN. */
  'on-action-soft': NEUTRAL.n700,

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
  /*
   * MAVİ DOLGU ÜZERİNDEKİ METİN — etkin sayfa numarası, etkin karo madalyonu,
   * geçerli adım, dolu bağlantı rozeti. Bir zamanlar `on-action`ı kullanıyordu
   * ve o kestirme birincil eylemin dolgusu iki temada da koyu yeşile
   * sabitlendiğinde KIRILDI: `on-action` beyaza döndü, mavi ise koyu temada
   * açık bir teal (`#51d2d6`) ve beyaz metin orada 2,1:1'e düşüyor. İki
   * dolgunun aydınlığı ters yönlere gidiyor, tek metin token'ı ikisini birden
   * taşıyamaz.
   */
  'on-blue': NEUTRAL.n0,

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

  /* ÜST BANT / ALT BİLGİ / KAHRAMAN BÖLÜMÜ. */
  'nav-bg': NEUTRAL.n0,
  'nav-bg-2': NEUTRAL.n100,
  'nav-fg': NEUTRAL.n900,
  'nav-fg-2': NEUTRAL.n600,
  /*
   * `n500` DEĞİL. Ölçüldü: `n500` üst bandın beyaz zemininde 3,06:1, alt
   * bilginin `n100` zemininde 2,68:1 veriyordu — yani bandın en soluk metni
   * (telif satırı, yardımcı bağlantılar) hiçbir yerde gövde metni eşiğini
   * geçmiyordu. Sayfa tarafındaki karşılığıyla (`text-3`) aynı tona bağlandı:
   * ikisi aynı işi yapıyor ve ayrı tutulmalarının tek sebebi bandın kendi
   * yüzey merdiveniydi, kendi okunurluk kuralı değil.
   */
  'nav-fg-3': NEUTRAL.n550,
  'nav-line': NEUTRAL.n200,
  'nav-line-strong': NEUTRAL.n300,
  'nav-hover': NEUTRAL.n100,
  'footer-bg': NEUTRAL.n100,

  /*
   * MARKA ŞERİDİ — `nav-*`ın TEMADAN BAĞIMSIZ kardeşi. Değerleri iki temada da
   * birebir aynı ve bu tanımın kendisi: şerit kurumsal koyu yeşil zemini
   * taşıyan bir yüzeydir, temanın açık/koyu merdiveninde bir kademe değil.
   *
   * <p>`nav-*` bunu yapamaz çünkü açık temada beyaza dönüyor; `graphite`
   * ailesi ise yalnızca ZEMİN — üzerine ne yazılacağını söyleyen bir metin
   * kademesi yok ve açık temada `text`/`nav-fg` siyah, yani çamın üzerinde
   * okunmuyor. Metin katmanları doğrudan kılavuzdan: gövde kâğıt (12,68:1),
   * ikincil sis (6,15:1).
   */
  'band-bg': BAND.dark,
  'band-fg': CORPORATE.paper,
  'band-fg-2': CORPORATE.mist,
  'band-line': BAND.darkLine,
  'band-hover': alpha(NEUTRAL.n0, 0.07),

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
  /*
   * %55 DEĞİL. Örtü yalnızca kip pencerenin arkasını karartmıyor; `on-scrim`
   * onun üzerine yazılan metnin rengi ve o metin AÇIK temada bir sayfanın
   * üstüne düşüyor. Ölçüldü: %55 örtü `page` üzerine düzlendiğinde beyaz metin
   * 4,27:1 — gövde metni eşiğinin altında. %60'ta 5,01:1.
   */
  scrim: alpha(NEUTRAL.n900, 0.6),
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
  'glow-1': alpha(BRAND.mint, 0.1),
  'glow-2': alpha(BRAND.pine, 0.06),
  'glow-amber': alpha(AMBER.base, 0.09),
} as const;

/** KOYU TEMA. */
export const DARK_THEME: Record<keyof typeof LIGHT_THEME, string> = {
  page: SURFACE_DARK.page,
  surface: SURFACE_DARK.surface,
  'surface-2': SURFACE_DARK.surfaceTwo,
  'surface-3': SURFACE_DARK.surfaceThree,
  'surface-inset': SURFACE_DARK.inset,

  border: SURFACE_DARK.border,
  'border-strong': SURFACE_DARK.borderStrong,

  text: SURFACE_DARK.text,
  'text-2': SURFACE_DARK.textTwo,
  'text-3': SURFACE_DARK.textThree,

  graphite: BAND.dark,
  'graphite-2': BAND.darkTwo,
  /* `BAND.base` DEĞİL: koyu temada bant zaten koyu yeşil ve üçüncü kademe
     ikinciyle aynı hex'e çökerdi. Merdiven yukarı devam eder. */
  'graphite-3': BAND.two,

  /*
   * ⚠ BİRİNCİL EYLEM İKİ TEMADA DA KURUMSAL KOYU YEŞİL — koyu temada mint
   * dolguya DÖNMEZ. Önceki sürüm dönüyordu (mint + siyah metin, 14,65:1) ve
   * ölçüm olarak kusursuzdu; düşen şey markaydı: açık yeşil kılavuzda logonun
   * ve imza işaretinin rengi, bir düğmenin zemini değil. Aynı ekranda mint
   * dolgulu düğme ile mint logo yan yana geldiğinde imza rengi bir vurgu
   * olmaktan çıkıp arayüzün genel dolgusuna dönüşüyordu.
   *
   * <p>Bedeli ölçüldü ve `action-line` ile ödendi: çam koyu sayfada 1,36:1,
   * koyu kartta (`surface-2`) 1,04:1 — dolgunun kendisi görünmüyor, düğmeyi
   * mint saç çizgisi (14,65:1) ve beyaz metin (14,09:1) görünür kılıyor.
   */
  action: BRAND.pine,
  'action-hover': BAND.two,
  'action-active': BAND.three,
  'on-action': NEUTRAL.n0,
  'action-line': ACTION_LINE.dark,
  'action-soft': SURFACE_DARK.actionSoft,
  /* Koyu temada pasif dolgu ortada bir gri: metin AÇIK olmali (bkz. LIGHT). */
  'on-action-soft': NEUTRAL.n300,

  amber: AMBER.dark,
  'amber-hover': AMBER.darkHover,
  'amber-active': AMBER.base,
  'amber-soft': AMBER.darkSoft,
  'on-amber': AMBER.on,

  blue: BLUE.dark,
  'blue-hover': BLUE.darkHover,
  'blue-active': BLUE.base,
  'blue-text': BLUE.dark,
  'blue-tint': BLUE.darkTint,
  'blue-line': BLUE.darkLine,
  /* Koyu temada mavi dolgu AÇILIYOR; üzerine siyah gider (10,55:1). */
  'on-blue': NEUTRAL.n900,

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
  'nav-bg': BAND.dark,
  'nav-bg-2': BAND.darkTwo,
  'nav-fg': SURFACE_DARK.text,
  'nav-fg-2': SURFACE_DARK.textTwo,
  /* Açık temadaki kardeşiyle aynı gerekçe: bandın en soluk metni de metindir. */
  'nav-fg-3': SURFACE_DARK.textThree,
  'nav-line': BAND.darkLine,
  'nav-line-strong': BAND.darkLineStrong,
  'nav-hover': alpha(NEUTRAL.n0, 0.07),
  'footer-bg': BAND.dark,

  /* AÇIK TEMADAKİYLE BİREBİR AYNI — şerit temaya göre dönmez (bkz. LIGHT). */
  'band-bg': BAND.dark,
  'band-fg': CORPORATE.paper,
  'band-fg-2': CORPORATE.mist,
  'band-line': BAND.darkLine,
  'band-hover': alpha(NEUTRAL.n0, 0.07),

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
  glass: alpha(SURFACE_DARK.surfaceTwo, 0.92),
  'glass-solid': SURFACE_DARK.surfaceTwo,
  'on-scrim': NEUTRAL.n0,

  'skeleton-a': SURFACE_DARK.surfaceTwo,
  'skeleton-b': SURFACE_DARK.surfaceThree,
  track: alpha(NEUTRAL.n0, 0.14),

  'media-bg': SURFACE_DARK.surfaceTwo,

  'glow-1': alpha(BRAND.mint, 0.2),
  'glow-2': alpha(BRAND.pine, 0.12),
  'glow-amber': alpha(AMBER.dark, 0.12),
};

/** ÖLÇÜ TOKEN'LARI — temadan bağımsız, çalışma zamanında EZİLEBİLİR. */
export const METRIC_TOKENS = {
  // --- Yarıçap ---
  // Küçük öğeler ile büyük yüzeyler aynı yarıçapı PAYLAŞMAZ: küçük bir öğede
  // 12px onu şişman gösterir, büyük bir kartta 6px keskin ve ucuz görünür.
  'radius-xs': '4px',
  'radius-sm': '6px',
  'radius-md': '8px',
  'radius-lg': '12px',
  'radius-xl': '16px',
  'radius-pill': '999px',

  // --- Boşluk ---
  'space-0': '0',
  'space-1': '4px',
  'space-2': '8px',
  'space-3': '12px',
  'space-4': '16px',
  'space-5': '24px',
  'space-6': '32px',
  'space-7': '48px',
  'space-8': '64px',
  'space-9': '96px',

  /* Tipografi ölçeği */
  'font-size-2xs': '12px',
  'font-size-xs': '13px',
  'font-size-sm': '15px',
  'font-size-base': '16px',
  'font-size-body': '17px',
  'font-size-lg': '19px',
  'font-size-xl': '23px',
  'font-size-2xl': '29px',
  'font-size-3xl': '37px',
  'font-size-4xl': '47px',

  // Satır yüksekliği: başlıkta sıkı, metinde rahat. `leading-normal` 1.55'ten
  // 1.62'ye çıktı — 16 px gövde metninde en belirgin okunurluk kazanımı burada.
  'leading-none': '1',
  'leading-tight': '1.16',
  'leading-snug': '1.35',
  'leading-normal': '1.62',
  'leading-relaxed': '1.75',

  /* İkon ölçüsü */
  'icon-xs': '14px',
  'icon-sm': '16px',
  'icon-md': '18px',
  'icon-lg': '20px',
  'icon-xl': '24px',

  // --- Hareket ---
  // 200 ms üzerindeki geçişler tıklama ile sonuç arasında görünür bir gecikme
  // yaratır ve arayüz yavaş hissedilir.
  'duration-instant': '80ms',
  'duration-fast': '140ms',
  'duration-normal': '200ms',
  'duration-slow': '320ms',

  'ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-spring': 'cubic-bezier(0.34, 1.4, 0.64, 1)',

  /* DÖNGÜ SÜRELERİ — geçiş ölçeğinden AYRI. */
  'duration-spin': '700ms',
  'duration-shimmer': '1400ms',
} as const;

/** YOĞUN (compact) KİP — `<html data-hanui-density="compact">`. */
export const COMPACT_DENSITY = {
  'space-2': '6px',
  'space-3': '8px',
  'space-4': '12px',
  'space-5': '16px',
  'space-6': '24px',
  'space-7': '32px',

  'font-size-2xs': '11px',
  'font-size-xs': '12px',
  'font-size-sm': '13px',
  'font-size-base': '15px',
  'font-size-body': '16px',

  /* ÖLÇEĞİN ÜST UCU DA İNER — eksik olan buydu. */
  'font-size-lg': '18px',
  'font-size-xl': '21px',
  'font-size-2xl': '25px',
  'font-size-3xl': '31px',
  'font-size-4xl': '39px',

  'leading-normal': '1.5',
  'leading-relaxed': '1.6',
} as const satisfies Partial<Record<keyof typeof METRIC_TOKENS, string>>;

/** Kütüphanenin varsayılan font yığınları — hepsi sistem fontlarına iner. */
export const DEFAULT_FONTS: Required<HanuiFonts> = {
  heading: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};
