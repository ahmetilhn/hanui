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
 *
 * <p>⚠ Ailenin `dark` ucu artık YALNIZCA marka şeridini (`band-*`) besler.
 * Bir dönem koyu temanın üst bandını, alt bilgisini ve `graphite` merdivenini
 * de o besliyordu; koyu temanın zemini kurumsal siyaha çekilince o üç yol
 * `SURFACE_DARK`e geçti (bkz. oradaki not).
 */
export const BAND = {
  base: BRAND.pine,
  two: '#004d40',
  three: '#0f574a',
  /*
   * Marka şeridinin zemini — iki temada da koyu yeşil. Koyu temada sayfaya
   * karşı 1,36:1: ayrı bir yüzey olduğu görülüyor ve üstündeki logo mint
   * olduğunda imza eşleşmesi (10,76:1) doğrudan şeridin içinde çıkıyor.
   */
  dark: BRAND.pine,
  /*
   * ⚠ Şeridin ayırıcı çizgisi SAYFA KENARLIĞINDAN gelmez. Sayfa kenarlığı
   * (`SURFACE_DARK.border`) nötr bir yüzey merdiveni için ayarlı ve şeridin
   * koyu yeşili üzerinde 1,10:1'e düşüyor — çizgi çizilmiş ama görünmüyor.
   * Şerit kendi çizgisini kendi zemininden türetir.
   */
  darkLine: '#0a4a3e',
} as const;

/**
 * KOYU TEMA YÜZEYLERİ — merdivenin TAMAMI marka mürekkebinin karakterinde.
 *
 * <p>Sayfa `BRAND.ink`in kendisi; yüzeyler ondan yukarı açılır ama <b>siyah
 * kalır</b>: kurumsal yeşil ekseninde (H 161-171) dururlar, doygunlukları
 * yükseldikçe DÜŞER (S 33 → 23 → 17) ve hiçbiri yeşil bir yüzey olarak
 * okunmaz. Metin katmanları kılavuzdan doğrudan gelir: gövde kâğıt, ikincil
 * sis — yani marka yeşili koyu temada METİNDE ve VURGUDA yaşar, zeminde
 * değil.
 *
 * <p>⚠ Önceki merdiven bunun tersiydi: aynı aydınlıklarda S 61/45/33 ile
 * duruyordu ve üst bant, alt bilgi ve `graphite` bloğu doğrudan marka çamına
 * (`#00322a`) bağlıydı. Sonuç, koyu temanın <b>genel zemininin</b> siyah değil
 * koyu yeşil okunmasıydı; kılavuzun siyahı (`#00120f`) yalnızca sayfanın
 * kendisinde kalıyor, kart/panel/bant üçlüsü onu örtüyordu. Kural artık tek
 * cümle: <b>koyu temada zemin siyahtır, yeşil vurgudur.</b>
 */
export const SURFACE_DARK = {
  page: BRAND.ink,
  surface: '#0b1614',
  surfaceTwo: '#14201d',
  surfaceThree: '#1f2c28',
  /** Girinti sayfanın ALTINA iner; önceki değer sayfadan açıktı. */
  inset: '#000d0b',
  border: '#26332f',
  borderStrong: '#3d4f4a',
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

/**
 * DÖNÜŞÜM EYLEMİ ("sepete ekle") — ekrandaki tek PARLAK yeşil.
 *
 * <p>⚠ <strong>Token adları `amber*` olarak KALDI, değerleri TURUNCU DEĞİL.</strong>
 * Aynı karar `graphite*` ve `blue*`ta da verildi: ad rengi değil ROLÜ anlatır
 * ve CSS özel özelliği adı (`--hanui-amber`) kütüphanenin açık sözleşmesi;
 * yeniden adlandırma büyük sürüm ister. Doğru ad `cart` ve sonraki büyük
 * sürümde yapılır — bu yüzden ham palet sabiti şimdiden `CART`.
 *
 * <p>Dönüşüm düğmesi bir dönem turuncuydu ve gerekçe "hue ile ayrış" idi:
 * ekranın tek doygun turuncusu, marka yeşiliyle çarpışmasın diye. Kılavuzda
 * turuncu YOK; ayrım artık ton açısıyla değil <b>aydınlıkla</b> taşınıyor —
 * birincil eylem kurumsal çamın kendisi (koyu dolgu + beyaz metin), dönüşüm
 * ise ailenin en parlak yeşili (açık dolgu + siyah metin). İki düğme yan yana
 * konduğunda ayrım 4,58:1 (açık tema) ve 7,13:1 (koyu tema).
 *
 * <p>⚠ Bu <b>mint dolgu değildir.</b> "Açık yeşil zeminli düğme yok" kuralı
 * kılavuzun imza rengini (`BRAND.mint`, logonun rengi) koruyor; buradaki
 * zümrüt ondan üç kademe uzakta (H 154 / S 66 vs H 150 / S 100) ve olumlu
 * durum ailesinin ankoruyla (`ANCHOR.green`) aynı eksende.
 *
 * <p>⚠ Etkileşim yönü açık temada TERS: hover AÇILIR, active KOYULUR. Metin
 * siyah olduğu için koyulaşan her kademe metin eşiğini aşağı çeker; `active`
 * ailenin 4,5:1'i geçen en koyu tonu (5,14:1) ve altına inilemez.
 */
export const CART = {
  base: '#22a76d',
  hover: '#2ab97a',
  active: '#1d9a64',
  /** Pasif dönüşüm düğmesi; saydamlık değil KENDİ dolgusu. */
  soft: '#8fd3b6',
  dark: '#43d08a',
  darkHover: '#5ddf9c',
  darkActive: '#2fbb7a',
  darkSoft: '#43906f',
  /** Yeşil dolgu üzerinde metin — BEYAZ DEĞİL: `base` üzerinde 2,7:1. */
  on: '#02180f',
} as const;

/**
 * GEZİNME VE KEŞİF ROLÜ — bağlantı, etkin filtre, seçili satır, ilerleme,
 * odak halkası.
 *
 * <p>⚠ <strong>Token adları `blue*` olarak KALDI, değerleri MAVİ DEĞİL</strong>
 * — marka ekseninin ortası (H 162; mint H 150 ile çam H 170 arasında). Aynı
 * karar `graphite*`te de verildi: ad rengi değil ROLÜ anlatır ve CSS özel
 * özelliği adı (`--hanui-blue`) kütüphanenin açık sözleşmesi; yeniden
 * adlandırma büyük sürüm ister. Doğru ad `teal`/`nav` ve sonraki büyük
 * sürümde yapılır.
 *
 * <p>⚠ <strong>H 182 GERİ GELMEZ.</strong> Rol rengi bir sürüm boyunca orada
 * durdu ve ölçüm olarak temizdi; düşen şey markaydı. Doygun kademeleri —
 * özellikle koyu temanın `dark`ı — ekranda <strong>camgöbeği</strong>
 * okunuyordu ve göründükleri yer en kötüsüydü: sayfalamanın etkin sayfası,
 * seçili cip, etkin sekme ve odak halkası, yani kullanıcının en sık dokunduğu
 * yüzeyler kılavuzun tanımadığı bir renkle çiziliyordu.
 *
 * <p><strong>Ton açısı gözle ölçüldü, hesapla değil.</strong> Altı aday koyu
 * temanın dolgu aydınlığında (L 58 / S 62) yan yana çizilip karşılaştırıldı ve
 * sonuç ilk seferde tahmin edilenden DAHA AŞAĞIDA çıktı: H 174 ve
 * <strong>H 168 hâlâ turkuaz</strong> okunuyor — çamın kendi ton açısına
 * bağlamak yetmiyor, çünkü aynı hue yüksek aydınlıkta camgöbeğine kayıyor.
 * H 162 dizideki ilk kesin yeşil ve `ANCHOR.green`den (H 154) hâlâ ayrışıyor;
 * H 156 ve aşağısı olumlu durum yeşiliyle çakışıyor.
 *
 * <p><strong>Olumlu durumla karışma sorunu hue ile değil BİÇİMLE çözülür.</strong>
 * Eski gerekçe rolü yeşilden uzaklaştırmak için ton açısını marka ekseninin
 * dışına kaydırıyordu. Ayrımı taşıyan asıl sinyal zaten ton değil biçim: durum
 * her zaman tint zemin + kenarlık taşıyan bir rozet, rol ise dolgu ya da
 * bağlantı metni — doygun dolgu tıklanabilir demek, rozet değil.
 *
 * <p>⚠ <strong>Odak halkası MARKA RENGİ DEĞİL, rol rengidir.</strong> Eski
 * gerekçe ("yeşil halka yeşil dolgunun üzerinde görünmez") halkanın dolgunun
 * ÜZERİNE çizildiğini varsayıyordu; `focus-ring` varsayılan `outline-offset`
 * **+2px**, yani halka sayfanın üzerinde duruyor. Marka çamının (`#00322a`)
 * kendisi hâlâ halka OLAMAZ — birincil düğmenin dolgusuyla aynı ton, 2px'lik
 * boşluk onu ayırmaya yetmez; `base` çamın üç kademe açığı olduğu için ayrışır.
 */
export const BLUE = {
  base: '#1a7f61',
  hover: '#10654b',
  active: '#0a4d39',
  /** Gövde metni içi bağlantı — beyaz üzerinde 5,96:1. */
  text: '#147155',
  tint: '#e9f6f2',
  line: '#acd8cb',
  dark: '#51d6ae',
  darkHover: '#74e7c5',
  darkTint: '#113228',
  darkLine: '#285d4d',
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
   * "rol tinti + daha koyu metin" diye tanımlamıştı. Rol hangi ton açısına
   * giderse OEM de gider — yoksa PDP'de tek başına kalan bir yüzey olurdu ve
   * bu bir kez YAŞANDI: rol H 168'e taşınırken burası atlanmış olsaydı
   * "Orijinal" rozeti sayfadaki tek camgöbeği leke olarak kalırdı.
   */
  oemBg: '#edf8f5',
  oemFg: '#0d5942',
  oemLine: '#b5ded2',
  oemBgDark: '#0f2f25',
  oemFgDark: '#7eddc1',
  oemLineDark: '#296553',

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
  /** Yeşil dolgu üzerindeki metin — dönüşüm düğmesiyle TEK KAYNAK. */
  onGreen: CART.on,
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
