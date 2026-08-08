/** HAM PALET — kütüphanenin TEK hex kaynağı. */

/**
 * MARKA ÜÇLÜSÜ — sistemin geri kalanı bu üç renkten türer.
 *
 * <p>`pine` birincil eylem ve koyu bantlar, `ink` nötr ekseni ve koyu temanın
 * sayfası, `spring` olumlu/yeşil ailesinin ankoru. Amber, mavi, kırmızı ve
 * yıldız altını marka DEĞİL işlev renkleridir: dönüşüm, gezinme, yıkım ve
 * puan. Onları yeşile çevirmek üç ayrı anlamı tek renge yükler.
 */
export const BRAND = {
  pine: '#003f34',
  ink: '#0e1419',
  spring: '#20a45e',
} as const;

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
  /** İkincil metnin okunur tabanı. */
  n550: '#626c7a',
  n600: '#5a6472',
  n700: '#3a424f',
  n800: '#232a35',
  /** Ekseni marka mürekkebi kapatır: gövde metni, örtü ve gölge buradan. */
  n900: BRAND.ink,
} as const;

/**
 * BANT — üst bant, alt bilgi, tablo başlıkları, teknik bloklar ve BİRİNCİL
 * EYLEM.
 *
 * <p>⚠ Token adları `graphite`/`graphite-2`/`graphite-3` olarak KALDI: onlar
 * kütüphanenin açık sözleşmesi ve yeniden adlandırma büyük sürüm ister.
 * Değerleri artık grafit değil çam yeşili; ad rengi değil ROLÜ anlatıyor.
 */
export const BAND = {
  base: BRAND.pine,
  two: '#0a5647',
  three: '#166f5d',
  /** Koyu temada üst bant; sayfadan (marka mürekkebi) bir tık koyu olmalı. */
  dark: '#070c10',
  darkTwo: '#0f161c',
} as const;

/**
 * KOYU TEMA YÜZEYLERİ — merdiven marka mürekkebinden başlar.
 *
 * <p>Sayfa `BRAND.ink`in kendisidir; yüzeyler ondan yukarı doğru açılır.
 * Bant (`BAND.dark`) sayfadan aşağı iner, yoksa üst bant sayfanın üzerinde
 * yüzüyor görünür.
 */
export const SURFACE_DARK = {
  page: BRAND.ink,
  surface: '#151d24',
  surfaceTwo: '#1d262e',
  surfaceThree: '#253038',
  inset: '#111920',
  border: '#253038',
  borderStrong: '#37434f',
  text: '#e6ebef',
  textTwo: '#9aa6b0',
  /*
   * Açık temanın `text-3`ü ile AYNI HEX DEĞİL, olamaz da: koyu temada aynı ton
   * zeminden uzaklaşmaz, yaklaşır. Ölçüldü: bir kademe koyusu (`#6b7583`)
   * `surface` üzerinde 3,69:1 kalıyor — yer tutucu ve üstü çizili fiyat koyu
   * temada okunmuyordu.
   */
  textThree: '#828e99',
  /** Pasif dolgu; koyu temada ortada bir nötr (metin AÇIK olmalı). */
  actionSoft: '#3c4750',
} as const;

// --- Amber ------------------------------------------------------------
// EKRANDAKİ TEK DOYGUN TURUNCU: dönüşüm eylemi ("sepete ekle"). Başka
// hiçbir yerde dolgu olarak kullanılmaz. Marka yeşiliyle çarpışmaz çünkü
// işleri farklı — ve dönüşüm düğmesi yeşil olsaydı olumlu durum etiketiyle
// aynı aileye düşer, tek doygun rengin taşıdığı vurgu dağılırdı.
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
  darkSoft: '#6d5316',
} as const;

// --- Mavi -------------------------------------------------------------
// Gezinme ve keşif: bağlantı, etkin filtre, odak halkası. Odak halkası
// MARKA RENGİ OLAMAZ: birincil düğme çam yeşili ve yeşil bir halka yeşil
// dolgunun üzerinde görünmez.
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
 * ANKORLAR: kırmızı ve marka yeşili.
 *
 * <p>⚠ ANKORLAR METİN RENGİ DEĞİLDİR. `green` beyaz üzerinde 3,21:1 — gövde
 * metni olarak WCAG'i geçmez. Bu yüzden aile iki katmanlı: ankor İKON ve
 * DOLGU için, ondan türetilen koyu ton METİN için.
 */
export const ANCHOR = {
  red: '#dc2626',
  green: BRAND.spring,
} as const;

/** DURUM RENKLERİ. */
export const STATUS = {
  /* Yeşil ailesi `BRAND.spring`den türetildi (L +44 / S −24, L +33 / S −14). */
  okBg: '#e6f4ec',
  /** 5,76:1 tint üzerinde — metin katmanı. */
  okFg: '#0f6b46',
  okLine: '#a4dcbf',
  okBgDark: '#0f2a1d',
  /** Ankorun bir kademe açığı; koyu tint üzerinde 6,87:1. */
  okFgDark: '#3ec47f',
  okLineDark: '#1e5539',

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

/** YIKICI EYLEM DOLGUSU (silme onayı). */
export const DANGER_SOLID = {
  base: '#dc2626',
  hover: '#bb1e1e',
  dark: '#e45b5b',
  darkHover: '#ef7a72',
  onDark: '#1a0b0a',
} as const;

/**
 * İKON DOLGULARI — favori kalbi, kopyalandı tiki gibi metin olmayan ve doygun
 * kalması gereken yerler. Eşik WCAG 1.4.11: grafik öğesi 3:1.
 *
 * <p>⚠ Marka ankorunun kendisi eşiği GEÇMİYOR (`#20a45e` `surface-2` üzerinde
 * 2,81:1) ve `CopyField`in tiki, kopyalamanın başarısını söyleyen tek görsel
 * sinyal. İkon katmanı bu yüzden ankordan ayrıldı; nöbetçi
 * `scripts/check-contrast.mjs`.
 */
export const ACCENT = {
  red: '#dc2626',
  redDark: '#e35252',
  /** 3,17:1 `surface-2` üzerinde — ailenin ikon katmanı, ankor değil. */
  green: '#199a53',
  greenDark: '#43ce7d',
  /** İKON hover'ı; metin taşıyan dolgunun hover'ı değil (yukarıdaki not). */
  greenHover: '#158548',
  greenHoverDark: '#63dd94',
  /** Yeşil dolgu üzerindeki metin. BEYAZ DEĞİL: `green` üzerinde 3,62:1. */
  onGreen: '#04200f',
} as const;

/** İNDİRİM / OLUMLU DEĞİŞİM ETİKETİ. */
export const SALE = {
  bg: '#e6f4ec',
  fg: '#0f6b46',
  bgDark: '#0f2a1d',
  fgDark: '#3ec47f',
} as const;

/** YILDIZ ALTINI. */
export const STAR = {
  /** 5,23:1 beyaz üzerinde. */
  light: '#9a5f04',
  /** 9,82:1 koyu zemin üzerinde. */
  dark: '#f0b429',
} as const;
