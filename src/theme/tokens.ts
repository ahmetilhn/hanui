import {
  ACCENT,
  ACTION_LINE,
  BAND,
  BRAND,
  CART,
  CATEGORY,
  CORPORATE,
  DANGER_SOLID,
  LINK,
  NEUTRAL,
  SALE,
  STAR,
  STATUS,
  SURFACE_DARK,
  SYNTAX,
} from './palette';
import { HanuiFonts } from '@/types/theme.type';

/** TEMA TOKEN'LARI. */

/** Hex rengi `rgba(...)` dizesine çevirir. */
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

/** Akışkan ölçeğin bağlandığı iki genişlik: alt uçta taban, üst uçta tavan tutar. */
const FLUID_MIN_VIEWPORT = 360;
const FLUID_MAX_VIEWPORT = 1280;

/** Kök punto varsayımı — `rem` tabanını `px` girdiye çevirmek için. */
const ROOT_FONT_SIZE = 16;

const trim = (value: number): string => String(Number(value.toFixed(4)));

/**
 * İki uç arasında viewport ile SÜREKLİ değişen bir ölçü üretir.
 * @param min 360px viewport'ta geçerli olacak punto/ölçü (px)
 * @param max 1280px ve üstünde geçerli olacak punto/ölçü (px)
 */
const fluid = (min: number, max: number): string => {
  const slope = (max - min) / (FLUID_MAX_VIEWPORT - FLUID_MIN_VIEWPORT);
  const intercept = (min - slope * FLUID_MIN_VIEWPORT) / ROOT_FONT_SIZE;

  return `clamp(${trim(min)}px, ${trim(intercept)}rem + ${trim(slope * 100)}vw, ${trim(max)}px)`;
};

/**
 * Akışkan ölçüyü YOĞUNLUK ÇARPANIYLA sarar. ⚠ Yoğun kip (`data-hanui-density="compact"`) eskiden 17
 * sabit değeri ezerek çalışıyordu ve o değerler…
 */
const scaled = (value: string, variable: 'type-scale' | 'space-scale'): string =>
  `calc(${value} * var(--hanui-${variable}))`;

const fluidType = (min: number, max: number): string => scaled(fluid(min, max), 'type-scale');

const fluidSpace = (min: number, max: number): string => scaled(fluid(min, max), 'space-scale');

/**
 * Koyu temanın gölge ve örtü mürekkebi. ⚠ SAF SİYAH DEĞİL. Palette saf siyah da saf beyaz da yok:
 * ikisi de markanın ekseni dışında duruyor ve gölge saf…
 */
const INK_DEEP = SURFACE_DARK.inset;

/** AÇIK TEMA — varsayılan. */
export const LIGHT_THEME = {
  // --- Yüzey ---
  /*
   * SAYFA KREM (`#faf9f5`), KART BEYAZA YAKIN — kart sayfadan bir kademe AÇIK. Ayrımın asıl
   * taşıyıcısı kenarlık (1,05:1 dolgu farkı tek başına görünmez).
   * ⚠ 4.x'te sayfa yeşil tonlu kâğıttı (`#f7fcf8`); 5.0'da arayüz nötrleri sıcak mürekkep ekseninde.
   */
  page: NEUTRAL.n25,
  surface: NEUTRAL.n0,
  'surface-2': NEUTRAL.n100,
  'surface-3': NEUTRAL.n150,
  /** Girinti sayfanın ALTINA iner (arama kutusu, kod bloğu, pasif girdi). */
  'surface-inset': NEUTRAL.n50,

  // --- Kenarlık ---
  border: NEUTRAL.n250,
  'border-strong': NEUTRAL.n300,

  // --- Metin ---
  text: NEUTRAL.n900,
  'text-2': NEUTRAL.n600,
  'text-3': NEUTRAL.n550,

  /*
   * MÜREKKEP YÜZEY — terminal, teknik blok, koyu kod penceresi. TEMAYA GÖRE DÖNMEZ: açık temada da
   * sıcak siyah.
   * ⚠ 4.x'te bu aile çamdı (`#00322a`); yeşil teknik bir yüzeyin zemini değil, eylemin rengi.
   */
  shell: SURFACE_DARK.surface,
  'shell-2': SURFACE_DARK.surfaceTwo,
  'shell-3': SURFACE_DARK.surfaceThree,
  'on-shell': SURFACE_DARK.text,
  'on-shell-2': SURFACE_DARK.textTwo,
  /** Mürekkep üzerinde hata metni (terminalin stderr'i). Açık temanın `bad-fg`i burada 2:1'in altında. */
  'on-shell-danger': STATUS.badFgDark,
  /** Koyu temada kabuk sayfadan 1,03:1 ayrışıyor; görünür kılan bu çizgi. */
  'shell-line': SURFACE_DARK.border,

  /* BİRİNCİL EYLEM (dolgulu, kurumsal koyu yeşil). */
  action: BAND.base,
  'action-hover': BAND.two,
  'action-active': BAND.three,
  'on-action': NEUTRAL.n0,
  /** Dolgunun SINIRI; açık temada dolgunun kendisi (bkz. `ACTION_LINE`). */
  'action-line': ACTION_LINE.light,
  /** Pasif dolgu; saydamlık DEĞİL kendi rengi (bkz. */
  'action-soft': NEUTRAL.n300,
  /** PASİF DOLGU ÜZERİNDEKİ METİN. */
  'on-action-soft': NEUTRAL.n700,

  /* DÖNÜŞÜM EYLEMİ ("sepete ekle") — ailenin en parlak yeşili. */
  cart: CART.base,
  'cart-hover': CART.hover,
  'cart-active': CART.active,
  'cart-soft': CART.soft,
  'on-cart': CART.on,

  /*
   * SEÇİM — etkin sayfa, seçili çip/seçenek, sekme çizgisi, ilerleme, onay kutusu, anahtar, adım.
   * MÜREKKEP, yeşil değil: 4.x'te bunların hepsi rol yeşilini taşıyordu ve yeşil ekranın her
   * köşesinde duruyordu (28 bileşende 87 bildirim).
   */
  selected: NEUTRAL.n900,
  'selected-hover': NEUTRAL.n800,
  'selected-active': NEUTRAL.n700,
  'on-selected': NEUTRAL.n25,
  /** Seçili satır / seçenek zemini — kenarlık ya da işaretle BİRLİKTE (seçim yalnız zeminle verilmez). */
  'selected-tint': NEUTRAL.n150,
  'selected-line': NEUTRAL.n900,

  /* BAĞLANTI — yeşil kalan üç yerden biri (eylem, bağlantı, odak). Alt çizgi ZORUNLU: gövde metnine 3,04:1. */
  link: LINK.text,
  'link-hover': LINK.hover,

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

  // --- İkon vurguları:
  'red-accent': ACCENT.red,
  'green-accent': ACCENT.green,
  'green-accent-hover': ACCENT.greenHover,
  'on-green': ACCENT.onGreen,
  star: STAR.light,

  // --- Yıkıcı eylem: durum tinti DEĞİL, gerçek bir dolgu ---
  'danger-solid': DANGER_SOLID.base,
  'danger-solid-hover': DANGER_SOLID.hover,
  'on-danger': NEUTRAL.n0,

  /* ÜST BANT / ALT BİLGİ / KAHRAMAN BÖLÜMÜ. Bant sayfayı ÖRTMEZ, sayfanın devamıdır (iki temada). */
  'nav-bg': NEUTRAL.n25,
  'nav-bg-2': NEUTRAL.n100,
  'nav-fg': NEUTRAL.n900,
  'nav-fg-2': NEUTRAL.n600,
  /*
   * `n500` DEĞİL. Ölçüldü: `n500` üst bandın beyaz zemininde 3,06:1, alt bilginin `n100` zemininde
   * 2,68:1 veriyordu
   */
  'nav-fg-3': NEUTRAL.n550,
  'nav-line': NEUTRAL.n200,
  'nav-line-strong': NEUTRAL.n300,
  'nav-hover': NEUTRAL.n100,
  'footer-bg': NEUTRAL.n100,

  /* MARKA ŞERİDİ — `nav-*`ın TEMADAN BAĞIMSIZ kardeşi. */
  'band-bg': BAND.dark,
  'band-fg': CORPORATE.paper,
  'band-fg-2': CORPORATE.mist,
  /**
   * Bandın ÜÇÜNCÜ metin kademesi ve imza vurgusu. Panelin kenar çubuğu rayı bu ikisini bir dönem
   * SABİT HEX olarak taşıyordu (`#799a8f`, `#43ff9c`)
   */
  'band-fg-3': BAND.fgThree,
  'band-accent': BRAND.mint,
  'band-line': BAND.darkLine,
  'band-hover': alpha(NEUTRAL.n0, 0.07),

  // --- Gölge: sıcak mürekkep alfası. ⚠ Kart ve panel gölge TAŞIMAZ (renk bloğu önce, gölge nadir). ---
  'shadow-xs': `0 1px 2px ${alpha(NEUTRAL.n900, 0.05)}`,
  'shadow-sm': `0 1px 2px ${alpha(NEUTRAL.n900, 0.05)}, 0 1px 3px ${alpha(NEUTRAL.n900, 0.04)}`,
  'shadow-md': `0 2px 4px ${alpha(NEUTRAL.n900, 0.04)}, 0 6px 16px ${alpha(NEUTRAL.n900, 0.07)}`,
  'shadow-lg': `0 4px 8px ${alpha(NEUTRAL.n900, 0.05)}, 0 16px 32px ${alpha(NEUTRAL.n900, 0.1)}`,
  'shadow-xl': `0 8px 16px ${alpha(NEUTRAL.n900, 0.06)}, 0 28px 56px ${alpha(NEUTRAL.n900, 0.13)}`,
  /** Yapışkan alt bar; gölge YUKARI düşer. */
  'shadow-up': `0 -2px 4px ${alpha(NEUTRAL.n900, 0.03)}, 0 -8px 24px ${alpha(NEUTRAL.n900, 0.08)}`,

  /** Odak halkası BAĞLANTI YEŞİLİ: odak bir gezinme olayıdır. Çam DEĞİL — birincil dolguyla aynı ton. */
  ring: `0 0 0 3px ${alpha(LINK.base, 0.28)}`,
  'ring-color': LINK.base,
  'ring-danger': `0 0 0 3px ${alpha(DANGER_SOLID.base, 0.24)}`,
  'ring-ok': `0 0 0 4px ${alpha(STATUS.okFg, 0.16)}`,

  // --- Örtü ve cam: görsel üzerine binen yüzeyler ---
  /*
   * %55 DEĞİL. Örtü yalnızca kip pencerenin arkasını karartmıyor; `on-scrim` onun üzerine yazılan
   * metnin rengi ve o metin AÇIK temada bir sayfanın üstüne…
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

  /* Vurgu bloğundaki ışık lekeleri. */
  'glow-1': alpha(BRAND.mint, 0.1),
  'glow-2': alpha(BRAND.pine, 0.06),
  'glow-cart': alpha(CART.base, 0.09),

  /*
   * KATEGORİK PALET — grafik serileri, kategori noktaları, lejant kareleri. İki temanın üç yüzeyinde
   * ≥3:1 (grafik). `series-1` mürekkebin kendisi: birincil seri rengi değil KONTRAST taşır.
   */
  'cat-1': CATEGORY.cat1,
  'cat-2': CATEGORY.cat2,
  'cat-3': CATEGORY.cat3,
  'cat-4': CATEGORY.cat4,
  'cat-5': CATEGORY.cat5,
  'series-1': NEUTRAL.n800,
  'series-2': CATEGORY.series2,
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

  /* Mürekkep yüzey temaya göre dönmez (bkz. açık tema). */
  shell: SURFACE_DARK.surface,
  'shell-2': SURFACE_DARK.surfaceTwo,
  'shell-3': SURFACE_DARK.surfaceThree,
  'on-shell': SURFACE_DARK.text,
  'on-shell-2': SURFACE_DARK.textTwo,
  'on-shell-danger': STATUS.badFgDark,
  'shell-line': SURFACE_DARK.border,

  /*
   * Bedeli ölçüldü ve `action-line` ile ödendi: çam koyu sayfada 1,36:1, koyu kartta (`surface-2`)
   * 1,04:1
   * ⚠ BİRİNCİL EYLEM İKİ TEMADA DA KURUMSAL KOYU YEŞİL — koyu temada mint dolguya DÖNMEZ.
   */
  action: BRAND.pine,
  'action-hover': BAND.two,
  'action-active': BAND.three,
  'on-action': NEUTRAL.n0,
  'action-line': ACTION_LINE.dark,
  'action-soft': SURFACE_DARK.actionSoft,
  /* Koyu temada pasif dolgu ortada bir gri: metin AÇIK olmali (bkz. */
  'on-action-soft': NEUTRAL.n300,

  cart: CART.dark,
  'cart-hover': CART.darkHover,
  'cart-active': CART.darkActive,
  'cart-soft': CART.darkSoft,
  'on-cart': CART.on,

  /* Koyu temada seçim TERS döner: krem dolgu, üzerine siyah metin. */
  selected: SURFACE_DARK.text,
  'selected-hover': NEUTRAL.n100,
  'selected-active': NEUTRAL.n150,
  'on-selected': NEUTRAL.n900,
  'selected-tint': SURFACE_DARK.surfaceThree,
  'selected-line': SURFACE_DARK.text,

  link: LINK.dark,
  'link-hover': LINK.darkHover,

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

  /* ÜST BANT SAYFANIN KENDİSİ: koyu temada en koyu renk kılavuzun siyahı ve bant onu ÖRTMEZ. */
  'nav-bg': SURFACE_DARK.page,
  'nav-bg-2': SURFACE_DARK.surfaceTwo,
  'nav-fg': SURFACE_DARK.text,
  'nav-fg-2': SURFACE_DARK.textTwo,
  /* Açık temadaki kardeşiyle aynı gerekçe: bandın en soluk metni de metindir. */
  'nav-fg-3': SURFACE_DARK.textThree,
  'nav-line': SURFACE_DARK.border,
  'nav-line-strong': SURFACE_DARK.borderStrong,
  'nav-hover': alpha(NEUTRAL.n0, 0.07),
  'footer-bg': SURFACE_DARK.surface,

  /* AÇIK TEMADAKİYLE BİREBİR AYNI — şerit temaya göre dönmez (bkz. */
  'band-bg': BAND.dark,
  'band-fg': CORPORATE.paper,
  'band-fg-2': CORPORATE.mist,
  /**
   * Bandın ÜÇÜNCÜ metin kademesi ve imza vurgusu. Panelin kenar çubuğu rayı bu ikisini bir dönem
   * SABİT HEX olarak taşıyordu (`#799a8f`, `#43ff9c`)
   */
  'band-fg-3': BAND.fgThree,
  'band-accent': BRAND.mint,
  'band-line': BAND.darkLine,
  'band-hover': alpha(NEUTRAL.n0, 0.07),

  /* Koyu zeminde gölge okunmaz; derinlik daha çok kenarlıkla kurulur. */
  'shadow-xs': `0 1px 2px ${alpha(INK_DEEP, 0.4)}`,
  'shadow-sm': `0 1px 2px ${alpha(INK_DEEP, 0.4)}, 0 1px 3px ${alpha(INK_DEEP, 0.3)}`,
  'shadow-md': `0 2px 4px ${alpha(INK_DEEP, 0.35)}, 0 6px 16px ${alpha(INK_DEEP, 0.45)}`,
  'shadow-lg': `0 4px 8px ${alpha(INK_DEEP, 0.4)}, 0 16px 32px ${alpha(INK_DEEP, 0.55)}`,
  'shadow-xl': `0 8px 16px ${alpha(INK_DEEP, 0.45)}, 0 28px 56px ${alpha(INK_DEEP, 0.6)}`,
  'shadow-up': `0 -2px 4px ${alpha(INK_DEEP, 0.3)}, 0 -8px 24px ${alpha(INK_DEEP, 0.45)}`,

  ring: `0 0 0 3px ${alpha(LINK.dark, 0.36)}`,
  'ring-color': LINK.dark,
  'ring-danger': `0 0 0 3px ${alpha(DANGER_SOLID.dark, 0.32)}`,
  'ring-ok': `0 0 0 4px ${alpha(STATUS.okFgDark, 0.2)}`,

  scrim: alpha(INK_DEEP, 0.68),
  'scrim-soft': alpha(INK_DEEP, 0.45),
  glass: alpha(SURFACE_DARK.surfaceTwo, 0.92),
  'glass-solid': SURFACE_DARK.surfaceTwo,
  'on-scrim': NEUTRAL.n0,

  'skeleton-a': SURFACE_DARK.surfaceTwo,
  'skeleton-b': SURFACE_DARK.surfaceThree,
  track: alpha(NEUTRAL.n0, 0.14),

  'media-bg': SURFACE_DARK.surfaceTwo,

  'glow-1': alpha(BRAND.mint, 0.2),
  'glow-2': alpha(BRAND.pine, 0.12),
  'glow-cart': alpha(CART.dark, 0.12),

  'cat-1': CATEGORY.cat1Dark,
  'cat-2': CATEGORY.cat2Dark,
  'cat-3': CATEGORY.cat3Dark,
  'cat-4': CATEGORY.cat4Dark,
  'cat-5': CATEGORY.cat5Dark,
  'series-1': NEUTRAL.n150,
  'series-2': CATEGORY.series2Dark,
};

/**
 * SÖZDİZİMİ TOKEN'LARI — `CodeBlock`ın vurgulayıcısı. Kategorik tonlar METİN aydınlığında: kod
 * gövdesinde (`surface-inset`) ve üç yüzeyde ≥4,5:1. Yorum `text-3`, noktalama `text-2` — ayrı
 * token değil. `syntax-name`: işlev çağrısı, özellik/anahtar, öznitelik, değişken.
 * ⚠ Temaya bağlı ama ANA TABLODA DEĞİL. Yalnızca sohbet girişi kullanıyor; `LIGHT_THEME`e
 * girdiklerinde çalışma zamanı tablosuyla HER bileşenin paketine biniyorlardı (ölçüldü: yalnızca
 * `Button` alan uygulama 5,12 → 5,28 kB, `styles.css` +0,1 kB). Değişkenleri `chat.css` taşır
 * (`_syntax.generated.scss`); ezme CSS'te (`--hanui-syntax-*`), `HanuiProvider theme`inde değil.
 */
export const SYNTAX_LIGHT_THEME = {
  'syntax-keyword': SYNTAX.keyword,
  'syntax-string': SYNTAX.string,
  'syntax-number': SYNTAX.number,
  'syntax-name': SYNTAX.name,
  'syntax-type': SYNTAX.type,
} as const;

export const SYNTAX_DARK_THEME: Record<keyof typeof SYNTAX_LIGHT_THEME, string> = {
  'syntax-keyword': SYNTAX.keywordDark,
  'syntax-string': SYNTAX.stringDark,
  'syntax-number': SYNTAX.numberDark,
  'syntax-name': SYNTAX.nameDark,
  'syntax-type': SYNTAX.typeDark,
};

/** ÖLÇÜ TOKEN'LARI — temadan bağımsız, çalışma zamanında EZİLEBİLİR. */
export const METRIC_TOKENS = {
  // --- Yarıçap --- Küçük öğeler ile büyük yüzeyler aynı yarıçapı PAYLAŞMAZ: küçük bir öğede 12px
  // onu şişman gösterir, büyük bir kartta 6px keskin ve…
  'radius-xs': '4px',
  'radius-sm': '6px',
  'radius-md': '8px',
  'radius-lg': '12px',
  'radius-xl': '16px',
  'radius-pill': '999px',

  // --- Boşluk ---
  /** YOĞUNLUK ÇARPANLARI — akışkan ölçeğin üzerine binen tek ayar. */
  'type-scale': '1',
  'space-scale': '1',

  /* BOŞLUK ÖLÇEĞİ — üçüncü kademeden itibaren akışkan. */
  'space-0': '0',
  'space-1': '4px',
  'space-2': '8px',
  'space-3': fluidSpace(10, 12),
  'space-4': fluidSpace(13, 16),
  'space-5': fluidSpace(17, 24),
  'space-6': fluidSpace(22, 32),
  'space-7': fluidSpace(30, 48),
  'space-8': fluidSpace(40, 64),
  'space-9': fluidSpace(52, 96),

  /*
   * TİPOGRAFİ ÖLÇEĞİ — AKIŞKAN. ⚠ Ölçüldü: vitrinde 446 `font-size` bildirimi vardı ve yalnızca
   * 6'sı viewport'a tepki veriyordu.
   */
  'font-size-2xs': fluidType(11, 12),
  'font-size-xs': fluidType(12, 13),
  'font-size-sm': fluidType(13.5, 15),
  'font-size-base': fluidType(15, 16),
  'font-size-body': fluidType(16, 17),
  'font-size-lg': fluidType(17, 19),
  'font-size-xl': fluidType(19.5, 23),
  'font-size-2xl': fluidType(23, 29),
  'font-size-3xl': fluidType(26, 37),
  'font-size-4xl': fluidType(30, 47),

  /** FORM DENETİMİ PUNTOSU — ölçekten AYRI ve 16px'in altına inmez. */
  'font-size-control': `max(16px, ${fluid(15, 16)})`,

  // Satır yüksekliği: başlıkta sıkı, metinde rahat. `leading-normal` 1.55'ten 1.62'ye çıktı — 16 px
  // gövde metninde en belirgin okunurluk kazanımı burada.
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

  // --- Hareket --- 200 ms üzerindeki geçişler tıklama ile sonuç arasında görünür bir gecikme
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
  /** Durum noktasının nabzı — "çalışıyor / bağlanıyor"; 700 ms telaş, 2 sn ölü gibi okunuyordu. */
  'duration-pulse': '1600ms',
} as const;

/** YOĞUN (compact) KİP — `<html data-hanui-density="compact">`. */
export const COMPACT_DENSITY = {
  'type-scale': '0.93',
  'space-scale': '0.88',
} as const satisfies Partial<Record<keyof typeof METRIC_TOKENS, string>>;

/** DAR EKRAN KADEMELERİ — `@media (max-width: 640px)`. */
export const NARROW_METRICS = {
  'radius-lg': '10px',
  'radius-xl': '13px',

  'icon-xs': '13px',
  'icon-sm': '15px',
  'icon-md': '16px',
  'icon-lg': '18px',
  'icon-xl': '20px',

  'leading-tight': '1.18',
  'leading-snug': '1.38',
  'leading-normal': '1.52',
  'leading-relaxed': '1.62',
} as const satisfies Partial<Record<keyof typeof METRIC_TOKENS, string>>;

/** `NARROW_METRICS`in devreye girdiği genişlik — `$breakpoint-mobile` ile aynı. */
export const NARROW_BREAKPOINT = '640px';

/** Kütüphanenin varsayılan font yığınları — hepsi sistem fontlarına iner. */
export const DEFAULT_FONTS: Required<HanuiFonts> = {
  heading: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};
