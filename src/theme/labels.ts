/** ARAYÜZ METİNLERİ. */

/** Sayı biçimlendiricileri: değere bağlı metinler dizeyle verilemez. */
type Formatter<TArgs extends unknown[]> = (...args: TArgs) => string;

export type HanuiLabels = Partial<{
  /** Kip pencere ve alt sayfanın kapatma düğmesi. `Modal`, `BottomSheet`. */
  close: string;
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
