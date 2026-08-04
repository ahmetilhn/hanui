import { expect, test } from '@playwright/test';

import { SOLO_ONLY } from '../playground/solo';

/**
 * GERÇEK CİHAZ SÖZLEŞMELERİ — iOS (WebKit) ve Android (Chromium).
 *
 * <h3>Neden ayrı bir dosya, neden ayrı projeler</h3>
 * Bu depodaki hataların en pahalıları masaüstünde <em>görünmüyordu</em>: alt
 * sayfanın gövdesi çöküyor, dip şerit klavyenin altında kalıyor, filtre
 * seçenekleri maskenin altında siliniyordu. Üçü de yerleşim/boyama hatası ve
 * üçü de yalnızca gerçek bir yerleşim motorunda ölçülebiliyor — jsdom bunların
 * hiçbirini hesaplamıyor.
 *
 * <p>Motor de tek başına yetmiyor: iOS'ta çalışan HER tarayıcı WebKit ve
 * Chromium'da doğru olan orada doğru olmak zorunda değil. Bu yüzden koşu iki
 * motorda birden: `ios` (WebKit / iPhone 14) ve `android` (Chromium / Pixel 7).
 *
 * <h3>Ekran görüntüsü DEĞİL sayı</h3>
 * Buradaki hiçbir nöbetçi piksel karşılaştırmıyor. Anlık görüntü platforma
 * bağlı (yazı tipi tarama, alt piksel yumuşatma) ve referansları macOS'te
 * üretilmiş bir küme Linux CI'da 232 dosyanın 232'sinde birden kırmızı döner.
 * Ölçülen şeyler platformdan bağımsız: yükseklik, taşma, odak, hesaplanmış
 * CSS değeri. Yani `--update-snapshots` gerektirmiyorlar ve CI'da koşabilirler.
 *
 * <h3>Emülasyonun DÜRÜST sınırı</h3>
 * Playwright'ın WebKit'i iOS Safari DEĞİL: masaüstü için derlenmiş bir WebKit,
 * üstüne cihaz ölçüsü ve dokunma emülasyonu binmiş hâli. Yakalayamadıkları:
 * çentik payı (`env(safe-area-inset-*)` burada hep 0), ekran klavyesinin
 * görünen alanı daraltması, adres çubuğunun kaybolup gelmesi, momentum
 * kaydırma. Bu dosya o sınırın <strong>üstünde</strong> kalan her şeyi ölçer;
 * altında kalanlar için CSS'te taban değerler var (bkz. `bottom-sheet` mixin'i)
 * ve onların nöbetçisi `e2e/bottom-sheet.spec.ts`.
 */

/** Kesirli yerleşimde `scrollWidth` bir piksel oynayabiliyor. */
const ROUNDING = 1;

const openGallery = async (page: import('@playwright/test').Page, query = '') => {
  await page.goto(`/?theme=light${query}`);
  await page.evaluate(() => document.fonts.ready);
};

/*
 * YATAY TASMA. Dar ekranda en sik ve en gorunur kirilma: tek bir genis oge
 * (tablo, uzun etiket, sabit genislikli kutu) SAYFANIN tamamini yatayda
 * kaydirilabilir yapiyor ve kullanici dikey kaydirmaya calisirken sayfa yana
 * kayiyor. Kutuphane bunu kendi icinde cozmek zorunda: genis icerik KENDI
 * kutusunda kaymali (`overflow-x: auto`), sayfada degil.
 */
test('sayfa yatayda KAYMAZ', async ({ page }) => {
  await openGallery(page);

  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
  });

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + ROUNDING);
});

/*
 * KENAR SOLMASI YALNIZCA GIZLI ICERIK VARKEN.
 *
 * Solma bir IDDIA: "bu ucun otesinde devam eden icerik var". Iki uca da
 * kosulsuz yazildiginda iddia yanlis oluyor ve bedeli dogrudan GORUNURLUK —
 * okunacak satirin ustune saydamlik biniyor. Olculmustu: tasmayan bir kutuda
 * (33 px) paylar 16+16 oldugu icin tam opak alan 1 px kaliyor, yani icerik
 * neredeyse tamamen siliniyordu ve tasma olmadigi icin kaydirarak da
 * kurtarilamiyordu.
 *
 * Bu bir BOYAMA hatasi: jsdom maske hesaplamiyor, ekran goruntusu ise
 * platforma bagli. Aradaki dogru olcu hesaplanmis CSS degeri.
 */
test.describe('kaydırma kutusu — kenar solması', () => {
  /*
   * OLCULEN SEY OZNITELIK DEGIL, MASKENIN KENDISI.
   *
   * `data-fade-*` yalnizca bir ARAC; solmayi cizen sey maskenin uc paylari.
   * Oznitelige bakan bir nobetci, paylarin kosulsuz boyandigi ESKI surumde de
   * yesil doner (orada oznitelik zaten yok) — yani hatanin kendisini
   * gormezdi. Hesaplanmis ozel ozellik iki motorda da cozuluyor ve eski
   * surumde BOS ("") donuyor, yani bu nobetci gercekten kirmizidan geliyor.
   *
   * Sayi (`16px`) yazilmaz: pay `$space-4` token'indan geliyor ve token
   * degisince nobetci yanlis yerden kirilirdi. Sorulan tek sey "sifir mi".
   */
  const fadeStops = (node: HTMLElement) => {
    const style = getComputedStyle(node);
    return {
      start: style.getPropertyValue('--hanui-scroll-fade-start').trim(),
      end: style.getPropertyValue('--hanui-scroll-fade-end').trim(),
    };
  };

  test('taşma YOKSA hiçbir uç solmaz', async ({ page }) => {
    await openGallery(page);

    /* Sigan kutu bir "bolge" degil (rol yalnizca kaydirilabilirken yaziliyor),
       bu yuzden metninden bulunuyor. */
    const short = page.getByText('Tek satır').locator('..');

    expect(await short.evaluate(fadeStops)).toEqual({ start: '0px', end: '0px' });
  });

  test('en üstteyken YALNIZCA alt uç, sona inince YALNIZCA üst uç solar', async ({ page }) => {
    await openGallery(page);

    const long = page.getByRole('region', { name: 'Solmalı uzun metin' });
    await expect(long).toBeVisible();

    /* En ustte: yukarida gizli icerik YOK — ust uc solarsa ilk satiri
       gosterecek bir sey olmadigi halde siler. */
    const atTop = await long.evaluate(fadeStops);
    expect(atTop.start).toBe('0px');
    expect(atTop.end).not.toBe('0px');
    expect(atTop.end).not.toBe('');

    await long.evaluate(node => node.scrollTo({ top: node.scrollHeight }));

    const atBottom = await expect
      .poll(async () => (await long.evaluate(fadeStops)).end)
      .toBe('0px')
      .then(() => long.evaluate(fadeStops));

    expect(atBottom.start).not.toBe('0px');
    expect(atBottom.start).not.toBe('');
  });
});

/*
 * KIPSEL YUZEYLER GORUNEN ALANIN ICINDE. Dar ekranda `Modal` ve `Drawer` de
 * dipten gelen bir yuzeye donusuyor; dip serit — yani EYLEM DUGMELERI —
 * ekranin disinda kalirsa pencere kapatilamaz hale geliyor.
 */
for (const name of SOLO_ONLY)
  test(`${name} görünen alanın içinde durur`, async ({ page }) => {
    /*
     * GIRIS CANLANDIRMASI KAPALI, bir zamanlayiciyla YARISILMAZ.
     *
     * Yuzeyler dipten/kenardan kayarak geliyor (`surface-transition`) ve
     * `getBoundingClientRect` donusumu de sayiyor: canlandirma surerken
     * olculen kutu, gorunum alaninin tam bir yukseklik disinda cikiyor.
     * `prefers-reduced-motion` kutuphanenin KENDI yolunu kullanir
     * (`transition: none`) ve oge son durumuna aninda oturur — hem belirli
     * hem de o yolun kendisi bir kez daha kosulmus olur.
     */
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, `&solo=${name}`);

    const surface = page.locator('dialog[open]').first();
    await expect(surface).toBeVisible();

    const fits = await surface.evaluate(node => {
      const box = node.getBoundingClientRect();
      return {
        top: Math.round(box.top),
        bottom: Math.round(box.bottom),
        right: Math.round(box.right),
        left: Math.round(box.left),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });

    expect(fits.top).toBeGreaterThanOrEqual(-ROUNDING);
    expect(fits.left).toBeGreaterThanOrEqual(-ROUNDING);
    expect(fits.bottom).toBeLessThanOrEqual(fits.viewportHeight + ROUNDING);
    expect(fits.right).toBeLessThanOrEqual(fits.viewportWidth + ROUNDING);
  });

/*
 * ACILISTA EKRAN KLAVYESI ACILMAZ.
 *
 * `showModal()` odagi panelin ILK odaklanabilir ogesine tasiyor. O oge bir
 * metin alani oldugunda telefonda klavye kullanici istemeden aciliyor: panelin
 * yarisi kapaniyor ve kullanici once klavyeyi kapatmak zorunda kaliyor
 * (`helpers/focus.helper` → `preventAutoKeyboard`). Masaustunde bu hicbir sey
 * yapmiyor, yani nobetci ancak dar ekranda anlamli.
 */
test('alt sayfa açılışında odak metin alanına düşmez', async ({ page }) => {
  await openGallery(page);

  await page.getByRole('combobox', { name: 'Sıralama' }).first().click();
  await expect(page.locator('dialog[open]')).toBeVisible();

  const focused = await page.evaluate(() => {
    const node = document.activeElement;
    return { tag: node?.tagName.toLowerCase() ?? '', type: node?.getAttribute('type') ?? '' };
  });

  expect(['input', 'textarea']).not.toContain(focused.tag);
});
