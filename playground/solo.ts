/**
 * Izgarada çizilmeyen, `?solo=<ad>` ile tek başına açılan bileşenler.
 *
 * <p>`showModal()` sayfanın geri kalanını inert bırakıyor; dört pencere aynı
 * anda açıldığında galeri tek bir gri perdeye dönüyor.
 *
 * <h3>Neden AYRI bir dosya</h3>
 * Görsel regresyon koşusu (`e2e/visual.spec.ts`) bu listeye ihtiyaç duyuyor ama
 * `scenarios.tsx`i import edemez: o dosya kütüphane kaynağını, o da SCSS'i
 * çekiyor ve Playwright'ın Node tarafındaki dönüştürücüsü SCSS'i ayrıştıramıyor
 * ("No tests found" — hata mesajı da neden olduğunu söylemiyor). Liste burada,
 * hiçbir şey import etmeyen bir dosyada duruyor.
 */
export const SOLO_ONLY = [
  'Modal',
  'BottomSheet',
  'ConfirmDialog',
  'PromptDialog',
  'Drawer',
  'CommandPalette',
] as const;
