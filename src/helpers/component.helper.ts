/**
 * DevTools adı — modül düzeyinde YAN ETKİ bırakmadan.
 *
 * <h3>Neden `X.displayName = 'X'` değil</h3>
 * Bileşenler `memo(forwardRef(…))` ile dışa veriliyor ve bu sarmalayıcıların
 * kendi adı yok: React DevTools onları "Memo(ForwardRef)" diye gösterir. Ad bu
 * yüzden ayrıca yazılıyordu — ama modül düzeyindeki bir ÖZELLİK ATAMASI
 * bundler için yan etkili bir ifade ve silinemez.
 *
 * <p>ÖLÇÜLDÜ (`npm run size`): yalnızca `Badge` import eden bir uygulama
 * <strong>20,7 kB</strong> indiriyordu — paketin tamamı 21,8 kB. Yirmi tane
 * `displayName` ataması, zincirleriyle birlikte neredeyse her bileşeni ayakta
 * tutuyordu: `Button.displayName = 'Button'` satırı `Button`ı, o da
 * `Spinner`ı, `HanuiLink`i ve sınıf yardımcısını çağırıyor. Ağaç sallama
 * "çalışmıyor" değildi; sallanacak dal bırakılmamıştı.
 *
 * <p>Atama bir ÇAĞRIYA dönüştüğünde `/*#__PURE__*` işaretlenebiliyor ve
 * kullanılmayan bileşenle birlikte adı da düşüyor. Aynı ölçüm sonrasında:
 * `Badge` 2,71 kB, `Button` 3,34 kB.
 *
 * <p>Alternatif — iç fonksiyonu adlandırmak
 * (`forwardRef(function Button(…) {…})`) — de doğru olurdu ve yan etkisi yok;
 * yirmi bileşende ok fonksiyonunu gövdeli fonksiyona çevirmek, ölçülen kazancı
 * değiştirmeyen ama her dosyayı elleyen bir değişiklik olurdu. Tek satırlık bu
 * yardımcı aynı sonucu veriyor.
 *
 * @example
 * export default memo(named(Button, 'Button')) as typeof Button;
 */
export const named = <TComponent extends object>(
  component: TComponent,
  displayName: string,
): TComponent => Object.assign(component, { displayName });
