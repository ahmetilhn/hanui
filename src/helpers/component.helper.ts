/**
 * DevTools adı — modül düzeyinde YAN ETKİ bırakmadan.
 *
 * ⚠ `X.displayName = 'X'` KULLANILMAZ: modül düzeyindeki özellik ataması
 * bundler için yan etkidir ve hedefinin tüm bağımlılık zincirini ayakta tutar.
 * Ölçüldü: yalnızca `Badge` import eden uygulama 20,7 kB indiriyordu (paketin
 * tamamı 21,8 kB). Atama çağrıya dönüşünce `#__PURE__` işaretlenebiliyor →
 * `Badge` 2,71 kB. Nöbetçi `.size-limit.json`.
 *
 * @example
 * export default memo(named(Button, 'Button')) as typeof Button;
 */
export const named = <TComponent extends object>(
  component: TComponent,
  displayName: string,
): TComponent => Object.assign(component, { displayName });
