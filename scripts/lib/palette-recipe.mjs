/**
 * PALET TARİFİ — `src/theme/palette.ts`in tek üretim kaynağı.
 *
 * <p>Değerler elle seçilmez; her biri bir OKLCH koordinatından ve o ton/aydınlık
 * çiftinde sRGB'ye sığan en yüksek chroma'nın bir ORANINDAN türer. Gerekçe: 103
 * hex'i gözle seçmek, sonraki turda birinin tek bir tonu "düzeltip" aileyi
 * ayrıştırması demekti — bugünkü paletin durum tint'leri tam olarak böyle
 * ayrışmıştı (`okBg` %26 doygunlukta, `warnBg` %85).
 *
 * <p>⚠ <strong>YALNIZCA İKİ DEĞER SABİTTİR</strong> — `pine` ve `mint`. Kurumsal
 * kimlik kılavuzunun iki ankoru; geri kalan her şey onlardan türer. Üreteç,
 * çıktısını eski paletin hex listesine karşı denetler ve bir eşleşme bulursa
 * patlar (`build-palette.mjs` → `assertNoLegacyHex`).
 */
import { maxChroma, toHex } from './oklch.mjs';

/** Kurumsal kimlik kılavuzu 2.0 — DEĞİŞMEZ. */
export const PINE = '#00322a';
export const MINT = '#43ff9c';

/**
 * MARKA EKSENİ — ton aydınlıkla birlikte kayar.
 *
 * <p>Ölçüldü: `pine` H 178,5 · `mint` H 154,8. İki ankor aynı tonda DEĞİL, 24°
 * ayrı. Tek bir ortalama ton seçmek ikisinden birini ailenin dışına atardı;
 * bunun yerine eksen aydınlıkla birlikte döner — koyu uç pine'ın serin
 * yeşiline, açık uç mint'in canlı yeşiline oturur.
 */
export const axisHue = lightness => {
  const t = Math.min(1, Math.max(0, (lightness - 0.15) / (0.97 - 0.15)));
  return 179 - t * 24;
};

/**
 * Ton ailelerinin açıları.
 *
 * <p>⚠ Bugün `ok`, `oem`, `off`, `blue` ve marka **hepsi yeşil eksende** ve bu
 * paletin okunamamasının ikinci sebebi: iki durum rozeti yan yana geldiğinde
 * hangisinin ne söylediği yalnızca aydınlıktan çıkıyordu. Aileler artık ayrı
 * açılarda ama hepsi markanın komşuluğundan çıkmıyor — kırmızı ve amber
 * dışında hiçbiri yeşil-camgöbeği bandını terk etmez.
 */
export const HUE = {
  brand: null,
  cart: 152,
  ok: 152,
  role: 162,
  /*
   * ⚠ CAMGÖBEĞİ DENENDİ VE GERİ ALINDI. Aile bir tur H 192'ye taşındı —
   * gerekçe "teknik sınıflandırma rozeti diğer beş aileden ayrışsın" idi ve
   * ayrışma gerçekten oluyordu; düşen şey markaydı. `oem-fg` koyu temada
   * `#55cfcb` çıkıyor ve ekranda **camgöbeği** okunuyor, yani kılavuzun
   * tanımadığı bir renk sipariş numarasının, takip kodunun ve doğrulama
   * kodunun rozetine giriyordu.
   *
   * <p>Eski palette bu aile zaten YEŞİLDİ (H ~165) ve `ok` ile arasında
   * yalnızca 2° vardı; ayrımı ton değil BAĞLAM taşıyor. Bugün 158 — `ok`tan
   * (152) ayrışacak kadar uzak, turkuaz eşiğinin (168) çok altında.
   */
  oem: 158,
  alt: 300,
  warn: 72,
  bad: 25,
  star: 85,
  off: 170,
};

/**
 * `{ l, s, h }` → hex. `s` mutlak chroma DEĞİL, o ton/aydınlıkta erişilebilir
 * en yüksek chroma'nın oranı.
 *
 * <p>Oranla çalışmak zorunlu: sRGB'de erişilebilir chroma tona ve aydınlığa
 * göre üç katına kadar değişiyor (H 160'ta L .30'da 0,068 · L .88'de 0,199).
 * Mutlak chroma yazılsaydı aynı sayı bir ailede doygun, diğerinde gri görünürdü.
 */
export const mix = ({ l, s, h }) => {
  const hue = h ?? axisHue(l);
  return toHex({ l, c: maxChroma(l, hue) * s, h: hue });
};

/** Ailenin canlılık tabanı — üreteç bunun altına inen bir değer üretirse patlar. */
export const MIN_SATURATION = {
  tint: 0.45,
  fill: 0.7,
  text: 0.75,
  line: 0.4,
};

/**
 * NÖTR MERDİVEN — 15 kademe.
 *
 * <p>⚠ Açık uç bilinçle bugünkünden DOYGUN. Ölçüldü: `n25`…`n300` bugün
 * %8-13 doygunlukta, yani fiilen gri; kurumsal kâğıdın yeşile kayması
 * yüzeylerde hiç görünmüyordu. Yeni açık uç %32-34'te — hâlâ nötr okunur ama
 * yüzeyler ölü değil.
 *
 * <p>⚠ <strong>SAF BEYAZ YOK.</strong> `n0` bile marka ekseninde duruyor
 * (L 99,5). Kullanıcı kararı "istisnasız her renk değişir" idi ve saf beyaz
 * bir istisna olurdu; ayrıca kâğıdın yeşile kaydığı bir markada 255,255,255
 * bir yüzey olarak SOĞUK okunuyor — kart ile sayfa arasındaki ilişki, ikisi
 * de aynı eksende olduğunda daha temiz kuruluyor.
 */
export const NEUTRAL_STEPS = [
  ['n0', { l: 0.995, s: 0.2 }],
  ['n25', { l: 0.986, s: 0.32 }],
  ['n50', { l: 0.976, s: 0.32 }],
  ['n100', { l: 0.963, s: 0.34 }],
  ['n150', { l: 0.946, s: 0.34 }],
  ['n200', { l: 0.931, s: 0.34 }],
  ['n250', { l: 0.9, s: 0.34 }],
  ['n300', { l: 0.854, s: 0.34 }],
  ['n400', { l: 0.748, s: 0.38 }],
  ['n500', { l: 0.628, s: 0.45 }],
  ['n550', { l: 0.509, s: 0.52 }],
  ['n600', { l: 0.435, s: 0.6 }],
  ['n700', { l: 0.348, s: 0.7 }],
  ['n800', { l: 0.259, s: 0.85 }],
  ['n900', { l: 0.15, s: 0.95 }],
];

/**
 * KOYU TEMA YÜZEY MERDİVENİ.
 *
 * <p>⚠ Koyu tema SİYAHTIR, koyu yeşil değil. Bir dönem yüzeyler marka çamına
 * doygundu ve sonuç "koyu tema" değil "yeşil tema"ydı; kurumsal siyah yalnızca
 * sayfada kalıp üstündeki her yüzey tarafından örtülüyordu. Chroma bu yüzden
 * merdivende yukarı çıktıkça DÜŞER.
 */
export const SURFACE_DARK_STEPS = {
  page: { l: 0.15, s: 0.95 },
  surface: { l: 0.195, s: 0.72 },
  surfaceTwo: { l: 0.245, s: 0.6 },
  surfaceThree: { l: 0.3, s: 0.5 },
  inset: { l: 0.115, s: 1.0 },
  border: { l: 0.335, s: 0.45 },
  borderStrong: { l: 0.43, s: 0.4 },
  text: { l: 0.963, s: 0.34 },
  textTwo: { l: 0.748, s: 0.38 },
  textThree: { l: 0.688, s: 0.4 },
  actionSoft: { l: 0.43, s: 0.35 },
};

/** BANT — birincil eylem merdiveni. Tabanı `pine`ın kendisi. */
export const BAND_STEPS = {
  two: { l: 0.375, s: 0.85 },
  three: { l: 0.44, s: 0.8 },
  darkLine: { l: 0.335, s: 0.8 },
};

/**
 * DÖNÜŞÜM EYLEMİ (sepete ekle).
 *
 * <p>⚠ Birincil eylemden ayrımı TON AÇISI DEĞİL AYDINLIK: birincil koyu dolgu +
 * açık metin, dönüşüm açık dolgu + koyu metin. İki yeşil yan yana durduğunda
 * hangisinin "satın al" olduğunu ayıran şey budur.
 */
export const CART_STEPS = {
  base: { l: 0.62, s: 0.95, h: HUE.cart },
  hover: { l: 0.675, s: 0.95, h: HUE.cart },
  /*
   * ⚠ BASILI DURUM YALNIZCA BİR TIK KOYU. Refleks "active = belirgin koyu"
   * ama bu dolgu KOYU METİN taşıyor: koyulaşan her kademe metin eşiğini
   * aşağı çekiyor. Ölçüldü — L .545'te oran 4,09:1'e düşüyor ve kapı kırılıyor.
   * Bu, ailenin 4,5:1'i geçen en koyu tonu; altına inilmez.
   */
  active: { l: 0.585, s: 0.95, h: HUE.cart },
  soft: { l: 0.78, s: 0.5, h: HUE.cart },
  dark: { l: 0.74, s: 0.9, h: HUE.cart },
  darkHover: { l: 0.8, s: 0.85, h: HUE.cart },
  darkActive: { l: 0.68, s: 0.9, h: HUE.cart },
  darkSoft: { l: 0.5, s: 0.5, h: HUE.cart },
  on: { l: 0.17, s: 0.9, h: HUE.cart },
};

/**
 * ROL / GEZİNME — bağlantı, keşif, etkin durum.
 *
 * <p>⚠ Ton markanın SERİN ucunda (H 178, pine'ın kendi açısı), camgöbeğinde
 * değil. Bir dönem H 182'deydi ve koyu temada camgöbeği okunuyordu; ailenin
 * marka olarak tanınması bu 4°'ye bağlı.
 */
export const ROLE_STEPS = {
  base: { l: 0.52, s: 0.9, h: HUE.role },
  hover: { l: 0.45, s: 0.9, h: HUE.role },
  active: { l: 0.385, s: 0.9, h: HUE.role },
  text: { l: 0.485, s: 0.92, h: HUE.role },
  tint: { l: 0.945, s: 0.5, h: HUE.role },
  line: { l: 0.845, s: 0.5, h: HUE.role },
  dark: { l: 0.79, s: 0.75, h: HUE.role },
  darkHover: { l: 0.855, s: 0.7, h: HUE.role },
  darkTint: { l: 0.245, s: 0.62, h: HUE.role },
  darkLine: { l: 0.395, s: 0.6, h: HUE.role },
};

/**
 * DURUM AİLELERİ — altı aile, tek disiplin.
 *
 * <p>Her ailenin altı üyesi aynı `l`/`s` şablonundan çıkar; değişen tek şey ton
 * açısı. Bir rozet ailesi bu yüzden "aynı ağırlıkta" okunur.
 *
 * <p>⚠ TINT ZEMİNLERİ BUGÜNKÜNDEN BELİRGİN DOYGUN ve aydınlığı bir kademe
 * düşük. Ölçüldü: L .95'te erişilebilir chroma çok küçük, yani bugünkü tint'ler
 * "soluk" olmaya mecburdu. L .928'e inmek zeminin canlanmasının tek yolu; koyu
 * metin o zeminde hâlâ rahat okunuyor.
 */
export const STATUS_SHAPE = {
  bg: { l: 0.928, s: 0.62 },
  fg: { l: 0.475, s: 0.92 },
  line: { l: 0.815, s: 0.6 },
  bgDark: { l: 0.245, s: 0.6 },
  fgDark: { l: 0.785, s: 0.8 },
  lineDark: { l: 0.4, s: 0.6 },
};

/** `off` nötr ailedir: aynı şablon, chroma'nın üçte biri. */
export const OFF_SATURATION_FACTOR = 0.33;

/**
 * AİLEYE ÖZEL SAPMALAR — ortak şablonun üzerine biner.
 *
 * <p>⚠ `oem` ile `ok` aynı yeşil bantta (158 ↔ 152) ve ton tek başına ikisini
 * ayırmaya yetmiyor. Ayrımı AĞIRLIK taşıyor: teknik rozet bir kademe daha
 * koyu ve daha yoğun — sipariş numarası bir "başarı" değil bir KAYIT, ve
 * ekranda öyle okunmalı. Ton açısıyla ayırmaya çalışmak aileyi camgöbeğine
 * götürüyordu (bkz. `HUE.oem`).
 */
export const STATUS_OVERRIDES = {
  oem: {
    bg: { l: 0.912, s: 0.7 },
    fg: { l: 0.425, s: 0.95 },
    line: { l: 0.775, s: 0.68 },
    bgDark: { l: 0.225, s: 0.68 },
    fgDark: { l: 0.735, s: 0.85 },
    lineDark: { l: 0.375, s: 0.68 },
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
 * İKON VURGUSU — WCAG 1.4.11, 3:1 grafik eşiği.
 *
 * <p>Metin eşiği (4,5) değil grafik eşiği (3) geçerli olduğu için bu aile
 * metin katmanından bir kademe AÇIK durabilir; canlılığın açık temada en çok
 * göründüğü yer burası.
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

/** YILDIZ ALTINI — açık temada metin eşiğini de geçmeli (puan sayısı yanında). */
export const STAR_STEPS = {
  light: { l: 0.545, s: 0.95, h: HUE.star },
  dark: { l: 0.805, s: 0.9, h: HUE.star },
};
