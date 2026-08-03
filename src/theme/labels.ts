/**
 * ARAYÜZ METİNLERİ.
 *
 * <h3>Kütüphane hiçbir dilde metin UYDURMAZ</h3>
 * Bir bileşen kütüphanesi "Kapat" yazamaz: hangi dilde, hangi üslupta
 * ("Kapat" mı "Vazgeç" mi), hangi terimle (kayıt / ürün / talep) yazacağını
 * bilmez. Bu yüzden kullanıcıya görünen her metin dışarıdan gelir.
 *
 * <h3>Ama her ÇAĞRI YERİNDE değil, bir KEZ</h3>
 * Metinleri prop olarak zorunlu tutmak doğruydu ama yeri yanlıştı: aynı
 * "Kapat" dizesi yüz çağrı yerine dağılıyor ve biri değiştiğinde
 * doksan dokuzu eski kalıyordu. Uygulamanın dili tek; karar da tek yerde
 * verilmeli.
 *
 * <pre>
 * &lt;HanuiProvider labels={{ close: 'Kapat', cancel: 'Vazgeç' }}&gt;
 * </pre>
 *
 * <h3>Çözümleme sırası: prop → config → uyarı</h3>
 * Bir prop verilmişse o kazanır (bir pencerenin kapatma düğmesi bağlama göre
 * "Kapat" yerine "Daha sonra" olabilir). Verilmemişse config'ten okunur.
 * İkisi de yoksa öğe erişilebilir adını kaybeder — bu bir hata ve geliştirme
 * kipinde konsola yazılır (bkz. `helpers/label.helper`).
 *
 * <h3>Neden derleme zamanında zorlanamıyor</h3>
 * TypeScript, çalışma zamanında bir sağlayıcının olup olmadığını göremez.
 * Prop'ları zorunlu tutmak config'i işe yaramaz kılardı; isteğe bağlı yapmak
 * derleme güvencesini bırakıp geliştirme uyarısına indiriyor. Bilinçli bir
 * takas: metnin tek yerde durması, derleyicinin bunu görmesinden daha değerli.
 *
 * <h3>Neye metin VERİLMEZ</h3>
 * Öğeye ÖZGÜ olan hiçbir şey buraya girmez: `Modal.title`,
 * `ConfirmDialog.confirmLabel` ("Sil" — eylemi tekrarlamak zorunda),
 * `IconButton.label`, `Select.label`, `TableCheckbox.label`. Bunlar prop
 * olarak zorunlu kalır çünkü her çağrı yerinde farklıdır.
 */

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

  /**
   * Baş harf büyütmesinde kullanılacak dil etiketi. `Avatar`.
   *
   * <p>Türkçede ZORUNLU: `toUpperCase()` "i" harfini "I" yapıyor ve
   * "İlhan"ın baş harfi "I" çıkıyor.
   */
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
