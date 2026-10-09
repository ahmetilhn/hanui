import type { HanuiLinkComponent } from '@/types/link.type';
import { LIGHT_THEME, METRIC_TOKENS } from '@/theme/tokens';

/**
 * Sayı biçimlendiricileri: değere bağlı metinler dizeyle verilemez.
 * ⚠ `helpers/label.helper.ts` de aynı imzayı ELLE taşıyordu.
 */
export type Formatter<TArgs extends unknown[]> = (...args: TArgs) => string;

/**
 * Dışarıdan verilebilecek tema yapılandırması.
 * @example initHanui({ theme: { light: { link: '#0a58ca', 'ring-color': '#0d6efd' }, dark: {…
 */
export type HanuiThemeConfig = Partial<{
  light: HanuiThemeTokens;
  dark: HanuiThemeTokens;
  fonts: HanuiFonts;
  /**
   * Ölçü ezmeleri — yarıçap, boşluk, punto, süre.
   * @example initHanui({ theme: { metrics: { 'radius-md': '2px', 'radius-lg': '4px' } } });
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
 * Kullanıcının SEÇİMİ. `system` = açık bir seçim yok, işletim sistemi tercihi izlenir
 * (`prefers-color-scheme`).
 */
export type HanuiColorPreference = HanuiColorScheme | 'system';

/** ÇÖZÜLMÜŞ tema — ekranda gerçekten hangisi çizili. */
export type HanuiColorScheme = 'light' | 'dark';

/** Bir temanın TAM eşlemesi. */
export type HanuiResolvedTokens = Record<HanuiToken, string>;

/** Bir temanın token → değer eşlemesi. */
export type HanuiThemeTokens = Partial<Record<HanuiToken, string>>;

/** Bilgi yoğunluğu. `default` vitrin, `compact` operasyon paneli. */
export type HanuiDensity = 'default' | 'compact';

/** Ölçü ezmeleri. */
export type HanuiMetrics = Partial<Record<HanuiMetricToken, string>>;

/** Ölçü token adları — `METRIC_TOKENS`ten türetilir. */
export type HanuiMetricToken = keyof typeof METRIC_TOKENS;

/** Token adları — `LIGHT_THEME`den türetilir, elle listelenmez. */
export type HanuiToken = keyof typeof LIGHT_THEME;

export type HanuiContextValue = {
  /** Tüketicinin yönlendiricisi (`next/link`, `react-router`ın `Link`i…). */
  linkComponent?: HanuiLinkComponent;
  /** Uygulanan tema ezmeleri. */
  theme?: HanuiThemeConfig;
  /**
   * Arayüz metinleri.
   * ⚠ Referans bir dönem `theme/labels.ts`yi gösteriyordu; o dosya yalnızca tek satırlık bir başlık
   * yorumu taşıyordu (sıfır export, sıfır…
   */
  labels?: HanuiLabels;
};

export type HanuiLabels = Partial<{
  /** Kip pencere ve alt sayfanın kapatma düğmesi. `Modal`, `BottomSheet`. */
  close: string;
  /**
   * Bildirim yığınının bölge adı ("Bildirimler"). `ToastHub`.
   * ⚠ Yığın bir `role="region"` ve `aria-live` bölgesi; adsız bir bölge ekran okuyucuda yalnızca
   * "bölge" diye okunur.
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
    /** Kopyalama düğmesinin adı. */
    copy: Formatter<[value: string]>;
    copied: Formatter<[value: string]>;
    announcement: string;
  }>;

  /**
   * Dosya yukleme.
   * ⚠ `tooLarge` bir BICIMLENDIRICI: mesaj dosya adini ve siniri TASIMALI.
   */
  fileUpload: Partial<{
    tooLarge: Formatter<[name: string, max: string]>;
    /** Yukleme sirasindaki ekran okuyucu duyurusu. */
    uploading: Formatter<[name: string]>;
    /** Dosya secildiginde yapilan duyuru. */
    added: Formatter<[count: number]>;
  }>;

  /**
   * Sayisal gostergenin YON metni.
   * ⚠ Uc deger de SR-ONLY: ok isareti gorsel bir sinyal ve ekran okuyucuya hicbir sey soylemiyor.
   */
  stat: Partial<{
    increase: string;
    decrease: string;
    unchanged: string;
  }>;

  /** Adim gostergesinin DURUM metinleri — hepsi sr-only. */
  steps: Partial<{
    completed: string;
    current: string;
    upcoming: string;
  }>;

  /** Zaman cizelgesinin DURUM metinleri — hepsi sr-only. */
  timeline: Partial<{
    completed: string;
    current: string;
    failed: string;
  }>;

  /** Etiket girisi. `removed` bir bicimlendirici: hangi etiketin kalktigi. */
  tagInput: Partial<{
    added: Formatter<[value: string]>;
    removed: Formatter<[value: string]>;
  }>;

  rating: Partial<{
    /** Yıldızların ekran okuyucu karşılığı ("5 üzerinden 4,5 — 12 değerlendirme"). */
    srLabel: Formatter<[value: number, count: number | undefined]>;
    /** Puan girişinde yıldız sayısı ("4 yıldız"). */
    starCount: Formatter<[star: number]>;
    /** Beş puanın anlamı. */
    scale: Record<1 | 2 | 3 | 4 | 5, string>;
  }>;
}>;

export type InitHanuiOptions = Partial<{
  /** Tema ve ölçü ezmeleri. */
  theme: HanuiThemeConfig;
  /** Başlangıç şeması. */
  colorScheme: HanuiColorScheme;
  /** Bilgi yoğunluğu. */
  density: HanuiDensity;
}>;

export type HanuiThemeState = {
  /**
   * ÇÖZÜLMÜŞ tema — ekranda çizili olan. `preference` `system` iken bu alan işletim sisteminin o
   * anki tercihini taşır.
   */
  scheme: HanuiColorScheme;
  /** Kullanıcının SEÇİMİ. */
  preference: HanuiColorPreference;
  /** `'system'` verildiğinde AÇIK seçim silinir ve sistem tercihi izlenir. */
  setScheme: (preference: HanuiColorPreference) => void;
  /** Açık ↔ koyu. `system` iken ÇÖZÜLMÜŞ değerin tersine geçer. */
  toggle: () => void;
  /** Sunucu çıktısında ve hidrasyondan önceki ilk karede `false`. */
  isReady: boolean;
};
