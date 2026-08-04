import { expect, test } from '@playwright/test';

/**
 * KISITLI SÜTUNDA EZİLME — sessiz veri kaybının nöbetçisi.
 *
 * <h3>Ölçülen hata</h3>
 * Yüksekliği sınırlı, kendi içinde kayan bir sütuna (`display: flex;
 * flex-direction: column; max-height: …; overflow-y: auto` — vitrindeki filtre
 * kenar çubuğunun tam kural kümesi) konulan `Accordion`ların içeriği
 * <strong>kırpılıyordu</strong>: 400 px'lik bir çubukta toplam 518 px kayboldu
 * ve bir grup 170 px isterken 70 px çizildi.
 *
 * <p>Asıl kötü olan kırpma değil, kaydırma çubuğunun <strong>hiç
 * çıkmaması</strong>: çocuklar ezildiği için taşma oluşmuyor, taşma olmayınca
 * çubuk da yok. Kullanıcının kayıp içeriğe ulaşacak hiçbir yolu kalmıyor —
 * gördüğü şey "eksik liste" değil, "listenin tamamı bu" yanılgısı.
 *
 * <h3>Sebep</h3>
 * Esnek bir öğenin kendiliğinden gelen asgari ölçüsü (`min-height: auto`)
 * içeriği kadardır — ama yalnızca `overflow: visible` iken. Köşesini yuvarlamak
 * için `overflow: hidden` yazan her bileşen o korumayı kaybeder ve asgari ölçü
 * sıfıra düşer.
 *
 * <h3>Neden burada, jsdom'da değil</h3>
 * Ezilme bir YERLEŞİM sonucu; jsdom yerleşim yapmıyor. Ekran görüntüsü de
 * değil: ölçülen şey sayı — çizilen yükseklik ile içeriğin istediği yükseklik.
 */

/** Kenar çubuğunun içeriğe kesinlikle yetmeyeceği yükseklik. */
const CONSTRAINED_HEIGHT = 240;

test('kısıtlı sütunda akordeon EZİLMEZ, sütun kayar', async ({ page }) => {
  await page.goto('/?theme=light');
  await page.evaluate(() => document.fonts.ready);

  const result = await page.evaluate(height => {
    const source = document.querySelector('[data-gallery="Accordion"] details')?.closest('div');
    if (!source) return { error: 'galeride akordeon bulunamadı' };

    /*
     * Vitrindeki `FacetSidebar` kural kumesi. Galeriyi degistirmemek icin
     * kopyalar AYRI bir kutuya konur: olculen sey yine bilesenin GERCEK
     * derlenmis CSS'i.
     */
    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxHeight: `${height}px`,
      overflowY: 'auto',
      width: '280px',
      position: 'fixed',
      top: '0',
      left: '0',
    });

    for (let index = 0; index < 4; index += 1) sidebar.append(source.cloneNode(true));
    document.body.append(sidebar);

    const clipped = [...sidebar.children].map(node => {
      const drawn = Math.round(node.getBoundingClientRect().height);
      const wanted = Math.round(node.scrollHeight);
      return wanted - drawn;
    });

    return {
      /* Kirpilan toplam piksel; sifir olmali. */
      clipped: clipped.reduce((sum, value) => sum + Math.max(0, value), 0),
      /* Tasma ust kutuya gecmeli: kullanicinin kaydiracak bir seyi olsun. */
      scrolls: sidebar.scrollHeight > sidebar.clientHeight,
      children: sidebar.children.length,
    };
  }, CONSTRAINED_HEIGHT);

  expect(result.error).toBeUndefined();
  expect(result.children).toBe(4);
  expect(result.clipped).toBe(0);
  expect(result.scrolls).toBe(true);
});
