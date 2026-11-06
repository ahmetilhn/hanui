/**
 * `@handijit/ui/base.css` — token'lar (`:root`), kutu modeli sıfırlaması ve `@keyframes`.
 *
 * Bu modülün tek işi derlemeye bir CSS girişi vermektir: Vite `base.scss`i `build/base.css` olarak
 * çıkarır, bileşen modülleri onu kendi CSS'leriyle birlikte içe aktarır (`vite.modules.ts`).
 * ⚠ `index.ts` BUNU İÇE AKTARMAZ: cephe yalnızca yeniden dışa aktarım taşır ki Next'in
 * `optimizePackageImports` dönüşümü onu saf bir cephe sayıp bileşen dosyasına kısa devre yapabilsin.
 */
import './base.scss';
