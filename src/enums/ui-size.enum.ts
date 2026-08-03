/**
 * Ölçü basamakları.
 *
 * <p>`MEDIUM` ve `LARGE` dokunma hedefi kuralına uyar (WCAG 2.5.8, ≥44 px).
 * `SMALL` yoğun şeritler içindir ve orada görsel kutu küçülür ama tıklanabilir
 * alan `tap-target` ile korunur.
 */
enum UISize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export default UISize;
