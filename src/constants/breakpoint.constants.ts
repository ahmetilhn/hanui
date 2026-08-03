/**
 * Kırılma noktaları — `styles/_variables.scss` içindeki `$breakpoint-*` ile
 * <strong>aynı</strong> değerler.
 *
 * <p>Kararı normalde CSS verir; bu sabitler yalnızca <em>JavaScript'in de
 * bilmek zorunda olduğu</em> tek durum için var: kipsel bir panel
 * (`<dialog>`) açıkken pencere büyütüldüğünde. `showModal()` sayfanın geri
 * kalanını inert bırakır ve bu, panelin çizilip çizilmediğine değil kipsel
 * olmasına bağlıdır — CSS onu gizlese bile sayfa tıklanamaz kalır. Panel bu
 * yüzden kırılma noktası aşıldığında JavaScript ile kapatılır.
 *
 * <p>Değerler iki yerde durduğu için ayrışabilir. Ayrışırlarsa panel yanlış
 * genişlikte kapanır; CSS tarafı her zaman kazanır, buradaki değer ona
 * uydurulur.
 */
export const MOBILE_BREAKPOINT = 640;

export const TABLET_PORTRAIT_BREAKPOINT = 768;

export const TABLET_BREAKPOINT = 1024;

/** Kenar çubuğu ekranda olduğu için filtre paneli bu ölçünün üstünde gizlenir. */
export const ABOVE_TABLET_MEDIA_QUERY = `(min-width: ${TABLET_BREAKPOINT + 1}px)`;

/** Seçim kutusunun alt sayfası yalnızca bu ölçünün altında kullanılır. */
export const ABOVE_MOBILE_MEDIA_QUERY = `(min-width: ${MOBILE_BREAKPOINT + 1}px)`;
