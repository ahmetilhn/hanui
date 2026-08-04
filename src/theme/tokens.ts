import {
  ACCENT,
  AMBER,
  BLUE,
  DANGER_SOLID,
  GRAPHITE,
  NEUTRAL,
  SALE,
  STAR,
  STATUS,
} from './palette';

/**
 * TEMA TOKEN'LARI.
 *
 * <p>Her anahtar bir CSS özel özelliğine karşılık gelir: `page` →
 * `--hanui-page`. Bileşenler SCSS tarafında yalnızca bu adları görür ve hepsi
 * bir `var(--hanui-…)` işaret eder.
 *
 * <h3>Neden CSS değişkeni, neden SCSS değişkeni değil</h3>
 * Açık/koyu tema ÇALIŞMA ZAMANINDA değişir; SCSS değişkeni derleme anında
 * sabitlenir ve tek derlemeden iki tema çıkmaz. Bunun iki sonucu var:
 *
 * <ol>
 *   <li>Renk üzerinde SCSS renk fonksiyonu ÇALIŞMAZ (`rgba($surface, .9)`
 *       derlenmez). Gereken her saydam değer hazır token olarak durur:
 *       `scrim`, `glass`, `ring`, `track`, `glow-1`…</li>
 *   <li>`prefers-color-scheme` ile renk SEÇİLMEZ. Tema `data-hanui-theme`
 *       üzerinden gelir; medya sorgusu kullanıcının açık seçimini görmez —
 *       yalnızca hiç seçim yapılmadığında yedek olarak devreye girer.</li>
 * </ol>
 */

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

const BLACK = '#000000';

/**
 * AÇIK TEMA — varsayılan.
 *
 * <p>Bilgi yoğunluğu yüksek ekranlarda açık zeminde okunurluk daha yüksek.
 */
export const LIGHT_THEME = {
  // --- Yüzey ---
  page: NEUTRAL.n50,
  surface: NEUTRAL.n0,
  'surface-2': NEUTRAL.n100,
  'surface-3': NEUTRAL.n150,
  'surface-inset': NEUTRAL.n25,

  // --- Kenarlık ---
  border: NEUTRAL.n250,
  'border-strong': NEUTRAL.n300,

  // --- Metin ---
  text: NEUTRAL.n900,
  'text-2': NEUTRAL.n600,
  'text-3': NEUTRAL.n550,

  // --- Grafit: bant, alt bilgi, tablo başlığı, teknik blok ---
  graphite: GRAPHITE.base,
  'graphite-2': GRAPHITE.two,
  'graphite-3': GRAPHITE.three,

  /*
   * BİRİNCİL EYLEM (dolgulu, nötr).
   *
   * `action` grafittir, amber DEĞİL. Amber tek bir dönüşüm noktasına
   * ayrılmıştır; her dolu düğmeyi amber yapmak o tekilliği yok eder ve
   * kullanıcı hangi turuncunun dönüşüm olduğunu bilemez.
   */
  action: GRAPHITE.base,
  'action-hover': GRAPHITE.two,
  'action-active': GRAPHITE.three,
  'on-action': NEUTRAL.n0,
  /** Pasif dolgu; saydamlık DEĞİL kendi rengi (bkz. Button `:disabled`). */
  'action-soft': NEUTRAL.n300,
  /**
   * PASİF DOLGU ÜZERİNDEKİ METİN.
   *
   * <p>ÖLÇÜLDÜ: pasif düğme `action-soft` zeminine `on-action` (beyaz) metin
   * yazıyordu — açık temada <strong>1,55:1</strong>, koyu temada 1,93:1.
   * Ekranda "Ara", "Sorgula", "Giriş yap" yıkanmış duruyor; etiketin ne
   * dediği okunmuyordu.
   *
   * <p>WCAG pasif denetimleri hem 1.4.3'te hem 1.4.11'de açıkça muaf tutuyor,
   * yani bu bir İHLAL DEĞİLDİ — ve tam da bu yüzden hiçbir katman uyarmadı:
   * çift denetçinin listesinde de yoktu. Ama okunamayan bir etiket, düğmenin
   * neyi engellediğini de söylemez; kullanıcı "neden pasif" sorusunu
   * soramadan önce "bu neydi" sorusunda takılıyor. Pasiflik dolgunun
   * geri çekilmesiyle bildirilir, metnin silinmesiyle değil — `opacity` ile
   * soluklaştırma yasağının (`A11Y.md`) aynı gerekçesi.
   *
   * <p>Ton merdivenin kendisinden: açıkta `n700` (6,52:1), koyuda `n300`
   * (5,76:1). Çift artık `check-contrast.mjs`te ve eşiği tutmayan bir tema
   * derlemeyi kırar.
   */
  'on-action-soft': NEUTRAL.n700,

  // --- Dönüşüm eylemi: ekrandaki tek doygun turuncu ---
  amber: AMBER.base,
  'amber-hover': AMBER.hover,
  'amber-active': AMBER.active,
  'amber-soft': AMBER.soft,
  'on-amber': AMBER.on,

  // --- Mavi: gezinme ve keşif ---
  blue: BLUE.base,
  'blue-hover': BLUE.hover,
  'blue-active': BLUE.active,
  'blue-text': BLUE.text,
  'blue-tint': BLUE.tint,
  'blue-line': BLUE.line,

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

  /*
   * ÜST BANT / ALT BİLGİ / KAHRAMAN BÖLÜMÜ.
   *
   * BU TOKEN'LAR TEMAYI İZLER: açık temada her yer açık, koyu temada her yer
   * koyu. Ayrı bir ad kümesi olarak kalıyorlar çünkü bantların KENDİ yüzey
   * merdiveni var: üst bant sayfadan bir kademe yükselir (beyaz zemin, gri
   * sayfa üzerinde), alt bilgi bir kademe çöker. Bunu `surface` ile yazmak
   * iki bandı sayfayla aynı tonda bırakıyordu.
   */
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

  // --- Gölge: nötr-serin (sıcak gölge serin gri zeminde kirli durur) ---
  'shadow-xs': `0 1px 2px ${alpha(NEUTRAL.n900, 0.05)}`,
  'shadow-sm': `0 1px 2px ${alpha(NEUTRAL.n900, 0.05)}, 0 1px 3px ${alpha(NEUTRAL.n900, 0.04)}`,
  'shadow-md': `0 2px 4px ${alpha(NEUTRAL.n900, 0.04)}, 0 6px 16px ${alpha(NEUTRAL.n900, 0.07)}`,
  'shadow-lg': `0 4px 8px ${alpha(NEUTRAL.n900, 0.05)}, 0 16px 32px ${alpha(NEUTRAL.n900, 0.1)}`,
  'shadow-xl': `0 8px 16px ${alpha(NEUTRAL.n900, 0.06)}, 0 28px 56px ${alpha(NEUTRAL.n900, 0.13)}`,
  /** Yapışkan alt bar; gölge YUKARI düşer. */
  'shadow-up': `0 -2px 4px ${alpha(NEUTRAL.n900, 0.03)}, 0 -8px 24px ${alpha(NEUTRAL.n900, 0.08)}`,

  /** Odak halkası MAVİ: odak bir gezinme olayıdır, bir dönüşüm değil. */
  ring: `0 0 0 3px ${alpha(BLUE.base, 0.28)}`,
  'ring-color': BLUE.base,
  'ring-danger': `0 0 0 3px ${alpha(DANGER_SOLID.base, 0.24)}`,
  'ring-ok': `0 0 0 4px ${alpha(STATUS.okFg, 0.16)}`,

  // --- Örtü ve cam: görsel üzerine binen yüzeyler ---
  /*
   * %55 DEĞİL. Örtü yalnızca kip pencerenin arkasını karartmıyor; `on-scrim`
   * onun üzerine yazılan metnin rengi ve o metin AÇIK temada bir sayfanın
   * üstüne düşüyor. Ölçüldü: %55 örtü `page` üzerine düzlendiğinde beyaz metin
   * 4,27:1 — gövde metni eşiğinin altında. %60'ta 5,01:1.
   *
   * <p>Koyu temada sorun yok (20:1); ölçüyü belirleyen açık tema.
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
  'glow-1': alpha(BLUE.base, 0.1),
  'glow-2': alpha(BLUE.base, 0.06),
  'glow-amber': alpha(AMBER.base, 0.09),
} as const;

/**
 * KOYU TEMA.
 *
 * <p>Yüzey merdiveni açık temanın AYNISI DEĞİL, tersi: koyu temada yükselen
 * yüzey AÇILIR (`surface` > `page`), çünkü ışık yukarıdan gelir. Aynı sırayı
 * korumak kartları sayfaya gömüyordu.
 */
export const DARK_THEME: Record<keyof typeof LIGHT_THEME, string> = {
  page: '#0e1116',
  surface: '#171b22',
  'surface-2': '#1f242d',
  'surface-3': '#262c36',
  'surface-inset': '#13171d',

  border: '#262c36',
  'border-strong': '#363e4a',

  text: '#e7eaee',
  'text-2': '#9aa4b2',
  /*
   * Açık temanın `text-3`ü ile AYNI HEX DEĞİL, olamaz da: koyu temada aynı ton
   * zeminden uzaklaşmaz, yaklaşır. Ölçüldü: `#6b7583` `surface` üzerinde
   * 3,69:1 ve `surface-2` üzerinde 3,25:1 — yer tutucu ve üstü çizili fiyat
   * koyu temada okunmuyordu. `#818b99` yüzeylerin en açığında (`surface-2`)
   * 4,51:1.
   */
  'text-3': '#818b99',

  graphite: GRAPHITE.ink,
  'graphite-2': GRAPHITE.inkTwo,
  'graphite-3': GRAPHITE.two,

  /*
   * Koyu temada grafit dolgu sayfadan ayırt edilemez. Birincil eylem AÇIK bir
   * nötr yüzeye döner — koyu zeminde en yüksek vurgu budur.
   */
  action: NEUTRAL.n150,
  'action-hover': NEUTRAL.n0,
  'action-active': NEUTRAL.n300,
  'on-action': NEUTRAL.n900,
  'action-soft': '#414a58',
  /* Koyu temada pasif dolgu ortada bir gri: metin AÇIK olmali (bkz. LIGHT). */
  'on-action-soft': NEUTRAL.n300,

  amber: AMBER.dark,
  'amber-hover': AMBER.darkHover,
  'amber-active': AMBER.base,
  'amber-soft': '#6d5316',
  'on-amber': AMBER.on,

  blue: BLUE.dark,
  'blue-hover': BLUE.darkHover,
  'blue-active': BLUE.base,
  'blue-text': BLUE.dark,
  'blue-tint': BLUE.darkTint,
  'blue-line': BLUE.darkLine,

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

  /* Koyu temada bant sayfadan daha KOYU: aynı tonda olsa yüzüyor görünüyor. */
  'nav-bg': GRAPHITE.ink,
  'nav-bg-2': GRAPHITE.inkTwo,
  'nav-fg': '#e7eaee',
  'nav-fg-2': '#9aa4b2',
  /* Açık temadaki kardeşiyle aynı gerekçe: bandın en soluk metni de metindir. */
  'nav-fg-3': '#818b99',
  'nav-line': '#262c36',
  'nav-line-strong': '#363e4a',
  'nav-hover': alpha(NEUTRAL.n0, 0.07),
  'footer-bg': GRAPHITE.ink,

  /*
   * Koyu zeminde gölge okunmaz; derinlik daha çok kenarlıkla kurulur.
   * Gölgeler yine de KORUNUR ama daha derin: modal ve açılır liste yüzeyin
   * üzerinde durmalı.
   */
  'shadow-xs': `0 1px 2px ${alpha(BLACK, 0.4)}`,
  'shadow-sm': `0 1px 2px ${alpha(BLACK, 0.4)}, 0 1px 3px ${alpha(BLACK, 0.3)}`,
  'shadow-md': `0 2px 4px ${alpha(BLACK, 0.35)}, 0 6px 16px ${alpha(BLACK, 0.45)}`,
  'shadow-lg': `0 4px 8px ${alpha(BLACK, 0.4)}, 0 16px 32px ${alpha(BLACK, 0.55)}`,
  'shadow-xl': `0 8px 16px ${alpha(BLACK, 0.45)}, 0 28px 56px ${alpha(BLACK, 0.6)}`,
  'shadow-up': `0 -2px 4px ${alpha(BLACK, 0.3)}, 0 -8px 24px ${alpha(BLACK, 0.45)}`,

  ring: `0 0 0 3px ${alpha(BLUE.dark, 0.36)}`,
  'ring-color': BLUE.dark,
  'ring-danger': `0 0 0 3px ${alpha(DANGER_SOLID.dark, 0.32)}`,
  'ring-ok': `0 0 0 4px ${alpha(STATUS.okFgDark, 0.2)}`,

  scrim: alpha(BLACK, 0.68),
  'scrim-soft': alpha(BLACK, 0.45),
  glass: alpha('#1f242d', 0.92),
  'glass-solid': '#1f242d',
  'on-scrim': NEUTRAL.n0,

  'skeleton-a': '#1f242d',
  'skeleton-b': '#262c36',
  track: alpha(NEUTRAL.n0, 0.14),

  'media-bg': '#1f242d',

  'glow-1': alpha(BLUE.base, 0.2),
  'glow-2': alpha(BLUE.dark, 0.1),
  'glow-amber': alpha(AMBER.dark, 0.12),
};

/**
 * ÖLÇÜ TOKEN'LARI — temadan bağımsız, çalışma zamanında EZİLEBİLİR.
 *
 * <h3>Neden bunlar da CSS değişkeni</h3>
 * Bir zamanlar yalnızca renkler ve font aileleri çalışma zamanında
 * eziliyordu; yarıçap, boşluk, süre ve tipografi ölçeği `_variables.scss`
 * içinde SCSS sabitiydi. Sonucu şuydu: bir tüketici markasının RENGİNİ
 * verebiliyor ama YUVARLAKLIĞINI veremiyordu. Oysa bir markayı tanınır kılan
 * şeylerin listesinde yarıçap renkten sonra gelir — keskin köşeli bir
 * kurumsal panelle yumuşak köşeli bir vitrin aynı pakete aynı derecede
 * ihtiyaç duyuyor. Aynısı bilgi yoğunluğu (boşluk ölçeği) ve hareket süresi
 * için de geçerli.
 *
 * <h3>SCSS sabiti olarak KALANLAR ve nedenleri</h3>
 * <ul>
 *   <li><b>Kırılma noktaları</b> — `@media (max-width: var(--x))` GEÇERSİZ
 *       CSS. Medya sorgusu özel özellik okuyamaz; taşınsalardı bütün duyarlı
 *       yerleşim sessizce çökerdi.</li>
 *   <li><b>Katman (`z-*`)</b> — bir yığılma bağlamı sayısı, marka kararı
 *       değil. Tüketicinin ezmesi gereken bir şey değil; ezerse kip pencere
 *       perdenin altında kalır.</li>
 *   <li><b>Ağırlık, harf aralığı, kapsayıcı genişlikleri, sayfa dolgusu</b> —
 *       ölçek değil tekil değer; ezme ihtiyacı ölçülmedi. Gerektiğinde
 *       buraya taşınabilir, ters yön (geri alma) kırıcıdır.</li>
 * </ul>
 *
 * <h3>Değerler DİZE, sayı değil</h3>
 * `'4px'` yazılıyor çünkü çıktı doğrudan bir CSS bildirimi. Sayı tutulup
 * birim sonradan eklenseydi, `radius-pill` (999px) ile `leading-normal`
 * (birimsiz 1.62) aynı listede duramazdı.
 */
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
  'space-0': '0',
  'space-1': '4px',
  'space-2': '8px',
  'space-3': '12px',
  'space-4': '16px',
  'space-5': '24px',
  'space-6': '32px',
  'space-7': '48px',
  'space-8': '64px',
  'space-9': '96px',

  /*
   * --- Tipografi ölçeği ---
   *
   * ÖLÇÜLDÜ: kaynak tasarım sisteminde `font-size` bildirimlerinin %67'si
   * 14 px ve altındaydı; arayüz varsayılanı, uzun süre ekrana bakan bir
   * kullanıcıda "okunabilir ama yorucu" eşiğinde duruyordu. Düzeltme TOKEN
   * düzeyinde yapıldı: yüzlerce dosyaya tek tek girmek yerine ölçek
   * kaydırıldı, böylece oranlar ve ritim korundu. Üst basamaklar (19/23/29…)
   * DEĞİŞMEDİ — onlar zaten yeterince büyüktü.
   */
  'font-size-2xs': '12px',
  'font-size-xs': '13px',
  'font-size-sm': '15px',
  'font-size-base': '16px',
  'font-size-body': '17px',
  'font-size-lg': '19px',
  'font-size-xl': '23px',
  'font-size-2xl': '29px',
  'font-size-3xl': '37px',
  'font-size-4xl': '47px',

  // Satır yüksekliği: başlıkta sıkı, metinde rahat. `leading-normal` 1.55'ten
  // 1.62'ye çıktı — 16 px gövde metninde en belirgin okunurluk kazanımı burada.
  'leading-none': '1',
  'leading-tight': '1.16',
  'leading-snug': '1.35',
  'leading-normal': '1.62',
  'leading-relaxed': '1.75',

  /*
   * --- İkon ölçüsü ---
   *
   * İkonlar ölçülerini `1em` ile kapsayıcının `font-size` değerinden alır ve
   * o değer METİN için seçilmiştir: 15 px'lik bir arayüz puntosunda simge,
   * 16'lık viewBox'ın ~14 px'lik çizim alanına düşüyor ve 40 px'lik bir
   * `IconButton`ın ortasında bir nokta gibi duruyordu. Ölçek Bootstrap
   * Icons'ın 16 px'lik ızgarasının katlarına yakın durur; ara değerler
   * (17, 19) simgeyi yarım piksele oturtup bulanıklaştırıyordu.
   */
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

  /*
   * DÖNGÜ SÜRELERİ — geçiş ölçeğinden AYRI.
   *
   * `duration-*` ölçeği bir A→B geçişini ölçüyor ve tavanı 320 ms: onun
   * üstünde tıklama ile sonuç arasında görünür bir gecikme oluşuyor. Sürekli
   * dönen bir gösterge ise bir geçiş değil; 320 ms'lik bir dönüş baş
   * döndürücü, 140 ms'lik bir parıltı da titreşim gibi okunuyor.
   *
   * <p>Ayrı isim vermenin sebebi ölçekten kaçmak değil, ölçeği KORUMAK:
   * `Spinner` `0.7s`, iskelet parıltısı `1.4s` yazıyordu ve ikisi de hiçbir
   * yerde açıklanmamış ham değerlerdi. Ham süre artık lint hatası
   * (`stylelint.config.mjs`); bu iki değerin de bir adı var.
   */
  'duration-spin': '700ms',
  'duration-shimmer': '1400ms',
} as const;

/**
 * YOĞUN (compact) KİP — `<html data-hanui-density="compact">`.
 *
 * <h3>Gerekçe ölçülü</h3>
 * Aynı bileşenleri iki uygulama kullanıyor: vitrin bir ekranda 8 satır,
 * operasyon paneli 80 satır gösteriyor. Vitrin için doğru olan ferahlık,
 * panelde kullanıcıyı kaydırmaya mahkûm ediyor; panel için doğru olan
 * sıkılık vitrinde ucuz duruyor. İkisini tek ölçekle karşılamanın yolu yok.
 *
 * <h3>Boşluk ve punto iner; yarıçap ve dokunma hedefi inmez</h3>
 * `space-0` ve `space-1` sabit kalır: 4 px'in altına inen bir boşluk kademesi
 * bir boşluk değil bir çizim hatası. Yarıçap da sabit kalır — yuvarlaklık
 * yoğunluğun değil markanın işi.
 *
 * <p>Punto ölçeğinin <strong>tamamı</strong> iner. Bir dönem yalnızca küçük
 * uç (`2xs`–`body`) iniyordu ve bu ölçülebilir bir hataydı: gövde 15 px'e
 * inerken başlıklar 29 px'te kaldığı için oran vitrindekinin çok üstüne
 * çıkıyor, panelde başlıklar ekranı yiyordu.
 *
 * <h3>DOKUNMA HEDEFİ KÜÇÜLMEZ</h3>
 * `tap-target` görünmez bir örtü çiziyor ve ölçüsü (44 px) buraya girmiyor:
 * yoğun kip bilgi yoğunluğunu artırmak içindir, dokunulabilirliği düşürmek
 * için değil (WCAG 2.5.8). Görsel kutu küçülür, hedef küçülmez.
 */
export const COMPACT_DENSITY = {
  'space-2': '6px',
  'space-3': '8px',
  'space-4': '12px',
  'space-5': '16px',
  'space-6': '24px',
  'space-7': '32px',

  'font-size-2xs': '11px',
  'font-size-xs': '12px',
  'font-size-sm': '13px',
  'font-size-base': '15px',
  'font-size-body': '16px',

  /*
   * ÖLÇEĞİN ÜST UCU DA İNER — eksik olan buydu.
   *
   * Önce yalnızca `2xs`–`body` iniyordu ve büyük uç (`lg`…`4xl`) varsayılan
   * kalıyordu. Sonuç ORANIN bozulması: panelde gövde 15 px'e inerken bir
   * `<h2>` 29 px'te kalıyor, yani başlık gövdenin neredeyse iki katı. Aynı
   * başlık vitrinde (gövde 17 px) 1,7 kat ve doğru duruyor — yoğun kipte
   * "başlıklar devasa" diye bildirildi ve ölçüldü.
   *
   * Yoğunluk bir ORAN kararıdır, bir kırpma listesi değil: ölçeğin yarısını
   * indirip yarısını bırakmak, iki ayrı ölçeği aynı ekranda karıştırmak
   * demek. Kademe küçük uçla aynı oranda (~%15) ve tipografik ölçek
   * korunuyor.
   */
  'font-size-lg': '18px',
  'font-size-xl': '21px',
  'font-size-2xl': '25px',
  'font-size-3xl': '31px',
  'font-size-4xl': '39px',

  'leading-normal': '1.5',
  'leading-relaxed': '1.6',
} as const satisfies Partial<Record<keyof typeof METRIC_TOKENS, string>>;

/** Token adları — `LIGHT_THEME`den türetilir, elle listelenmez. */
export type HanuiToken = keyof typeof LIGHT_THEME;

/** Ölçü token adları — `METRIC_TOKENS`ten türetilir. */
export type HanuiMetricToken = keyof typeof METRIC_TOKENS;

/** Ölçü ezmeleri. Kısmî verilebilir; verilmeyen her ölçü varsayılanında kalır. */
export type HanuiMetrics = Partial<Record<HanuiMetricToken, string>>;

/**
 * Bilgi yoğunluğu. `default` vitrin, `compact` operasyon paneli.
 *
 * <p>Seçim `<html data-hanui-density>` ile taşınır — tıpkı tema gibi, ve aynı
 * sebeple: bir ölçek kararı tek bir React ağacının değil BELGENİN kararıdır;
 * portal ile gövdeye taşınan kip pencere de aynı yoğunlukta olmalı.
 */
export type HanuiDensity = 'default' | 'compact';

/** Bir temanın token → değer eşlemesi. Kısmî verilebilir; eksikler varsayılandan gelir. */
export type HanuiThemeTokens = Partial<Record<HanuiToken, string>>;

/** Bir temanın TAM eşlemesi. */
export type HanuiResolvedTokens = Record<HanuiToken, string>;

/**
 * ÇÖZÜLMÜŞ tema — ekranda gerçekten hangisi çizili.
 *
 * <p>Burada `system` YOKTUR ve olamaz: `system` bir tercih, bir tema değil.
 * Çözüldüğünde ya açık ya koyu olur ve bileşenlerin gördüğü şey o. İkisini tek
 * tipte toplamak, `scheme === 'system'` yazan bir tüketiciye hangi renklerin
 * çizildiğini hâlâ söylemiyordu.
 */
export type HanuiColorScheme = 'light' | 'dark';

/**
 * Kullanıcının SEÇİMİ. `system` = açık bir seçim yok, işletim sistemi tercihi
 * izlenir (`prefers-color-scheme`).
 *
 * <h3>Bu tip neden sonradan eklendi</h3>
 * `HanuiColorScheme`in JSDoc'u "`system` işletim sistemi tercihini izler"
 * diyordu ama tipte `system` YOKTU — belge bir yeteneği anlatıyor, tip onu
 * yasaklıyordu. İki çözüm vardı: cümleyi silmek ya da yeteneği gerçekten
 * eklemek. İkincisi seçildi çünkü eksik olan gerçek bir davranıştı: üç
 * durumlu tema anahtarı (Açık / Koyu / Sistem) yaygın bir kalıp ve kütüphane
 * onu kuramıyordu — `system`e dönmenin yolu özniteliği ELLE silmekti ve bunu
 * tüketicinin bilmesi gerekiyordu.
 *
 * <p>Ekleme KIRICI DEĞİL: `scheme` hâlâ çözülmüş değeri döndürüyor, yalnızca
 * `preference` alanı ve `setScheme('system')` girişi eklendi.
 */
export type HanuiColorPreference = HanuiColorScheme | 'system';

/**
 * Yazı tipi ailesi sözleşmesi.
 *
 * <p>Üç rol ayrı: başlık (≥19 px), arayüz metni (11–16 px) ve teknik veri
 * (kod, seri numarası, tutar). KÜÇÜK ARAYÜZ METNİ BAŞLIK FONTUNU KULLANMAZ —
 * grotesk başlık yüzleri 12–14 px yarı-kalında sıkışıp okunurluğu düşürüyor
 * ve düğme etiketleri bir arayüzün en çok okunan kısa metinleri.
 *
 * <p>Kütüphane font YÜKLEMEZ: değerler `font-family` dizesi olarak geçer ve
 * yüklemeyi (next/font, @font-face, CDN) tüketici yapar. Bir UI paketinin
 * ağdan font çekmesi, tüketicinin ölçemediği bir istek demek.
 */
export type HanuiFonts = Partial<{
  heading: string;
  body: string;
  mono: string;
}>;

/** Kütüphanenin varsayılan font yığınları — hepsi sistem fontlarına iner. */
export const DEFAULT_FONTS: Required<HanuiFonts> = {
  heading: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
};

/**
 * Dışarıdan verilebilecek tema yapılandırması.
 *
 * @example
 * initHanui({
 *   theme: {
 *     light: { blue: '#0d6efd', 'blue-text': '#0a58ca' },
 *     dark:  { blue: '#6ea8fe' },
 *     fonts: { heading: 'Archivo, sans-serif' },
 *   },
 * });
 */
export type HanuiThemeConfig = Partial<{
  light: HanuiThemeTokens;
  dark: HanuiThemeTokens;
  fonts: HanuiFonts;
  /**
   * Ölçü ezmeleri — yarıçap, boşluk, punto, süre.
   *
   * <p>Renk gibi tema başına DEĞİL tek blokta: bir markanın yuvarlaklığı açık
   * temada 12 px, koyu temada 8 px olmaz. Ayrı verilebilseydi iki değerin
   * ayrışması kaçınılmazdı ve fark yalnızca tema değiştirildiğinde
   * görünürdü — yani neredeyse hiç.
   *
   * @example
   * initHanui({ theme: { metrics: { 'radius-md': '2px', 'radius-lg': '4px' } } });
   */
  metrics: HanuiMetrics;
}>;
