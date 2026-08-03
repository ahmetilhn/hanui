/**
 * HAM PALET — kütüphanenin TEK hex kaynağı.
 *
 * <p>Başka hiçbir dosyada birebir renk değeri yazılmaz. Zincir:
 *
 * <pre>
 *   theme/palette.ts   → ham hex (yalnızca burada)
 *   theme/tokens.ts    → anlamsal token adı → hex eşlemesi (açık + koyu)
 *   styles/_tokens.generated.scss → `:root` ve `[data-hanui-theme]` yayını
 *   styles/_colors.generated.scss → bileşenlerin gördüğü SCSS sözleşmesi
 * </pre>
 *
 * <p>Son iki dosya `scripts/build-tokens.mjs` tarafından ÜRETİLİR. Elle
 * yazıldıklarında TypeScript tarafındaki token listesiyle ayrışıyorlar ve
 * ayrışma sessiz: bir bileşen var olmayan bir değişkeni okuyup rengi
 * kaybediyor, derleme yine yeşil dönüyordu.
 */

// --- Nötr eksen -------------------------------------------------------
// Serin gri-mavi. Sıcak kum tonundan ayrıldık: ürün fotoğrafları ağırlıkla
// metal ve siyah plastik; sıcak zemin onları sarartıp kirli gösteriyordu.
export const NEUTRAL = {
  n0: '#ffffff',
  n25: '#fafbfc',
  n50: '#f6f7f9',
  n100: '#eef0f4',
  n150: '#e7eaef',
  n200: '#e2e6ec',
  /** Kart/girdi kenarı — `n200` sayfadan ayrılmıyordu. */
  n250: '#d6dce4',
  n300: '#c9d0da',
  n400: '#aab3c0',
  n500: '#8a94a3',
  /**
   * İkincil metnin okunur tabanı.
   *
   * ÖLÇÜLDÜ: `text-3` `n500`'dü ve beyaz üzerinde 3,2:1 veriyor; üstü çizili
   * fiyat, yer tutucu ve yardım metni gövde metni sayıldığı için WCAG
   * 1.4.3'ün 4,5:1 eşiğini GEÇMİYORDU. Aynı ton açısında aydınlık
   * düşürüldü: 4,67:1. Bir kademe daha koyulaştırmak `n600` ile ayrımı yok
   * ediyordu.
   */
  n550: '#6b7583',
  n600: '#5a6472',
  n700: '#3a424f',
  n800: '#232a35',
  n900: '#11151b',
} as const;

// --- Grafit -----------------------------------------------------------
// Üst bant, alt bilgi, tablo başlıkları, teknik bloklar ve BİRİNCİL EYLEM.
export const GRAPHITE = {
  base: '#1f2937',
  two: '#2b3646',
  three: '#3a4658',
  /** Koyu temada üst bant; sayfadan koyu kalmalı. */
  ink: '#12161d',
  inkTwo: '#1c222b',
} as const;

// --- Amber ------------------------------------------------------------
// EKRANDAKİ TEK DOYGUN TURUNCU: dönüşüm eylemi ("sepete ekle"). Başka
// hiçbir yerde dolgu olarak kullanılmaz.
export const AMBER = {
  base: '#f59e0b',
  hover: '#d98706',
  active: '#b87205',
  /** Pasif dönüşüm düğmesi; saydamlık değil KENDİ dolgusu. */
  soft: '#f8cd80',
  dark: '#fbbf24',
  darkHover: '#f0af12',
  /** Amber üzerinde metin — beyaz 2,3:1'de kalıyor, okunmuyor. */
  on: '#291500',
} as const;

// --- Mavi -------------------------------------------------------------
// Gezinme ve keşif: bağlantı, etkin filtre, odak halkası. Amber ile
// çarpışmaz çünkü işleri farklı.
export const BLUE = {
  base: '#2f6fed',
  hover: '#1d54c4',
  active: '#17439c',
  /** Gövde metni içi bağlantı — `base` 16px'te 4,55:1. */
  text: '#1d54c4',
  tint: '#eaf1fe',
  line: '#bcd2fb',
  dark: '#5b93ff',
  darkHover: '#7aa8ff',
  darkTint: '#16243c',
  darkLine: '#2a3f63',
} as const;

/**
 * MARKA ANKORLARI: kırmızı ve yeşil.
 *
 * <p>Aşağıdaki iki hex, kendi ailelerinin TEK KAYNAĞIDIR. Ailedeki her ton
 * (tint zemini, kenarlık, metin, koyu tema karşılığı) HSL uzayında bu iki
 * değerden türetildi: ton açısı ve doygunluk korunur, yalnızca aydınlık
 * kaydırılır. Yeni bir kırmızı/yeşil ton gerektiğinde gözle seçilmez —
 * buradan türetilir, yoksa aile zamanla dağılır.
 *
 * <p>⚠ ANKORLAR METİN RENGİ DEĞİLDİR. `green` beyaz üzerinde 2,22:1 —
 * gövde metni olarak WCAG'i geçmez. Bu yüzden aile iki katmanlı: ankor
 * İKON ve DOLGU için, ondan türetilen koyu ton METİN için.
 */
export const ANCHOR = {
  red: '#dc2626',
  green: '#34c759',
} as const;

/**
 * DURUM RENKLERİ.
 *
 * <p>Kural: TINT ZEMİN + KOYU METİN + eşleşen hairline. Asla doygun dolgu —
 * doygun dolgu "tıklanabilir" demektir ve durum etiketi tıklanabilir değildir.
 *
 * <p>Kenarlık tonları bir kademe koyulaştırıldı: rozetler "kutu" olarak
 * okunmalı; daha açık çizgiler tint zeminin üzerinde kaybolup yan yana duran
 * iki rozeti tek bir lekeye çeviriyordu.
 */
export const STATUS = {
  /* Yeşil ailesi `ANCHOR.green`den türetildi (L +44 / S −24, L +33 / S −14). */
  okBg: '#e8f4eb',
  /** 5,58:1 tint üzerinde — metin katmanı. */
  okFg: '#1d6e31',
  okLine: '#a8dcb7',
  okBgDark: '#122817',
  /** Koyu zeminde ankorun kendisi okunuyor (7,05:1). */
  okFgDark: '#34c759',
  okLineDark: '#22542f',

  warnBg: '#fdf0dd',
  warnFg: '#7a3e02',
  warnLine: '#ebc687',
  warnBgDark: '#2c2008',
  warnFgDark: '#f5c86b',
  warnLineDark: '#55401a',

  offBg: '#f1f2f5',
  offFg: '#3a424f',
  offLine: '#ccd2db',
  offBgDark: '#212630',
  offFgDark: '#a3adbb',
  offLineDark: '#333b47',

  /*
   * Kırmızı ailesi `ANCHOR.red`den türetildi. Önceki `badFg` (#7f1d1d) bir
   * bordoydu: favori kalbi ve olumsuz rozet ekranda kirli/kahverengi
   * okunuyordu. Aynı ton açısında kalıp aydınlığı açmak rengi hem canlı hem
   * okunur yapıyor.
   */
  badBg: '#f8ebeb',
  /** 5,45:1 tint üzerinde. */
  badFg: '#bb1e1e',
  badLine: '#e6a6a6',
  badBgDark: '#310f0f',
  /** 6,03:1 koyu tint üzerinde. */
  badFgDark: '#e97575',
  badLineDark: '#621b1b',

  /** Birincil / orijinal sınıflandırma tonu. */
  oemBg: '#eaf1fe',
  oemFg: '#16305c',
  oemLine: '#a9c6f9',
  oemBgDark: '#152139',
  oemFgDark: '#9dc0ff',
  oemLineDark: '#27395c',

  /** İkincil / muadil sınıflandırma tonu. */
  altBg: '#eeebfa',
  altFg: '#2e2661',
  altLine: '#c0b6ea',
  altBgDark: '#1d1a33',
  altFgDark: '#bfb3f5',
  altLineDark: '#332d56',
} as const;

/**
 * YIKICI EYLEM DOLGUSU (silme onayı).
 *
 * <p>Durum tinti DEĞİL, gerçek bir düğme. Ankorun kendisi: beyaz metinle
 * 4,83:1. Aynı kırmızıyı taşımaları kullanıcının uyarı etiketine tıklamayı
 * denemesine yol açıyordu.
 */
export const DANGER_SOLID = {
  base: '#dc2626',
  hover: '#bb1e1e',
  dark: '#e45b5b',
  darkHover: '#ef7a72',
  onDark: '#1a0b0a',
} as const;

/**
 * İKON DOLGULARI — favori kalbi gibi METİN OLMAYAN, doygun kalması gereken
 * yerler. WCAG grafik öğesi eşiği 3:1 (1.4.11) ve hepsi geçiyor; gövde
 * metni olarak KULLANILMAZ.
 */
export const ACCENT = {
  red: '#dc2626',
  redDark: '#e35252',
  green: '#34c759',
  greenDark: '#4cd76c',
  greenHover: '#2aae4b',
  greenHoverDark: '#63e084',
  /** Yeşil dolgu üzerindeki metin. BEYAZ DEĞİL: #34c759 üzerinde 2,22:1. */
  onGreen: '#06280f',
} as const;

/**
 * İNDİRİM / OLUMLU DEĞİŞİM ETİKETİ.
 *
 * <p>Fiyat SİYAH kalır; rozet YEŞİL — kazancı kırmızı ile işaretlemek
 * "uyarı" gibi okunuyordu, oysa indirim iyi haber.
 */
export const SALE = {
  bg: '#e8f4eb',
  fg: '#1d6e31',
  bgDark: '#122817',
  fgDark: '#34c759',
} as const;

/**
 * YILDIZ ALTINI.
 *
 * <p>Amber ailesinden AYRI kalır (amber yalnızca dönüşüm eylemi), ama eski
 * uyarı tonu (#7a3e02) bir kahverengiydi ve puan yıldızları kirli
 * görünüyordu. Bu ton sıcaklığı korur, doygun turuncuyla yarışmaz ve tek
 * başına bir dolgu olarak okunmaz.
 */
export const STAR = {
  /** 5,23:1 beyaz üzerinde. */
  light: '#9a5f04',
  /** 9,82:1 koyu zemin üzerinde. */
  dark: '#f0b429',
} as const;
