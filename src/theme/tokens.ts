import {
  ACCENT,
  ACTION_LINE,
  BAND,
  ROLE,
  BRAND,
  CART,
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

/** Akışkan ölçeğin bağlandığı iki genişlik: alt uçta taban, üst uçta tavan tutar. */
const FLUID_MIN_VIEWPORT = 360;
const FLUID_MAX_VIEWPORT = 1280;

/** Kök punto varsayımı — `rem` tabanını `px` girdiye çevirmek için. */
const ROOT_FONT_SIZE = 16;

const trim = (value: number): string => String(Number(value.toFixed(4)));

/**
 * İki uç arasında viewport ile SÜREKLİ değişen bir ölçü üretir.
 *
 * <p>⚠ Eğim `vw`, taban `rem`. Saf `px` yazmak daha kısa olurdu ama kullanıcının
 * tarayıcı punto tercihini TAMAMEN yok sayardı; `rem` tabanı o tercihi ölçeğin
 * içinde tutuyor. Kök punto varsayılan 16px olduğu için masaüstünde görünen
 * değer değişmez.
 *
 * <p>⚠ `clamp()`in uçları bir SINIR, bir hedef değil: 360px altında taban,
 * 1280px üstünde tavan sabitlenir — yani çok geniş ekranlarda tipografi
 * büyümeye devam etmez.
 *
 * @param min 360px viewport'ta geçerli olacak punto/ölçü (px)
 * @param max 1280px ve üstünde geçerli olacak punto/ölçü (px)
 */
const fluid = (min: number, max: number): string => {
  const slope = (max - min) / (FLUID_MAX_VIEWPORT - FLUID_MIN_VIEWPORT);
  const intercept = (min - slope * FLUID_MIN_VIEWPORT) / ROOT_FONT_SIZE;

  return `clamp(${trim(min)}px, ${trim(intercept)}rem + ${trim(slope * 100)}vw, ${trim(max)}px)`;
};

/**
 * Akışkan ölçüyü YOĞUNLUK ÇARPANIYLA sarar.
 *
 * <p>⚠ Yoğun kip (`data-hanui-density="compact"`) eskiden 17 sabit değeri
 * ezerek çalışıyordu ve o değerler bugünkü akışkan tabanlara **neredeyse
 * birebir eşitti** — yani panel bir telefonda küçülmeyi İKİ KEZ yiyordu:
 * bir kez viewport'tan, bir kez yoğunluktan. Çarpan bunu yapısal olarak
 * imkânsız kılıyor: yoğunluk artık ölçekle çarpışmıyor, onunla çarpılıyor.
 *
 * <p>Yan kazanç: tüketici `initHanui({ theme: { metrics: … } })` ile kendi
 * ölçek çarpanını verebiliyor.
 */
const scaled = (value: string, variable: 'type-scale' | 'space-scale'): string =>
  `calc(${value} * var(--hanui-${variable}))`;

const fluidType = (min: number, max: number): string => scaled(fluid(min, max), 'type-scale');

const fluidSpace = (min: number, max: number): string => scaled(fluid(min, max), 'space-scale');

/**
 * Koyu temanın gölge ve örtü mürekkebi.
 *
 * <p>⚠ SAF SİYAH DEĞİL. Palette saf siyah da saf beyaz da yok: ikisi de
 * markanın ekseni dışında duruyor ve gölge saf siyahken koyu yeşil yüzeylerin
 * üzerinde MOR bir kenar bırakıyor. Bu değer eksenin en dibi.
 */
const INK_DEEP = SURFACE_DARK.inset;

/** AÇIK TEMA — varsayılan. */
export const LIGHT_THEME = {
  // --- Yüzey ---
  /*
   * ⚠ SAYFA KARTTAN BİR KADEME KOYU — düzeltilen ölçülmüş bir düzlük.
   *
   * <p>Önceki merdivende `page` ve `surface` İKİSİ DE saf beyazdı ve kart
   * sayfadan dolguyla hiç ayrışmıyordu; ayrımın tamamını `card` mixin'inin
   * kenarlığı ile `shadow-sm` taşıyordu. Bedeli iki katmanlıydı: kenarlığı
   * kaldıran her yeni bileşen sayfanın içinde kayboluyordu, ve arayüzün
   * tamamı tek bir düzlemde okunuyordu.
   *
   * <p>Bugün kart merdivenin EN AÇIK basamağı, sayfa onun altında. Kartın
   * yükselmesi artık dolgudan geliyor; kenarlık ve gölge onu güçlendiriyor,
   * tek başına taşımıyor.
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
   * UYGULAMA KABUĞU — üst bant, alt bilgi, tablo başlığı, teknik blok.
   *
   * <p>⚠ Token adı 4.0.0'da `graphite*`ten `shell*`a TAŞINDI. Değer grafit
   * değil kurumsal koyu yeşil; yeni ad rengi değil ROLÜ anlatıyor — açık
   * temada çam merdiveni, koyu temada yüzey merdiveni.
   */
  shell: BAND.base,
  'shell-2': BAND.two,
  'shell-3': BAND.three,

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

  /*
   * DÖNÜŞÜM EYLEMİ ("sepete ekle") — ailenin en parlak yeşili.
   *
   * <p>⚠ Token adı 4.0.0'da `amber*`ten `cart*`a TAŞINDI. Değer bir sürüm
   * boyunca yeşildi ama ad turuncu diyordu; adına bakıp rengini tahmin eden
   * her tur yanlış "düzeltmeyi" yapmaya aday oluyordu.
   */
  cart: CART.base,
  'cart-hover': CART.hover,
  'cart-active': CART.active,
  'cart-soft': CART.soft,
  'on-cart': CART.on,

  /*
   * GEZİNME VE KEŞİF ROLÜ — bağlantı, etkin filtre, seçili satır, ilerleme.
   *
   * <p>⚠ Token adı 4.0.0'da `blue*`tan `role*`a TAŞINDI. Değer H 162'de bir
   * yeşil; "mavi" adı iki sürüm boyunca yalan söylüyordu.
   */
  role: ROLE.base,
  'role-hover': ROLE.hover,
  'role-active': ROLE.active,
  'role-text': ROLE.text,
  'role-tint': ROLE.tint,
  'role-line': ROLE.line,
  /*
   * ROL DOLGUSU ÜZERİNDEKİ METİN — etkin sayfa numarası, etkin karo madalyonu,
   * geçerli adım, dolu bağlantı rozeti. Bir zamanlar `on-action`ı kullanıyordu
   * ve o kestirme birincil eylemin dolgusu iki temada da koyu yeşile
   * sabitlendiğinde KIRILDI: `on-action` beyaza döndü, rol rengi ise koyu
   * temada açılıyor (`#51d6bb`) ve beyaz metin orada 2,1:1'e düşüyor. İki
   * dolgunun aydınlığı ters yönlere gidiyor, tek metin token'ı ikisini birden
   * taşıyamaz.
   */
  'on-role': NEUTRAL.n0,

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
  /**
   * Bandın ÜÇÜNCÜ metin kademesi ve imza vurgusu.
   *
   * <p>Panelin kenar çubuğu rayı bu ikisini bir dönem SABİT HEX olarak
   * taşıyordu (`#799a8f`, `#43ff9c`) — uygulamada kalan son renk
   * literalleriydi ve paletten bağımsız hareket ediyorlardı.
   */
  'band-fg-3': SURFACE_DARK.textThree,
  'band-accent': BRAND.mint,
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
  ring: `0 0 0 3px ${alpha(ROLE.base, 0.28)}`,
  'ring-color': ROLE.base,
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
  'glow-cart': alpha(CART.base, 0.09),
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

  /* KOYU TEMADA BANT MARKA ÇAMINA ÇIKMAZ, yüzey merdivenine oturur: sayfa
     kurumsal siyah ve bandın da zemin olması gerekiyor (bkz. `SURFACE_DARK`).
     Marka yeşili koyu temada yalnızca şeritte (`band-*`) ve birincil eylemin
     dolgusunda kalır. */
  shell: SURFACE_DARK.surface,
  'shell-2': SURFACE_DARK.surfaceTwo,
  'shell-3': SURFACE_DARK.surfaceThree,

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

  cart: CART.dark,
  'cart-hover': CART.darkHover,
  'cart-active': CART.darkActive,
  'cart-soft': CART.darkSoft,
  'on-cart': CART.on,

  role: ROLE.dark,
  'role-hover': ROLE.darkHover,
  'role-active': ROLE.base,
  'role-text': ROLE.dark,
  'role-tint': ROLE.darkTint,
  'role-line': ROLE.darkLine,
  /* Koyu temada mavi dolgu AÇILIYOR; üzerine siyah gider (10,55:1). */
  'on-role': NEUTRAL.n900,

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

  /*
   * ÜST BANT SAYFANIN KENDİSİ: koyu temada en koyu renk kılavuzun siyahı ve
   * bant onu ÖRTMEZ. Açık temadaki kardeşi de aynı şeyi yapıyor (`nav-bg`
   * beyaz, sayfa `n50`) — bant sayfanın devamıdır, ayrı bir yüzey değil;
   * sınırı `nav-line` çizer. Alt bilgi bir kademe yukarıda, ışığa doğru.
   */
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

  /* AÇIK TEMADAKİYLE BİREBİR AYNI — şerit temaya göre dönmez (bkz. LIGHT). */
  'band-bg': BAND.dark,
  'band-fg': CORPORATE.paper,
  'band-fg-2': CORPORATE.mist,
  /**
   * Bandın ÜÇÜNCÜ metin kademesi ve imza vurgusu.
   *
   * <p>Panelin kenar çubuğu rayı bu ikisini bir dönem SABİT HEX olarak
   * taşıyordu (`#799a8f`, `#43ff9c`) — uygulamada kalan son renk
   * literalleriydi ve paletten bağımsız hareket ediyorlardı.
   */
  'band-fg-3': SURFACE_DARK.textThree,
  'band-accent': BRAND.mint,
  'band-line': BAND.darkLine,
  'band-hover': alpha(NEUTRAL.n0, 0.07),

  /*
   * Koyu zeminde gölge okunmaz; derinlik daha çok kenarlıkla kurulur.
   * Gölgeler yine de KORUNUR ama daha derin: modal ve açılır liste yüzeyin
   * üzerinde durmalı.
   */
  'shadow-xs': `0 1px 2px ${alpha(INK_DEEP, 0.4)}`,
  'shadow-sm': `0 1px 2px ${alpha(INK_DEEP, 0.4)}, 0 1px 3px ${alpha(INK_DEEP, 0.3)}`,
  'shadow-md': `0 2px 4px ${alpha(INK_DEEP, 0.35)}, 0 6px 16px ${alpha(INK_DEEP, 0.45)}`,
  'shadow-lg': `0 4px 8px ${alpha(INK_DEEP, 0.4)}, 0 16px 32px ${alpha(INK_DEEP, 0.55)}`,
  'shadow-xl': `0 8px 16px ${alpha(INK_DEEP, 0.45)}, 0 28px 56px ${alpha(INK_DEEP, 0.6)}`,
  'shadow-up': `0 -2px 4px ${alpha(INK_DEEP, 0.3)}, 0 -8px 24px ${alpha(INK_DEEP, 0.45)}`,

  ring: `0 0 0 3px ${alpha(ROLE.dark, 0.36)}`,
  'ring-color': ROLE.dark,
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
  /**
   * YOĞUNLUK ÇARPANLARI — akışkan ölçeğin üzerine binen tek ayar.
   *
   * <p>Varsayılan `1`, yani hiçbir şeyi değiştirmez; `data-hanui-density`
   * ya da tüketicinin kendi metrik ezmesi bunları düşürür.
   */
  'type-scale': '1',
  'space-scale': '1',

  /*
   * BOŞLUK ÖLÇEĞİ — üçüncü kademeden itibaren akışkan.
   *
   * <p>⚠ `space-1` (4px) ve `space-2` (8px) SABİT KALIR ve bu bir eksiklik
   * değil: ikisi 4px ızgarasının birimi ve alt birimi. Akışkanlaştırılsalardı
   * 390px'te 3,4px'e inerlerdi — gözle ayırt edilemeyen bir kazanç karşılığında
   * her kılcal kenarlık yarım piksele oturur ve kaydırmada titrerdi.
   *
   * <p>Üst kademeler mobilde %16-44 iniyor; bir sayfanın dikey dolgusunun
   * yaklaşık üçte biri. "Kutular çok büyük" şikâyetinin sayısal karşılığı.
   */
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
   * TİPOGRAFİ ÖLÇEĞİ — AKIŞKAN.
   *
   * <p>⚠ Ölçüldü: vitrinde 446 `font-size` bildirimi vardı ve yalnızca 6'sı
   * viewport'a tepki veriyordu. Gövde 17px, başlık 47px'e kadar çıkıyor ve
   * 320px ekranda da aynı kalıyordu — taşmanın ve "her şey çok büyük"
   * şikâyetinin kaynağı buydu.
   *
   * <p>Küçülme kademeli: küçük arayüz metni %6-10 iner, gösterim tipografisi
   * %29-35. Şikâyetin şekli tam olarak bu — 13px'lik bir etiket dar ekranda
   * sorun değil, 47px'lik bir başlık sorun.
   *
   * <p>⚠ Üst uç bugünkü masaüstü değeri; **masaüstünde hiçbir şey değişmez.**
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

  /**
   * FORM DENETİMİ PUNTOSU — ölçekten AYRI ve 16px'in altına inmez.
   *
   * <p>⚠ iOS Safari, hesaplanan puntosu 16px'in ALTINDA olan bir `input`a
   * odaklanıldığında sayfayı zorla yakınlaştırır ve geri çıkmaz. `font-size-base`
   * akışkan olunca dar ekranda 15px'e iniyor, yani bu düzeltme olmadan
   * **telefonda her form alanı sayfayı zıplatırdı.**
   *
   * <p>`max()` kullanılıyor çünkü ölçek büyüdüğünde denetim de büyümeli;
   * sabit `16px` yazmak üst uçta alanı ölçeğin gerisinde bırakırdı.
   */
  'font-size-control': `max(16px, ${fluid(15, 16)})`,

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

/**
 * YOĞUN (compact) KİP — `<html data-hanui-density="compact">`.
 *
 * <p>⚠ <strong>17 SABİT DEĞER İKİ ÇARPANA İNDİ.</strong> Eski kip ölçeğin her
 * kademesini elle eziyordu ve o değerler (11/12/13/15/16/18/21/25/31/39)
 * akışkan ölçeğin mobil tabanlarıyla **neredeyse birebir aynıydı**. Sonuç:
 * yoğun kipi açan panel bir telefonda küçülmeyi İKİ KEZ yiyor, `2xs` 10px'in
 * altına düşüyordu. Ezme yerine çarpma, ikisini yapısal olarak uzlaştırıyor.
 *
 * <p>İkinci kazanç: kip artık ölçeğin ÜST ucunu da doğru taşıyor. Eski liste
 * elle yazıldığı için bir kademe eklendiğinde güncellenmesi unutulabilirdi.
 */
export const COMPACT_DENSITY = {
  'type-scale': '0.93',
  'space-scale': '0.88',
} as const satisfies Partial<Record<keyof typeof METRIC_TOKENS, string>>;

/**
 * DAR EKRAN KADEMELERİ — `@media (max-width: 640px)`.
 *
 * <p>Bu üç aile akışkan OLAMAZ ve gerekçeleri ayrı:
 *
 * <ul>
 *   <li><b>İkon</b> — Bootstrap Icons 1px'lik çizgiler taşıyor; kesirli bir
 *       kutuda çizildiğinde çizgi iki piksele yayılıp BULANIYOR. Tam sayı şart.</li>
 *   <li><b>Yarıçap</b> — 5,2px ile 6px arasındaki fark görülmüyor; akışkanlık
 *       bedava değil, kesirli yarıçap kenarlıkla birlikte tırtıklı kenar
 *       üretiyor. Yalnızca iki büyük kademe iniyor.</li>
 *   <li><b>Satır yüksekliği</b> — `line-height` UNITLESS kalmak zorunda, yoksa
 *       çocuklar oranı değil hesaplanmış UZUNLUĞU miras alır ve iç içe her öge
 *       bozulur. `calc()` uzunluğu uzunluğa bölemediği için akışkan bir oran
 *       ifade edilemiyor. Dar ölçüde daha sıkı satır zaten doğru tipografi.</li>
 * </ul>
 */
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
