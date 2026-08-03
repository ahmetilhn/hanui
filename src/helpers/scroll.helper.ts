/**
 * Kaydırma yardımcıları.
 *
 * <h3>Neden `scrollIntoView` doğrudan çağrılmıyor</h3>
 * jsdom `Element.prototype.scrollIntoView`u UYGULAMIYOR ve çağrı bir
 * `TypeError` atıyor. Bedeli kütüphanenin kendi testleri değil, TÜKETİCİNİN
 * testleri: `Tabs` çizen bir bileşen ölçüldüğünde `E.scrollIntoView is not a
 * function` ile düşüyordu — kırılan yer kullanıcının kodu, sebebi ise
 * kütüphanenin ekranı kaydırma girişimi. Test ortamı için tüketiciye
 * `Element.prototype.scrollIntoView = jest.fn()` yazdırmak, kütüphanenin
 * eksiğini her tüketicinin kurulum dosyasına dağıtmak olurdu.
 *
 * <p>Aynı koruma gerçek tarayıcılarda da işe yarıyor: `scrollIntoView` eski
 * WebView'larda seçenek nesnesini yok sayıyor ama VAR; burada ölçülen şey
 * fonksiyonun varlığı, davranışı değil.
 */

/** Öğeyi görünür alana kaydırır; ortam desteklemiyorsa sessizce geçer. */
export const scrollIntoViewIfPossible = (
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions,
): void => {
  if (typeof element?.scrollIntoView === 'function') element.scrollIntoView(options);
};
