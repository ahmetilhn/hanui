import type { HanuiLinkComponent } from '@/types/link.type';
import { LIGHT_THEME, METRIC_TOKENS } from '@/theme/tokens';

/**
 * Sayı biçimlendiricileri: değere bağlı metinler dizeyle verilemez.
 *
 * ⚠ `helpers/label.helper.ts` de aynı imzayı ELLE taşıyordu. Tip
 * <strong>index.ts'ten dışa verilmiyor</strong>, yani birleştirmek genel API'yi
 * değiştirmez — ölçüldü (`npm run check:api`).
 */
export type Formatter<TArgs extends unknown[]> = (...args: TArgs) => string;

/**
 * Dışarıdan verilebilecek tema yapılandırması.
 *
 * @example
 * initHanui({
 * theme: {
 * light: { blue: '#0d6efd', 'blue-text': '#0a58ca' },
 * dark:  { blue: '#6ea8fe' },
 * fonts: { heading: 'Archivo, sans-serif' },
 * },
 * });
 */
export type HanuiThemeConfig = Partial<{
  light: HanuiThemeTokens;
  dark: HanuiThemeTokens;
  fonts: HanuiFonts;
  /**
   * Ölçü ezmeleri — yarıçap, boşluk, punto, süre.
   *
   * @example
   * initHanui({ theme: { metrics: { 'radius-md': '2px', 'radius-lg': '4px' } } });
   */
  metrics: HanuiMetrics;
}>;

/** Yazı tipi ailesi sözleşmesi. */
export type HanuiFonts = Partial<{
  heading: string;
  body: string;
  mono: string;
}>;

/**
 * Kullanıcının SEÇİMİ. `system` = açık bir seçim yok, işletim sistemi tercihi
 * izlenir (`prefers-color-scheme`).
 */
export type HanuiColorPreference = HanuiColorScheme | 'system';

/** ÇÖZÜLMÜŞ tema — ekranda gerçekten hangisi çizili. */
export type HanuiColorScheme = 'light' | 'dark';

/** Bir temanın TAM eşlemesi. */
export type HanuiResolvedTokens = Record<HanuiToken, string>;

/** Bir temanın token → değer eşlemesi. Kısmî verilebilir; eksikler varsayılandan gelir. */
export type HanuiThemeTokens = Partial<Record<HanuiToken, string>>;

/** Bilgi yoğunluğu. `default` vitrin, `compact` operasyon paneli. */
export type HanuiDensity = 'default' | 'compact';

/** Ölçü ezmeleri. Kısmî verilebilir; verilmeyen her ölçü varsayılanında kalır. */
export type HanuiMetrics = Partial<Record<HanuiMetricToken, string>>;

/** Ölçü token adları — `METRIC_TOKENS`ten türetilir. */
export type HanuiMetricToken = keyof typeof METRIC_TOKENS;

/** Token adları — `LIGHT_THEME`den türetilir, elle listelenmez. */
export type HanuiToken = keyof typeof LIGHT_THEME;

export type HanuiContextValue = {
  /** Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…). */
  linkComponent?: HanuiLinkComponent;
  /** Uygulanan tema ezmeleri. Salt okunur; değiştirmek için `HanuiProvider`. */
  theme?: HanuiThemeConfig;
  /**
   * Arayüz metinleri. Bir bileşen metnini prop olarak almadıysa buradan okur;
   * varsayılanlar `HanuiLabels` alanlarının yanında yazılı.
   *
   * ⚠ Referans bir dönem `theme/labels.ts`yi gösteriyordu; o dosya yalnızca
   * tek satırlık bir başlık yorumu taşıyordu (sıfır export, sıfır import) ve
   * kaldırıldı — belge var olmayan bir yeri işaret ediyordu.
   */
  labels?: HanuiLabels;
};

export type HanuiLabels = Partial<{
  /** Kip pencere ve alt sayfanın kapatma düğmesi. `Modal`, `BottomSheet`. */
  close: string;
  /**
   * Bildirim yığınının bölge adı ("Bildirimler"). `ToastHub`.
   *
   * ⚠ Yığın bir `role="region"` ve `aria-live` bölgesi; adsız bir bölge
   * ekran okuyucuda yalnızca "bölge" diye okunur.
   */
  notifications: string;
  /** Vazgeçme eylemi. `ConfirmDialog`, `PromptDialog`. */
  cancel: string;
  /** Kaydetme/gönderme eylemi. `PromptDialog`. */
  submit: string;
  /** Bekleme göstergesinin ekran okuyucu metni. `Spinner`. */
  loading: string;
  /** Zorunlu alanın yıldızının yanındaki okunabilir karşılık. `Field`. */
  required: string;
  /** Filtre şeridinin erişilebilir adı. `FilterBar`. */
  filters: string;
  /** Kırıntı yolunun gezinme bölgesi adı. `Breadcrumb`. */
  breadcrumb: string;
  /** Alfabe atlama şeridinin gezinme bölgesi adı. `DirectoryJump`. */
  directoryJump: string;
  /** Seçim yokken `Select` tetikleyicisinde görünen metin. */
  selectPlaceholder: string;

  /** Şifreyi görünür kılan düğmenin erişilebilir adı. `PasswordInput`. */
  passwordShow: string;
  /** Şifreyi gizleyen düğmenin erişilebilir adı. `PasswordInput`. */
  passwordHide: string;

  /** Baş harf büyütmesinde kullanılacak dil etiketi. `Avatar`. */
  locale: string;

  /** Para birimi simgesi ya da kodu. `Price`. */
  currency: string;

  combobox: Partial<{
    searchPlaceholder: string;
    emptyMessage: string;
    loadingMessage: string;
    clearLabel: string;
  }>;

  pagination: Partial<{
    /** Gezinme bölgesinin adı ("Sayfalar"). */
    label: string;
    previous: string;
    next: string;
  }>;

  quantity: Partial<{
    label: string;
    decrease: string;
    increase: string;
  }>;

  range: Partial<{
    /** Alt kulbun ad eki ("En az"). */
    min: string;
    /** Üst kulbun ad eki ("En çok"). */
    max: string;
  }>;

  dataTable: Partial<{
    empty: string;
    loading: string;
  }>;

  copyField: Partial<{
    /** Kopyalama düğmesinin adı. Değeri İÇERİR: bir listede on beş düğme var
     *  ve hepsi "Kopyala" diye okunduğunda hangisi olduğu belli olmuyordu. */
    copy: Formatter<[value: string]>;
    copied: Formatter<[value: string]>;
    announcement: string;
  }>;

  rating: Partial<{
    /** Yıldızların ekran okuyucu karşılığı ("5 üzerinden 4,5 — 12 değerlendirme"). */
    srLabel: Formatter<[value: number, count: number | undefined]>;
    /** Puan girişinde yıldız sayısı ("4 yıldız"). */
    starCount: Formatter<[star: number]>;
    /** Beş puanın anlamı. Dolu yıldız sayısı tek başına bir şekil sinyali;
     *  yanındaki metin renk körü kullanıcıya ikinci bir ipucu verir. */
    scale: Record<1 | 2 | 3 | 4 | 5, string>;
  }>;
}>;

export type InitHanuiOptions = Partial<{
  /** Tema ve ölçü ezmeleri. Yalnızca değiştirilen token'lar verilir. */
  theme: HanuiThemeConfig;
  /**
   * Başlangıç şeması. Verilmezse `<html data-hanui-theme>` neyse o kalır;
   * o da yoksa sistem tercihi (`prefers-color-scheme`) devreye girer.
   */
  colorScheme: HanuiColorScheme;
  /**
   * Bilgi yoğunluğu. Verilmezse `<html data-hanui-density>` neyse o kalır;
   * o da yoksa `default`.
   */
  density: HanuiDensity;
}>;

export type HanuiThemeState = {
  /**
   * ÇÖZÜLMÜŞ tema — ekranda çizili olan. `preference` `system` iken bu alan
   * işletim sisteminin o anki tercihini taşır.
   */
  scheme: HanuiColorScheme;
  /**
   * Kullanıcının SEÇİMİ. Üç durumlu bir tema anahtarı (Açık / Koyu / Sistem)
   * bunu okur; `scheme` okunsaydı "Sistem" seçiliyken düğme "Koyu"yu işaretli
   * gösterirdi.
   */
  preference: HanuiColorPreference;
  /** `'system'` verildiğinde AÇIK seçim silinir ve sistem tercihi izlenir. */
  setScheme: (preference: HanuiColorPreference) => void;
  /** Açık ↔ koyu. `system` iken ÇÖZÜLMÜŞ değerin tersine geçer. */
  toggle: () => void;
  /** Sunucu çıktısında ve hidrasyondan önceki ilk karede `false`. */
  isReady: boolean;
};
