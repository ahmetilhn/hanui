/**
 * HAM PALET — kütüphanenin TEK hex kaynağı; değerler OKLCH'te türetilir.
 * ⚠ ÜRETİLMİŞ DOSYA: `scripts/lib/palette-recipe.mjs` tarifini değiştir, `npm run tokens`.
 * ⚠ Dört ankor sabit: marka için `pine` / `mint`, nötr eksen için `ink` / `canvas`.
 *   Geri kalan her şey onlardan türer.
 */
/**
 * MARKA — kılavuzun iki ankoru ve arayüzün mürekkebi.
 * ⚠ `mint` AÇIK ZEMİNDE METİN OLAMAZ (krem üzerinde 1,24:1).
 */
export const BRAND = {
  pine: '#00322a',
  mint: '#43ff9c',
  ink: '#141413',
} as const;

/**
 * KURUMSAL YARDIMCI RENKLER — kâğıt / slate / sis, MARKA EKSENİNDE.
 * ⚠ Yalnızca marka şeridinde (`band-*`) yaşar; arayüz nötrleri sıcak mürekkep merdivenidir.
 */
export const CORPORATE = {
  paper: '#e9f7ed',
  slate: '#325a4d',
  mist: '#8abaa1',
} as const;

/**
 * NÖTR EKSEN — SICAK MÜREKKEP: açık uç krem kâğıt (`n25` = canvas), koyu uç siyah (`n900` = ink).
 * ⚠ Marka ekseninde DEĞİL: 4.x'te öyleydi ve arayüzün her yüzeyi yeşil çiziliyordu.
 * ⚠ `n0` kartın zemini — sayfadan bir kademe açık, saf beyaz değil.
 */
export const NEUTRAL = {
  n0: '#fffefc',
  n25: '#faf9f5',
  n50: '#f5f0e8',
  n100: '#efe9de',
  n150: '#e8e0d3',
  n200: '#e4dfd8',
  n250: '#ded8d0',
  n300: '#d0c8bd',
  n400: '#b4b1a9',
  n500: '#8e8b82',
  n550: '#67655e',
  n600: '#4d4b46',
  n700: '#3d3d3a',
  n800: '#252523',
  n900: '#141413',
} as const;

/** BANT — üst bant, alt bilgi, tablo başlıkları ve BİRİNCİL EYLEM; tabanı `pine`. */
export const BAND = {
  base: '#00322a',
  two: '#154c3d',
  three: '#225f4d',
  dark: '#00322a',
  darkLine: '#143f34',
  fgThree: '#79a790',
} as const;

/**
 * KOYU TEMA YÜZEYLERİ — sıcak siyah.
 * ⚠ Kademeler arası fark bilinçle küçük (1,03-1,14:1); derinliği kenarlık kurar.
 */
export const SURFACE_DARK = {
  page: '#141413',
  surface: '#181715',
  surfaceTwo: '#1f1e1b',
  surfaceThree: '#2a2925',
  inset: '#0e0e0d',
  border: '#33312d',
  borderStrong: '#4a4843',
  text: '#faf9f5',
  textTwo: '#b4b1a9',
  textThree: '#8e8b82',
  actionSoft: '#4a4843',
} as const;

/**
 * BİRİNCİL EYLEMİN SINIRI — dolgunun kendisi değil, KENARI.
 * ⚠ Koyu temada çam dolgu kaybolur; mint saç çizgisi grafik eşiğini her zeminde geçer.
 */
export const ACTION_LINE = {
  light: '#00322a',
  dark: '#43ff9c',
} as const;

/**
 * DÖNÜŞÜM EYLEMİ ("sepete ekle") — ekrandaki tek PARLAK yeşil.
 * ⚠ Birincil eylemden ayrımı TON AÇISI DEĞİL AYDINLIK.
 * ⚠ Etkileşim yönü açık temada TERS: hover AÇILIR, active KOYULUR.
 */
export const CART = {
  base: '#1ba055',
  hover: '#20b360',
  active: '#19934e',
  soft: '#84cb97',
  dark: '#37c971',
  darkHover: '#4cdd82',
  darkActive: '#30b464',
  darkSoft: '#466e51',
  on: '#021407',
} as const;

/**
 * BAĞLANTI VE ODAK — 4.x `role` ailesinin yeşil kalan yarısı.
 * ⚠ Seçim, ilerleme, onay kutusu ve anahtar bu aileyi KULLANMAZ; mürekkep merdivenindedir.
 * ⚠ TON AÇISI GÖZLE ÖLÇÜLDÜ: H 162 ilk kesin yeşil, yukarı çekilmez.
 */
export const LINK = {
  base: '#1f7b56',
  hover: '#176446',
  text: '#17704e',
  dark: '#60d4a1',
  darkHover: '#76eab5',
} as const;

/** ANKORLAR — halka ve vurgu renklerinin türediği iki uç. */
export const ANCHOR = {
  red: '#de1b2c',
  green: '#18904c',
} as const;

/**
 * DURUM AİLELERİ — altı aile tek şablondan çıkar; değişen tek şey ton açısı.
 * ⚠ TINT ZEMİNLERİ AYDINLIKTA BİR KADEME DÜŞÜK: L .95'te chroma çok küçük.
 */
export const STATUS = {
  okBg: '#c2f6cf',
  okFg: '#166e3a',
  okLine: '#7eda99',
  okBgDark: '#132d1b',
  okFgDark: '#56d682',
  okLineDark: '#2c5137',
  warnBg: '#f9dcb9',
  warnFg: '#7c5212',
  warnLine: '#e8b97f',
  warnBgDark: '#322311',
  warnFgDark: '#eeaa4c',
  warnLineDark: '#594327',
  offBg: '#dcdad6',
  offFg: '#5b5851',
  offLine: '#c5c2bb',
  offBgDark: '#2f2e2a',
  offFgDark: '#bcb9b0',
  offLineDark: '#494743',
  badBg: '#f9d8d5',
  badFg: '#a91922',
  badLine: '#e9b3ae',
  badBgDark: '#431514',
  badFgDark: '#f2a099',
  badLineDark: '#732f2c',
  oemBg: '#a7f7c8',
  oemFg: '#0c5d3a',
  oemLine: '#6ace97',
  oemBgDark: '#0f291b',
  oemFgDark: '#43c485',
  oemLineDark: '#224b35',
  altBg: '#e5dcf9',
  altFg: '#751dc8',
  altLine: '#c9bae7',
  altBgDark: '#2e184c',
  altFgDark: '#c3aaf1',
  altLineDark: '#533281',
} as const;

/** YIKICI EYLEM DOLGUSU — üzerine açık metin gelir, aydınlığı bu yüzden sınırlı. */
export const DANGER_SOLID = {
  base: '#c21625',
  hover: '#a2111d',
  dark: '#f53039',
  darkHover: '#f26a64',
  onDark: '#1b0102',
} as const;

/** İKON VURGUSU — WCAG 1.4.11, 3:1 grafik eşiği; metin katmanından bir kademe açık. */
export const ACCENT = {
  red: '#de1b2c',
  redDark: '#f64f4e',
  green: '#18904c',
  greenDark: '#37c971',
  greenHover: '#12783e',
  greenHoverDark: '#4cdd82',
  onGreen: '#021407',
} as const;

/** İNDİRİM ETİKETİ — olumlu durum ailesiyle aynı; ayrı bir yeşil değil. */
export const SALE = {
  bg: '#c2f6cf',
  fg: '#166e3a',
  bgDark: '#132d1b',
  fgDark: '#56d682',
} as const;

/** YILDIZ ALTINI — puan sayısının yanında durduğu için metin eşiğini de geçer. */
export const STAR = {
  light: '#846310',
  dark: '#ebb737',
} as const;

/**
 * KATEGORİK PALET — grafik serileri ve kategori işaretleri.
 * ⚠ Marka yeşilleri seri rengi OLMAZ; `cat3` orta aydınlıkta bir kategori yeşili.
 */
export const CATEGORY = {
  cat1: '#2774cd',
  cat1Dark: '#7eaeeb',
  cat2: '#b75225',
  cat2Dark: '#ec8f6b',
  cat3: '#2c8761',
  cat3Dark: '#58c393',
  cat4: '#8b7126',
  cat4Dark: '#c7a74f',
  cat5: '#c02f8f',
  cat5Dark: '#ed81c1',
  series2: '#8f3beb',
  series2Dark: '#b699eb',
} as const;

/**
 * SÖZDİZİMİ — `CodeBlock`ın vurgulayıcısı; kategorik tonlar METİN aydınlığında (≥4,5:1).
 * ⚠ Yeşil yok: fark satırının yeşili bir durum (`ok-fg`), sözdizimi rengi değil.
 */
export const SYNTAX = {
  keyword: '#a4277a',
  keywordDark: '#f691cc',
  string: '#9d451f',
  stringDark: '#f59e7c',
  number: '#7b2dcd',
  numberDark: '#c2a7f5',
  name: '#2063b0',
  nameDark: '#8dbaf5',
  type: '#76611f',
  typeDark: '#d9b341',
} as const;
