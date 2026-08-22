/**
 * HAM PALET — kütüphanenin TEK hex kaynağı.
 *
 * <p>⚠ <strong>BU DOSYA ÜRETİLİYOR.</strong> Elle düzenleme;
 * `scripts/lib/palette-recipe.mjs` tarifini değiştirip `npm run tokens`
 * koştur. Nöbetçi: `__tests__/theme/palette.contract.test.ts`.
 *
 * <p>Değerler OKLCH'te türetilir: her renk bir aydınlık (`L`), bir ton açısı
 * (`H`) ve o çiftte sRGB'ye sığan en yüksek chroma'nın bir ORANI ile tanımlı.
 * Oranla çalışmak zorunlu — erişilebilir chroma tona ve aydınlığa göre üç
 * katına kadar değişiyor, mutlak bir sayı bir ailede doygun diğerinde gri
 * görünürdü.
 *
 * <p>⚠ <strong>YALNIZCA İKİ DEĞER SABİT.</strong> `pine` ve `mint` kurumsal
 * kimlik kılavuzu 2.0'ın ankorları; geri kalan her şey onlardan türer. Üreteç
 * çıktısını eski paletin hex listesine karşı denetler ve bir tanesi bile
 * hayatta kalırsa patlar.
 */
/**
 * MARKA — kılavuzun iki ankoru ve onlardan türeyen mürekkep.
 *
 * <p>⚠ <strong>`mint` AÇIK ZEMİNDE METİN OLAMAZ.</strong> Kâğıt üzerinde
 * 1,3:1 — neredeyse görünmez. Yalnızca KOYU zeminde metin/işaret, ya da
 * üzerine koyu metin gelen bir DOLGU olarak kullanılır.
 */
export const BRAND = {
  pine: '#00322a',
  mint: '#43ff9c',
  ink: '#010f0b',
} as const;

/**
 * KURUMSAL YARDIMCI RENKLER — nötr eksenin üç durağı.
 *
 * <p>Ayrı sabitler değil, merdivenin kendisine takma ad: kâğıt `n100`,
 * slate `n600`, sis koyu temanın ikincil metni. Bir dönem bağımsız hex'lerdi
 * ve merdivenden ayrı hareket edebiliyorlardı.
 */
export const CORPORATE = {
  paper: '#e9f7ed',
  slate: '#325a4d',
  mist: '#8abaa1',
} as const;

/**
 * NÖTR EKSEN — marka ekseninde, ton aydınlıkla birlikte kayar.
 *
 * <p>⚠ Açık uç bilinçle bugünkünden DOYGUN. Ölçüldü: eski `n25`…`n300`
 * %8-13 doygunluktaydı, yani fiilen gri; kurumsal kâğıdın yeşile kayması
 * yüzeylerde hiç görünmüyordu.
 *
 * <p>⚠ `n0` SAF BEYAZ KALIR — merdivenin tepesi bir renk değil referans nokta.
 */
export const NEUTRAL = {
  n0: '#fdfefd',
  n25: '#f7fcf8',
  n50: '#f1faf4',
  n100: '#e9f7ed',
  n150: '#dff3e5',
  n200: '#d5f0de',
  n250: '#c0eacf',
  n300: '#aaddbf',
  n400: '#8abaa1',
  n500: '#669480',
  n550: '#467060',
  n600: '#325a4d',
  n700: '#1d4238',
  n800: '#082a23',
  n900: '#010f0b',
} as const;

/**
 * BANT — üst bant, alt bilgi, tablo başlıkları ve BİRİNCİL EYLEM.
 *
 * <p>Tabanı `pine`ın kendisi; hover ve active ondan yukarı açılır.
 */
export const BAND = {
  base: '#00322a',
  two: '#154c3d',
  three: '#225f4d',
  dark: '#00322a',
  darkLine: '#143f34',
} as const;

/**
 * KOYU TEMA YÜZEYLERİ.
 *
 * <p>⚠ <strong>Koyu temada zemin SİYAHTIR, yeşil vurgudur.</strong> Merdiven
 * marka ekseninde durur ama doygunluk yukarı çıktıkça DÜŞER; hiçbir yüzey
 * yeşil bir yüzey olarak okunmaz. Bir dönem tersiydi ve sonuç "koyu tema"
 * değil "yeşil tema"ydı.
 */
export const SURFACE_DARK = {
  page: '#010f0b',
  surface: '#071915',
  surfaceTwo: '#112520',
  surfaceThree: '#1e332d',
  inset: '#000705',
  border: '#273c35',
  borderStrong: '#3d564d',
  text: '#e9f7ed',
  textTwo: '#8abaa1',
  textThree: '#79a790',
  actionSoft: '#40554d',
} as const;

/**
 * BİRİNCİL EYLEMİN SINIRI — dolgunun kendisi değil, KENARI.
 *
 * <p>Birincil düğme iki temada da kurumsal koyu yeşil dolgu taşır ve bunun
 * ölçülmüş bedeli koyu temada düğmenin kaybolmasıdır — çam, koyu yüzeyin
 * üzerinde neredeyse görünmüyor. Çözüm dolguyu değiştirmek değil ona bir
 * sınır vermek: mint saç çizgisi grafik eşiğini her zeminde geçer.
 */
export const ACTION_LINE = {
  light: '#00322a',
  dark: '#43ff9c',
} as const;

/**
 * DÖNÜŞÜM EYLEMİ ("sepete ekle") — ekrandaki tek PARLAK yeşil.
 *
 * <p>⚠ Birincil eylemden ayrımı TON AÇISI DEĞİL AYDINLIK: birincil koyu dolgu
 * + açık metin, dönüşüm açık dolgu + koyu metin. İki yeşil yan yana
 * durduğunda hangisinin "satın al" olduğunu ayıran şey budur.
 *
 * <p>⚠ Etkileşim yönü açık temada TERS: hover AÇILIR, active KOYULUR. Metin
 * koyu olduğu için koyulaşan her kademe metin eşiğini aşağı çeker.
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
 * GEZİNME VE KEŞİF ROLÜ — bağlantı, etkin filtre, seçili satır, ilerleme.
 *
 * <p>⚠ <strong>TON AÇISI GÖZLE ÖLÇÜLDÜ, HESAPLA DEĞİL.</strong> Marka
 * ekseninde yukarı çıkan her ton yüksek aydınlıkta camgöbeğine kayıyor:
 * H 174 ve <strong>H 168 hâlâ turkuaz</strong> okunuyor. H 162 dizideki ilk
 * kesin yeşil ve olumlu durum ailesinden (H 152) hâlâ ayrışıyor. Bu sayı
 * yukarı çekilmez.
 *
 * <p>⚠ Olumlu durumla karışma sorunu ton açısıyla değil BİÇİMLE çözülür:
 * durum her zaman tint zemin + kenarlık taşıyan bir rozet, rol ise dolgu ya
 * da bağlantı metni. Doygun dolgu "tıklanabilir" demektir, rozet değil.
 */
export const ROLE = {
  base: '#1f7b56',
  hover: '#176446',
  active: '#115037',
  text: '#17704e',
  tint: '#d5f6e4',
  line: '#93dfba',
  dark: '#60d4a1',
  darkHover: '#76eab5',
  darkTint: '#11251c',
  darkLine: '#2b4f3e',
} as const;

/** ANKORLAR — halka ve vurgu renklerinin türediği iki uç. */
export const ANCHOR = {
  red: '#de1b2c',
  green: '#18904c',
} as const;

/**
 * DURUM AİLELERİ — altı aile, tek disiplin.
 *
 * <p>Her ailenin altı üyesi aynı aydınlık/doygunluk şablonundan çıkar;
 * değişen tek şey ton açısı. Bir rozet ailesi bu yüzden "aynı ağırlıkta"
 * okunur — eski palette `okBg` %26, `warnBg` %85 doygunluktaydı ve iki
 * rozet yan yana geldiğinde biri ötekinden daha "önemli" görünüyordu.
 *
 * <p>⚠ TINT ZEMİNLERİ AYDINLIKTA BİR KADEME DÜŞÜK. L .95'te erişilebilir
 * chroma çok küçük, yani eski tint'ler soluk olmaya mecburdu; canlanmanın
 * tek yolu aydınlığı indirmekti.
 */
export const STATUS = {
  okBg: '#c2f6cf',
  okFg: '#166e3a',
  okLine: '#7eda99',
  okBgDark: '#112617',
  okFgDark: '#56d682',
  okLineDark: '#2c5137',
  warnBg: '#f6e4cf',
  warnFg: '#7c5212',
  warnLine: '#e8b97f',
  warnBgDark: '#2a1e0f',
  warnFgDark: '#eeaa4c',
  warnLineDark: '#594327',
  offBg: '#daece5',
  offFg: '#4d625a',
  offLine: '#afcabf',
  offBgDark: '#1c2220',
  offFgDark: '#a0c2b5',
  offLineDark: '#404b46',
  badBg: '#f6e2e0',
  badFg: '#a91922',
  badLine: '#e9b3ae',
  badBgDark: '#381311',
  badFgDark: '#f2a099',
  badLineDark: '#732f2c',
  oemBg: '#a7f7c8',
  oemFg: '#0c5d3a',
  oemLine: '#6ace97',
  oemBgDark: '#0b2115',
  oemFgDark: '#43c485',
  oemLineDark: '#224b35',
  altBg: '#e9e4f6',
  altFg: '#751dc8',
  altLine: '#c9bae7',
  altBgDark: '#271540',
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

/**
 * İKON VURGUSU — WCAG 1.4.11, 3:1 grafik eşiği.
 *
 * <p>Metin eşiği değil grafik eşiği geçerli olduğu için bu aile metin
 * katmanından bir kademe AÇIK durabilir; canlılığın açık temada en çok
 * göründüğü yer burası.
 */
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
  bgDark: '#112617',
  fgDark: '#56d682',
} as const;

/** YILDIZ ALTINI — puan sayısının yanında durduğu için metin eşiğini de geçer. */
export const STAR = {
  light: '#8c6a11',
  dark: '#ebb737',
} as const;
