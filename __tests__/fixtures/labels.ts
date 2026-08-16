import type * as hanui from '../../src';

/**
 * Ortak metin sozlesmesi FIXTURE'i.
 *
 * ⚠ `resolveLabel` HICBIR VARSAYILAN TASIMAZ: metin verilmediginde bos donup
 * gelistirme uyarisi basiyor. Yani bir test sozlugu eksik verdiginde bilesen
 * "adsiz" cizilir ve axe taramasi `aria-label=""` ile duser — bu tam olarak
 * i18n turunda olculdu.
 *
 * ⚠ Sozluk `a11y.test.tsx` icinde SATIR ICIYDI; ikinci bir test paketi
 * gerektiginde kopyalanmasi gerekirdi ve iki kopya ayrisirsa hangi testin
 * hangi sozlukle kostugu gorunmez olurdu.
 */
export const LABELS: hanui.HanuiLabels = {
  close: 'Kapat',
  cancel: 'Vazgeç',
  submit: 'Kaydet',
  loading: 'Yükleniyor',
  required: 'zorunlu',
  filters: 'Filtreler',
  breadcrumb: 'Yol',
  directoryJump: 'Harfe atla',
  selectPlaceholder: 'Seçin',
  passwordShow: 'Şifreyi göster',
  passwordHide: 'Şifreyi gizle',
  locale: 'tr-TR',
  currency: 'TL',
  combobox: {
    searchPlaceholder: 'Ara',
    emptyMessage: 'Sonuç yok',
    loadingMessage: 'Aranıyor',
    clearLabel: 'Temizle',
  },
  pagination: { label: 'Sayfalar', previous: 'Önceki', next: 'Sonraki' },
  quantity: { label: 'Adet', decrease: 'Azalt', increase: 'Artır' },
  range: { min: 'En az', max: 'En çok' },
  dataTable: { empty: 'Kayıt yok', loading: 'Yükleniyor' },
  fileUpload: {
    tooLarge: (name, max) => `${name} çok büyük (en fazla ${max}).`,
    uploading: name => `${name} yükleniyor`,
    added: count => `${count} dosya eklendi`,
  },
  stat: { increase: 'artış', decrease: 'azalış', unchanged: 'değişim yok' },
  steps: { completed: 'tamamlandı', current: 'şu anki adım', upcoming: 'sıradaki' },
  timeline: { completed: 'tamamlandı', current: 'şu an', failed: 'başarısız' },
  tagInput: {
    added: value => `${value} eklendi`,
    removed: value => `${value} kaldırıldı`,
  },
  copyField: {
    copy: value => `${value} kopyala`,
    copied: value => `${value} kopyalandı`,
    announcement: 'Kopyalandı',
  },
  rating: {
    srLabel: (value, count) => `5 üzerinden ${value}${count ? ` — ${count} oy` : ''}`,
    starCount: star => `${star} yıldız`,
    scale: { 1: 'Çok kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Çok iyi' },
  },
};
