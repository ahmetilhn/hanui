/** HAM PALET — kütüphanenin TEK hex kaynağı. */

/**
 * MARKA ÜÇLÜSÜ — <strong>Hanparça kurumsal kimlik kılavuzu 2.0</strong>.
 *
 * <p>Kılavuzun kendi sözleriyle: "Marka üç renkten oluşur: koyu yeşil, açık
 * yeşil, siyah. Logoda yalnızca bu üçü kullanılır — dördüncü bir renk yoktur."
 * Amber, mavi, kırmızı ve yıldız altını marka DEĞİL işlev renkleridir:
 * dönüşüm, gezinme, yıkım ve puan. Kılavuzun "dördüncü renk yok" kuralı
 * LOGOYU kapsar; bir arayüzün dönüşüm düğmesini ya da hata rengini
 * kapsamıyor. Onları yeşile çevirmek üç ayrı anlamı tek renge yükler.
 *
 * <p>⚠ <strong>`mint` AÇIK ZEMİNDE METİN OLAMAZ.</strong> Kâğıt üzerinde
 * kontrastı 1,18:1 — neredeyse görünmez. Kılavuzdaki tek kesin renk kuralı
 * bu. Bu yüzden mint yalnızca KOYU zeminde metin/işaret, ya da üzerine koyu
 * metin gelen bir DOLGU olarak kullanılır; olumlu durum ailesinin ankoru
 * ondan türetilmez (bkz. `ACCENT`).
 */
export const BRAND = {
  /** Koyu yeşil — marka zemini, açık zemindeki logo rengi, birincil eylem. */
  pine: '#00322a',
  /** Açık yeşil — imza rengi. Yalnızca koyu zeminde. */
  mint: '#43ff9c',
  /** Siyah — en derin mürekkep; gövde metni ve koyu temanın sayfası. */
  ink: '#00120f',
} as const;

/**
 * KURUMSAL YARDIMCI RENKLER — kılavuzun altı token'ından kalan üçü.
 *
 * <p>Kılavuz bunları açıkça marka dışında tutuyor: "Kâğıt, slate ve sis
 * yalnızca materyal zemini ve ikincil metin içindir; logoya girmez." Nötr
 * ekseni bu üç değer ANKORLAR; ara kademeler onlardan türetildi.
 */
export const CORPORATE = {
  /** Açık zemin. Beyaz yerine bu kullanılır; yeşile hafif kayar. */
  paper: '#eff4f1',
  /** Açık zeminde ikincil metin — kâğıt üzerinde 6,96:1. */
  slate: '#38594f',
  /** Koyu zeminde ikincil metin — koyu yeşil üzerinde 6,15:1. */
  mist: '#8fb3a7',
} as const;

// --- Nötr eksen -------------------------------------------------------
// Yeşile kayan gri. Önceki eksen serin gri-maviydi (H 207-220) ve kurumsal
// kâğıt/slate/sis üçlüsü H 144-162'de duruyor: iki eksen yan yana geldiğinde
// aynı gri iki farklı renk gibi okunuyordu. Uçlar ARTIK VERİLİ — `n100`
// kâğıdın, `n600` slate'in, `n900` siyahın kendisi; ara kademeler H 152-168
// bandında onlara bağlandı.
export const NEUTRAL = {
  n0: '#ffffff',
  n25: '#f9fbfa',
  n50: '#f4f8f7',
  /** Kurumsal kâğıt. */
  n100: CORPORATE.paper,
  n150: '#e8efec',
  n200: '#e3eae7',
  /** Kart/girdi kenarı — `n200` sayfadan ayrılmıyordu. */
  n250: '#d6e1dc',
  n300: '#c5d3cc',
  n400: '#9eb3aa',
  n500: '#749085',
  /** İkincil metnin okunur tabanı — kâğıt üzerinde 5,09:1. */
  n550: '#506d63',
  /** Kurumsal slate. */
  n600: CORPORATE.slate,
  n700: '#26403a',
  n800: '#0f2924',
  /** Ekseni marka mürekkebi kapatır: gövde metni, örtü ve gölge buradan. */
  n900: BRAND.ink,
} as const;

/**
 * BANT — üst bant, alt bilgi, tablo başlıkları, teknik bloklar ve BİRİNCİL
 * EYLEM.
 *
 * <p>⚠ Token adları `graphite`/`graphite-2`/`graphite-3` olarak KALDI: onlar
 * kütüphanenin açık sözleşmesi ve yeniden adlandırma büyük sürüm ister.
 * Değerleri artık grafit değil kurumsal koyu yeşil; ad rengi değil ROLÜ
 * anlatıyor.
 */
export const BAND = {
  base: BRAND.pine,
  two: '#004d40',
  three: '#0f574a',
  /*
   * ⚠ Koyu temada bant sayfadan daha KOYU DEĞİL, daha YEŞİL. Eski kural
   * "bant sayfadan bir tık koyu olmalı, yoksa yüzüyor görünür" idi ve sayfa
   * o zaman `#0e1419`ken uygulanabilirdi. Sayfa artık kurumsal siyahın
   * kendisi (`#00120f`) — altında bir kademe YOK. Bant bu yüzden kılavuzun
   * "koyu yüzeylerin tamamı" dediği marka zeminine çıkar: koyu yeşil sayfaya
   * karşı 1,36:1, yani ayrı bir yüzey olduğu görülüyor ve üstündeki logo
   * mint olduğunda imza eşleşmesi (10,76:1) doğrudan bandın içinde çıkıyor.
   */
  dark: BRAND.pine,
  darkTwo: '#002922',
  /*
   * ⚠ Koyu temada bandın ayırıcı çizgisi SAYFA KENARLIĞINDAN gelmez. Sayfa
   * kenarlığı (`SURFACE_DARK.border`) koyu bir yüzey merdiveni için
   * ayarlanmıştı ve bant marka zeminine çıkınca aynı ton bandın üzerinde
   * 1,10:1'e düştü — çizgi çizilmiş ama görünmüyordu. Bant kendi çizgisini
   * kendi zemininden türetir.
   */
  darkLine: '#0a4a3e',
  darkLineStrong: '#126554',
} as const;

/**
 * KOYU TEMA YÜZEYLERİ — merdiven marka mürekkebinden başlar.
 *
 * <p>Sayfa `BRAND.ink`in kendisidir; yüzeyler ondan yukarı doğru açılır ve
 * kurumsal yeşil ekseninde kalırlar (H 166-172). Metin katmanları kılavuzdan
 * doğrudan gelir: gövde kâğıt, ikincil sis.
 */
export const SURFACE_DARK = {
  page: BRAND.ink,
  surface: '#08211d',
  surfaceTwo: '#112d27',
  surfaceThree: '#1d3a33',
  inset: '#031614',
  border: '#193831',
  borderStrong: '#34564c',
  text: CORPORATE.paper,
  textTwo: CORPORATE.mist,
  /*
   * Sisin bir kademe koyusu. Kurumsal palette üçüncü bir koyu-zemin metni
   * yok; sis `surface-2` üzerinde 6,42:1 verirken bu ton 4,78:1'de duruyor —
   * yer tutucu ve üstü çizili fiyat için gereken kademe farkı kadar iniyor,
   * eşiği kırmadan.
   */
  textThree: '#799a8f',
  /** Pasif dolgu; koyu temada ortada bir nötr (metin AÇIK olmalı). */
  actionSoft: '#3f5a53',
} as const;

/**
 * BİRİNCİL EYLEMİN SINIRI — dolgunun kendisi değil, KENARI.
 *
 * <p>Birincil düğme iki temada da kurumsal koyu yeşil dolgu taşır: "açık yeşil
 * zeminli düğme yoktur" kuralı marka kararı. Bunun ölçülmüş bedeli koyu temada
 * düğmenin <strong>kaybolması</strong>: çam sayfaya karşı 1,36:1, koyu kartın
 * yüzeyine (`surface-2`) karşı <strong>1,04:1</strong> — dolgu orada
 * görünmüyor bile. Önceki sürüm bu yüzden dolguyu minte çeviriyordu.
 *
 * <p>Çözüm dolguyu değiştirmek değil ona bir sınır vermek: mint saç çizgisi
 * sayfaya karşı 14,65:1, koyu yüzeylerin en açığına (`surface-3`) karşı
 * 9,39:1 — WCAG 1.4.11'in grafik eşiğini (3:1) her zeminde geçer ve kılavuzun
 * imza eşleşmesini düğmenin kenarına taşır. Açık temada çam zaten kâğıda
 * karşı 13,16:1; orada sınır dolgunun KENDİSİDİR — görünmez ama geometriyi
 * (1 px'lik kenarlık) iki temada aynı tutar.
 */
export const ACTION_LINE = {
  light: BRAND.pine,
  dark: BRAND.mint,
} as const;

// --- Amber ------------------------------------------------------------
// EKRANDAKİ TEK DOYGUN TURUNCU: dönüşüm eylemi ("sepete ekle"). Başka
// hiçbir yerde dolgu olarak kullanılmaz. Marka yeşiliyle çarpışmaz çünkü
// işleri farklı — ve dönüşüm düğmesi yeşil olsaydı olumlu durum etiketiyle
// aynı aileye düşer, tek doygun rengin taşıdığı vurgu dağılırdı.
//
// ⚠ Koyu temada birincil eylem artık mint: aynı ekranda amber dönüşüm
// düğmesiyle iki doygun dolgu bulunabilir. Kural değişmedi — bir ekranda
// tek `PRIMARY` vardır ve dönüşüm noktası taşıyan ekranda birincil eylem
// çerçeveli forma döner.
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

/**
 * GEZİNME VE KEŞİF ROLÜ — bağlantı, etkin filtre, seçili satır, ilerleme,
 * odak halkası.
 *
 * <p>⚠ <strong>Token adları `blue*` olarak KALDI, değerleri MAVİ DEĞİL</strong>
 * — kurumsal yeşil eksenin teal ucu (H 182). Aynı karar `graphite*`te de
 * verildi: ad rengi değil ROLÜ anlatır ve CSS özel özelliği adı
 * (`--hanui-blue`) kütüphanenin açık sözleşmesi; yeniden adlandırma büyük
 * sürüm ister. Doğru ad `teal`/`nav` ve sonraki büyük sürümde yapılır.
 *
 * <p><strong>Ton açısı ölçülerek seçildi.</strong> Rol rengi olumlu durum
 * yeşiliyle (`ANCHOR.green`, H 154) aynı ekranda duruyor — "Stokta / aracına
 * uyar" ile "seçili / bağlantı" ayırt edilebilmeli. Dört aday çizilip
 * karşılaştırıldı: H 166 olumlu yeşilden **ayırt edilemiyor**, H 190 koyu
 * temada **mavi/camgöbeği** okunuyor (yani değişikliğin amacını bozuyor).
 * H 182 ikisinin arasında: kesin biçimde yeşil ailesi, olumlu yeşilden
 * belirgin biçimde ayrı.
 *
 * <p>⚠ <strong>Odak halkası MARKA RENGİ DEĞİL, rol rengidir.</strong> Eski
 * gerekçe ("yeşil halka yeşil dolgunun üzerinde görünmez") halkanın dolgunun
 * ÜZERİNE çizildiğini varsayıyordu; `focus-ring` varsayılan `outline-offset`
 * **+2px**, yani halka sayfanın üzerinde duruyor ve orada 4,63:1 veriyor.
 * Marka çamının (`#00322a`) kendisi hâlâ halka OLAMAZ — birincil düğmenin
 * dolgusuyla aynı ton, 2px'lik boşluk onu ayırmaya yetmez.
 */
export const BLUE = {
  base: '#1a7c7f',
  hover: '#106265',
  active: '#0a4b4d',
  /** Gövde metni içi bağlantı — beyaz üzerinde 6,00:1. */
  text: '#146e71',
  tint: '#e9f6f6',
  line: '#acd6d8',
  dark: '#51d2d6',
  darkHover: '#74e3e7',
  darkTint: '#113132',
  darkLine: '#285b5d',
} as const;

/**
 * ANKORLAR: kırmızı ve İŞLEV YEŞİLİ.
 *
 * <p>⚠ `green` marka renginin kendisi DEĞİL. Kurumsal mint açık zeminde
 * 1,18:1 veriyor: ne metin ne ikon olabilir. Olumlu durum ailesi bu yüzden
 * mintin ton açısında (H 154) ama açık zeminde ölçülebilir bir aydınlıkta
 * ayrı bir ankordan türetildi.
 *
 * <p>⚠ ANKORLAR METİN RENGİ DEĞİLDİR. `green` beyaz üzerinde 3,58:1 — gövde
 * metni olarak WCAG'i geçmez. Bu yüzden aile iki katmanlı: ankor İKON ve
 * DOLGU için, ondan türetilen koyu ton METİN için.
 */
export const ANCHOR = {
  red: '#dc2626',
  green: '#1d9a64',
} as const;

/** DURUM RENKLERİ. */
export const STATUS = {
  /* Yeşil ailesi `ANCHOR.green`den türetildi (L +57 / S −30, L +19 / S −8). */
  okBg: '#e6f4ed',
  /** 5,42:1 tint üzerinde — metin katmanı. */
  okFg: '#156f4e',
  okLine: '#a8dcc4',
  okBgDark: '#0b2d23',
  /** Ankorun bir kademe açığı; koyu tint üzerinde 7,63:1. */
  okFgDark: '#47d191',
  okLineDark: '#1e5742',

  warnBg: '#fdf0dd',
  warnFg: '#7a3e02',
  warnLine: '#ebc687',
  warnBgDark: '#2c2008',
  warnFgDark: '#f5c86b',
  warnLineDark: '#55401a',

  /* Nötr tint de yeşil eksene taşındı: `off` "tükendi" demek ve serin gri bir
     rozet, yanındaki yeşil/kâğıt yüzeylerde ayrı bir sistemden gelmiş gibi
     duruyordu. */
  offBg: '#f0f4f3',
  offFg: NEUTRAL.n700,
  offLine: '#cddad4',
  offBgDark: '#192e29',
  offFgDark: '#a2b9b0',
  offLineDark: '#2a423b',

  /*
   * Kırmızı ailesi `ANCHOR.red`den türetildi. Önceki `badFg` (#7f1d1d) bir
   * bordoydu: favori kalbi ve olumsuz rozet ekranda kirli/kahverengi
   * okunuyordu. Aynı ton açısında kalıp aydınlığı açmak rengi hem canlı hem
   * okunur yapıyor.
   */
  badBg: '#f8ebeb',
  /** 5,44:1 tint üzerinde. */
  badFg: '#bb1e1e',
  badLine: '#e6a6a6',
  badBgDark: '#310f0f',
  /** 6,03:1 koyu tint üzerinde. */
  badFgDark: '#e97575',
  badLineDark: '#621b1b',

  /*
   * Birincil / orijinal sınıflandırma tonu. Rol ailesinin (`BLUE`) bir kademe
   * KOYU METİNLİ varyantı ve bu ilişki bilinçli: eski palette `oemBg` ile
   * `blueTint` birebir aynı hex'ti (`#eaf1fe`), yani sistem OEM'i baştan
   * "rol tinti + daha koyu metin" diye tanımlamıştı. Rol teal'e döndüğünde
   * OEM de döner, yoksa PDP'de tek başına mavi kalan yüzey olurdu.
   */
  oemBg: '#edf7f8',
  oemFg: '#0d5659',
  oemLine: '#b5dcde',
  oemBgDark: '#0f2d2f',
  oemFgDark: '#7edadd',
  oemLineDark: '#296365',

  /*
   * İkincil / muadil sınıflandırma tonu — MENEKŞE, ve yeşile ÇEVRİLMEDİ.
   * `oem` ile `alt` bir çiftin iki yarısı ("Orijinal" ↔ "Muadil") ve ayrımı
   * taşıyan tek görsel sinyal ton açısı; ikisi de yeşil ailesine girseydi
   * sınıflandırma çökerdi. Menekşe mavi değil (H 250) ve olumlu/rol/uyarı
   * ailelerinin hiçbiriyle çakışmıyor.
   */
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
 * <p>⚠ Kurumsal mint bu eşiği açık zeminde GEÇMİYOR (`#43ff9c` kâğıt üzerinde
 * 1,18:1) ve `CopyField`in tiki, kopyalamanın başarısını söyleyen tek görsel
 * sinyal. İkon katmanı bu yüzden marka renginden değil `ANCHOR.green`den
 * türetildi; nöbetçi `scripts/check-contrast.mjs`.
 */
export const ACCENT = {
  red: '#dc2626',
  redDark: '#e35252',
  /** 3,22:1 kâğıt üzerinde — ailenin ikon katmanı, marka rengi değil. */
  green: ANCHOR.green,
  greenDark: '#43d08a',
  /** İKON hover'ı; metin taşıyan dolgunun hover'ı değil (yukarıdaki not). */
  greenHover: '#17814f',
  greenHoverDark: '#63e3a3',
  /** Yeşil dolgu üzerindeki metin. BEYAZ DEĞİL: `green` üzerinde 3,25:1. */
  onGreen: '#02180f',
} as const;

/** İNDİRİM / OLUMLU DEĞİŞİM ETİKETİ. */
export const SALE = {
  bg: STATUS.okBg,
  fg: STATUS.okFg,
  bgDark: STATUS.okBgDark,
  fgDark: STATUS.okFgDark,
} as const;

/** YILDIZ ALTINI. */
export const STAR = {
  /** 5,23:1 beyaz üzerinde. */
  light: '#9a5f04',
  /** 9,82:1 koyu zemin üzerinde. */
  dark: '#f0b429',
} as const;
