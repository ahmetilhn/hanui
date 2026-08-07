import { ReactNode } from 'react';

export type ComboboxOption<T extends string = string> = {
  value: T;
  label: string;
  /** İkincil satır: kod, numara, ayırt edici bilgi. */
  description?: string;
  isDisabled?: boolean;
};

/** Bileşenin çizdiği metinler. */
export type ComboboxLabels = {
  /** Seçim yokken tetikleyicide ve alt sayfa başlığında görünen metin. */
  placeholder: string;
  /** Arama kutusunun yer tutucusu ve erişilebilir adı. */
  searchPlaceholder?: string;
  /** Liste boşken gösterilen metin. */
  emptyMessage?: string;
  /** Arama sürerken liste yerine gösterilen metin. */
  loadingMessage?: string;
  /** Seçimi kaldıran çarpının erişilebilir adı. */
  clearLabel?: string;
  /** Alt sayfanın kapatma düğmesinin erişilebilir adı. */
  closeLabel?: string;
};

export type ComboboxProps<T extends string> = {
  options: ComboboxOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  labels: ComboboxLabels;
  /**
   * Verilirse arama <strong>sunucuda</strong> yapılır: bileşen listeyi kendisi
   * filtrelemez, yazılanı 300 ms bekleyip buraya bildirir. Verilmezse
   * filtreleme yerelde ve aksan duyarsız yapılır.
   */
  onSearch?: (query: string) => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  /** Seçimi kaldıran çarpı düğmesi gösterilir. */
  isClearable?: boolean;
  /** Arama kutusu GİZLENİR. */
  isSearchHidden?: boolean;
  /** Tetikleyicinin solundaki ikon. */
  icon?: ReactNode;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};
