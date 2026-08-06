/**
 * Kırılma noktaları — `styles/_variables.scss` içindeki `$breakpoint-*` ile
 * <strong>aynı</strong> değerler.
 */
export const MOBILE_BREAKPOINT = 640;

export const TABLET_PORTRAIT_BREAKPOINT = 768;

export const TABLET_BREAKPOINT = 1024;

/** Kenar çubuğu ekranda olduğu için filtre paneli bu ölçünün üstünde gizlenir. */
export const ABOVE_TABLET_MEDIA_QUERY = `(min-width: ${TABLET_BREAKPOINT + 1}px)`;

/** Seçim kutusunun alt sayfası yalnızca bu ölçünün altında kullanılır. */
export const ABOVE_MOBILE_MEDIA_QUERY = `(min-width: ${MOBILE_BREAKPOINT + 1}px)`;
