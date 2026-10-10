/** PALET TARİFİ — `src/theme/palette.ts`in tek üretim kaynağı. */
import { maxChroma, toHex } from './oklch.mjs';

/** Kurumsal kimlik kılavuzu 2.0 — DEĞİŞMEZ. */
export const PINE = '#00322a';
export const MINT = '#43ff9c';

/**
 * NÖTR ANKORLAR (5.0) — arayüzün siyahı ve kâğıdı; marka ekseninden BİLİNÇLE ayrı.
 * ⚠ 4.x nötrleri marka ekseninde duruyordu (H 152-177, chroma 0,05'e kadar) ve arayüzün HER yüzeyi
 * açık bir yeşil çiziyordu: yeşil vurgu olmaktan çıkıp zeminin kendisine dönüşmüştü. Ankorlar
 * claude.com'un sıcak mürekkebinden (H 80-107, chroma 0,002-0,02) alındı; yeşil artık yalnızca
 * eylem, bağlantı ve odakta.
 */
export const INK = '#141413';
export const CANVAS = '#faf9f5';

/** MARKA EKSENİ — ton aydınlıkla birlikte kayar. Ölçüldü: `pine` H 178,5 · `mint` H 154,8. */
export const axisHue = lightness => {
  const t = Math.min(1, Math.max(0, (lightness - 0.15) / (0.97 - 0.15)));
  return 179 - t * 24;
};

/**
 * Ton ailelerinin açıları. ⚠ Bugün `ok`, `oem`, `off`, `blue` ve marka **hepsi yeşil eksende** ve
 * bu paletin okunamamasının ikinci sebebi: iki durum…
 */
export const HUE = {
  brand: null,
  cart: 152,
  ok: 152,
  /* Bağlantı ve odak halkası — 4.x'in `role` ailesinin 5.0'da yeşil kalan yarısı. */
  link: 162,
  /*
   * Eski palette bu aile zaten YEŞİLDİ (H ~165) ve `ok` ile arasında yalnızca 2° vardı; ayrımı ton
   * değil BAĞLAM taşıyor.
   * ⚠ CAMGÖBEĞİ DENENDİ VE GERİ ALINDI.
   */
  oem: 158,
  alt: 300,
  warn: 72,
  bad: 25,
  star: 85,
  /* `off` NÖTR ailedir: 4.x'te yeşil eksendeydi (H 170), 5.0'da nötr ekseni izler. */
  off: 88,
};

/**
 * `{ l, s, h }` ya da `{ l, c, h }` → hex. `s` o ton/aydınlıkta erişilebilir en yüksek chroma'nın
 * ORANI; `c` mutlak chroma.
 * ⚠ Nötrler `c` ile yazılır: 0,005 gibi bir chroma oranla ifade edildiğinde erişilebilir tavan tona
 * göre üç katına kadar değiştiği için kademeler arasında sessizce kayıyordu.
 */
export const mix = ({ l, s, c, h }) => {
  const hue = h ?? axisHue(l);
  return toHex({ l, c: c ?? maxChroma(l, hue) * s, h: hue });
};

/** Bir kademe ya HAZIR hex (ankor) ya da tariftir. */
export const resolve = step => (typeof step === 'string' ? step : mix(step));

/**
 * NÖTR KAPILARI.
 * ⚠ Tavan: nötr merdivende hiçbir kademe bu chroma'yı aşamaz. 4.x'te eksen "doygun nötr" adıyla
 * 0,05'e çıkmıştı ve kimse fark etmeden her yüzey yeşil olmuştu; tavan bunu kırılabilir kılar.
 */
export const NEUTRAL_CHROMA_CEILING = 0.025;

/**
 * TINT AYRIŞMASI — durum zemini ile kart (`surface-2`) arasındaki en küçük OKLab ΔE×100.
 * ⚠ Ölçüldü: krem kartta 4.x'in uyarı tinti 2,0, tehlike tinti 2,1 veriyordu; sayfa→kart kademesi
 * 4,7. Yani rozetin zemini, kartın sayfadan ayrıştığının yarısı kadar ayrışıyordu.
 */
export const MIN_TINT_DELTA_E = 4;

/** Ailenin canlılık tabanı — üreteç bunun altına inen bir değer üretirse patlar. */
export const MIN_SATURATION = {
  tint: 0.45,
  fill: 0.7,
  text: 0.75,
  line: 0.4,
};

/**
 * NÖTR MERDİVEN — 15 kademe, SICAK MÜREKKEP ekseni (H 75-107). Açık uç kâğıt, koyu uç siyah.
 * ⚠ Kademeler MUTLAK chroma ile yazılır (`c`) ve hiçbiri `NEUTRAL_CHROMA_CEILING`i aşamaz.
 * ⚠ Krem kademeler (n50-n150) kenarlık kademelerinden (n200-n300) DOYGUN: yüzey kâğıttır, çizgi
 * mürekkeptir. Aydınlık yine de tekdüze iner.
 */
export const NEUTRAL_STEPS = [
  /* Kartın ve girdinin zemini — sayfadan bir kademe AÇIK. Saf beyaz değil. */
  ['n0', { l: 0.997, c: 0.003, h: 85 }],
  ['n25', CANVAS],
  ['n50', { l: 0.957, c: 0.012, h: 80 }],
  ['n100', { l: 0.936, c: 0.016, h: 83 }],
  ['n150', { l: 0.91, c: 0.02, h: 82 }],
  ['n200', { l: 0.905, c: 0.011, h: 75 }],
  ['n250', { l: 0.885, c: 0.013, h: 75 }],
  ['n300', { l: 0.836, c: 0.018, h: 78 }],
  ['n400', { l: 0.761, c: 0.012, h: 90 }],
  ['n500', { l: 0.637, c: 0.0136, h: 92 }],
  ['n550', { l: 0.506, c: 0.011, h: 94 }],
  ['n600', { l: 0.413, c: 0.009, h: 90 }],
  ['n700', { l: 0.359, c: 0.005, h: 100 }],
  ['n800', { l: 0.264, c: 0.004, h: 100 }],
  ['n900', INK],
];

/**
 * KOYU TEMA YÜZEY MERDİVENİ — sıcak siyah. ⚠ Kademeler arası fark BİLİNÇLE küçük (1,03-1,14:1):
 * derinliği kenarlık kurar. `surfaceThree` claude.com'un `#252320`sinden bir tık açık, çünkü
 * `interactive-surface`in hover'ı TEK kademe ve o değerde görünmüyordu.
 */
export const SURFACE_DARK_STEPS = {
  page: INK,
  surface: { l: 0.205, c: 0.0042, h: 85 },
  surfaceTwo: { l: 0.235, c: 0.0058, h: 92 },
  surfaceThree: { l: 0.281, c: 0.0073, h: 92 },
  inset: { l: 0.163, c: 0.002, h: 100 },
  border: { l: 0.314, c: 0.0075, h: 85 },
  borderStrong: { l: 0.402, c: 0.0086, h: 89 },
  text: CANVAS,
  textTwo: { l: 0.761, c: 0.012, h: 90 },
  textThree: { l: 0.637, c: 0.0136, h: 92 },
  actionSoft: { l: 0.402, c: 0.0086, h: 89 },
};

/** BANT — birincil eylem merdiveni. */
export const BAND_STEPS = {
  two: { l: 0.375, s: 0.85 },
  three: { l: 0.44, s: 0.8 },
  darkLine: { l: 0.335, s: 0.8 },
  /* Şeridin üçüncü metin kademesi; şerit MARKA yüzeyi olduğu için marka ekseninde kalır. */
  fgThree: { l: 0.688, s: 0.4 },
};

/**
 * KURUMSAL YARDIMCI RENKLER — kılavuz 2.0'ın kâğıt / slate / sis üçlüsü, MARKA EKSENİNDE.
 * ⚠ 4.x'te bunlar nötr merdivenin takma adıydı. 5.0'da arayüz nötrleri sıcak mürekkebe geçti ve
 * üçlü YALNIZCA marka şeridinde (`band-*`) yaşıyor: çam zeminin üzerinde yeşil tonlu metin markanın
 * sesi, arayüzün zemini değil.
 */
export const CORPORATE_STEPS = {
  paper: { l: 0.963, s: 0.34 },
  slate: { l: 0.435, s: 0.6 },
  mist: { l: 0.748, s: 0.38 },
};

/**
 * DÖNÜŞÜM EYLEMİ (sepete ekle). ⚠ Birincil eylemden ayrımı TON AÇISI DEĞİL AYDINLIK: birincil koyu
 * dolgu + açık metin, dönüşüm açık dolgu + koyu metin.
 */
export const CART_STEPS = {
  base: { l: 0.62, s: 0.95, h: HUE.cart },
  hover: { l: 0.675, s: 0.95, h: HUE.cart },
  /* ⚠ BASILI DURUM YALNIZCA BİR TIK KOYU. */
  active: { l: 0.585, s: 0.95, h: HUE.cart },
  soft: { l: 0.78, s: 0.5, h: HUE.cart },
  dark: { l: 0.74, s: 0.9, h: HUE.cart },
  darkHover: { l: 0.8, s: 0.85, h: HUE.cart },
  darkActive: { l: 0.68, s: 0.9, h: HUE.cart },
  darkSoft: { l: 0.5, s: 0.5, h: HUE.cart },
  on: { l: 0.17, s: 0.9, h: HUE.cart },
};

/**
 * BAĞLANTI VE ODAK — 4.x'in `role` ailesinin yeşil kalan yarısı. ⚠ Seçim, ilerleme, onay kutusu,
 * anahtar artık bu aileyi KULLANMAZ: mürekkep merdivenine (`selected*`) geçtiler. Yeşil arayüzde
 * yalnızca eylem, bağlantı ve odakta.
 * ⚠ Ton açısı gözle ölçüldü (H 162): yukarısı camgöbeği okunuyordu, aşağısı olumlu durumla çakışıyor.
 */
export const LINK_STEPS = {
  /* Açık temanın odak halkası — grafik eşiği (3:1) dört yüzeyde. */
  base: { l: 0.52, s: 0.9, h: HUE.link },
  hover: { l: 0.45, s: 0.9, h: HUE.link },
  text: { l: 0.485, s: 0.92, h: HUE.link },
  dark: { l: 0.79, s: 0.75, h: HUE.link },
  darkHover: { l: 0.855, s: 0.7, h: HUE.link },
};

/**
 * DURUM AİLELERİ — altı aile, tek disiplin. Her ailenin altı üyesi aynı `l`/`s` şablonundan çıkar;
 * değişen tek şey ton açısı.
 */
/*
 * ⚠ ZEMİN 5.0'da BİR KADEME AŞAĞI VE DOYGUN (l .928 → .91, s .62 → .8). Krem yüzeyler (H 80-95)
 * uyarı (H 72) ve tehlike (H 25) ailelerine ton açısıyla çok yakın; yalnızca doygunluğu artırmak
 * uyarıyı ΔE 3,5'e taşıyordu, kapıyı (`MIN_TINT_DELTA_E`) aydınlık geçiriyor.
 */
export const STATUS_SHAPE = {
  bg: { l: 0.91, s: 0.8 },
  fg: { l: 0.475, s: 0.92 },
  line: { l: 0.815, s: 0.6 },
  bgDark: { l: 0.27, s: 0.65 },
  fgDark: { l: 0.785, s: 0.8 },
  lineDark: { l: 0.4, s: 0.6 },
};

/** AİLEYE ÖZEL SAPMALAR — ortak şablonun üzerine biner. */
export const STATUS_OVERRIDES = {
  /*
   * Olumlu zemin ortak şablona İNMEZ: yeşil ton açısında s .8 mint'e (`#43ff9c`) yaklaşan bir
   * dolgu üretiyordu ve "Stokta" rozeti markanın imza rengini taşımaya başlıyordu. Krem yüzeylerden
   * zaten uzak (ΔE 7,1), kapının itmesine gerek yok.
   */
  ok: {
    bg: { l: 0.928, s: 0.62 },
  },
  oem: {
    bg: { l: 0.912, s: 0.7 },
    fg: { l: 0.425, s: 0.95 },
    line: { l: 0.775, s: 0.68 },
    bgDark: { l: 0.255, s: 0.7 },
    fgDark: { l: 0.735, s: 0.85 },
    lineDark: { l: 0.375, s: 0.68 },
  },
  /*
   * `off` NÖTR aile ve MUTLAK chroma ile yazılır: oranla yazıldığında nötr eksenin kremi gibi
   * okunuyor ve "Tükendi" rozeti karttan ayrışmıyordu. Zemin kremden GRİYE çekildi.
   */
  off: {
    bg: { l: 0.89, c: 0.006 },
    fg: { l: 0.46, c: 0.012 },
    line: { l: 0.815, c: 0.01 },
    bgDark: { l: 0.3, c: 0.006 },
    fgDark: { l: 0.785, c: 0.012 },
    lineDark: { l: 0.4, c: 0.008 },
  },
};

/** Durum ailelerinin `STATUS` içindeki önek sırası. */
export const STATUS_FAMILIES = ['ok', 'warn', 'off', 'bad', 'oem', 'alt'];

/** YIKICI EYLEM DOLGUSU — üzerine beyaz metin gelir, o yüzden aydınlık sınırlı. */
export const DANGER_SOLID_STEPS = {
  base: { l: 0.52, s: 0.95, h: HUE.bad },
  hover: { l: 0.455, s: 0.95, h: HUE.bad },
  dark: { l: 0.63, s: 0.9, h: HUE.bad },
  darkHover: { l: 0.69, s: 0.85, h: HUE.bad },
  onDark: { l: 0.145, s: 0.9, h: HUE.bad },
};

/**
 * İKON VURGUSU — WCAG 1.4.11, 3:1 grafik eşiği. Metin eşiği (4,5) değil grafik eşiği (3) geçerli
 * olduğu için bu aile metin katmanından bir kademe AÇIK…
 */
export const ACCENT_STEPS = {
  red: { l: 0.575, s: 0.95, h: HUE.bad },
  redDark: { l: 0.66, s: 0.9, h: HUE.bad },
  green: { l: 0.575, s: 0.95, h: HUE.cart },
  greenDark: { l: 0.74, s: 0.9, h: HUE.cart },
  greenHover: { l: 0.505, s: 0.95, h: HUE.cart },
  greenHoverDark: { l: 0.8, s: 0.85, h: HUE.cart },
  onGreen: { l: 0.17, s: 0.9, h: HUE.cart },
};

/**
 * KATEGORİK PALET — grafik serileri, kategori noktaları, lejant kareleri.
 * ⚠ Marka yeşilleri seri rengi OLMAZ; yeşil yalnızca orta aydınlıkta bir kategori tonu (`cat3`).
 * ⚠ `cat2` kil TURUNCUSU, kırmızı değil: H 30'da tehlike ailesiyle (H 25) karışıyordu.
 * Kapılar: her ton iki temanın üç yüzeyinde ≥3:1 (`check:contrast`, grafik katmanı) ve iki ton
 * arasında ΔE ≥ `MIN_CATEGORY_DELTA_E` (üreteç).
 */
export const CATEGORY_HUES = {
  cat1: 255,
  cat2: 42,
  cat3: 162,
  cat4: 90,
  cat5: 345,
  /* İkinci seri — birinci seri mürekkebin kendisi (bkz. `tokens.ts` `series-1`). */
  series2: 300,
};

export const CATEGORY_SHAPE = {
  light: { l: 0.56, s: 0.85 },
  dark: { l: 0.74, s: 0.75 },
};

/** Kategori tonlarının birbirinden en az uzaklığı (OKLab ΔE×100). */
export const MIN_CATEGORY_DELTA_E = 8;

/**
 * SÖZDİZİMİ RENKLERİ — `CodeBlock`ın yerleşik vurgulayıcısı. Kategorik paletin beş tonu, METİN
 * aydınlığında: renk ailesi grafiklerle aynı, eşik farklı (kod 12-13 px metin → 4,5:1).
 * ⚠ Yeşil YOK: dize rengi çoğu temada yeşil ve kod bloğu bağlantının, birincil eylemin yanında
 * duruyor. Fark satırının yeşili (`ok-fg`) bir DURUM, sözdizimi rengi değil.
 * Kapılar: her ton iki temanın dört yüzeyinde ≥4,5:1 (`check:contrast`, metin katmanı) ve iki
 * ton arasında ΔE ≥ `MIN_SYNTAX_DELTA_E` (üreteç) — koyu temada açık tonlar birbirine yaklaşıyor.
 */
export const SYNTAX_HUES = {
  keyword: CATEGORY_HUES.cat5,
  string: CATEGORY_HUES.cat2,
  number: CATEGORY_HUES.series2,
  name: CATEGORY_HUES.cat1,
  type: CATEGORY_HUES.cat4,
};

export const SYNTAX_SHAPE = {
  light: { l: 0.5, s: 0.85 },
  dark: { l: 0.78, s: 0.85 },
};

/** Sözdizimi tonlarının birbirinden en az uzaklığı (OKLab ΔE×100). */
export const MIN_SYNTAX_DELTA_E = 8;

/**
 * YILDIZ ALTINI — açık temada metin eşiğini de geçmeli (puan sayısı yanında).
 * ⚠ 5.0'da l .545 → .52: krem kartta (`surface-2`) 4,15:1'e düşüyordu.
 */
export const STAR_STEPS = {
  light: { l: 0.52, s: 0.95, h: HUE.star },
  dark: { l: 0.805, s: 0.9, h: HUE.star },
};
