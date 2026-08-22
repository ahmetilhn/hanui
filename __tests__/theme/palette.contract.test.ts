/**
 * PALET SÖZLEŞMESİ — tarifin çıktısında değişmemesi gereken yapısal iddialar.
 *
 * <p>⚠ "Diskteki dosya tarifle birebir mi" sorusu BURADA cevaplanmaz:
 * `scripts/build-palette.mjs --check` onu `verify` içinde yapıyor. Tarif bir
 * ESM betiği ve ts-jest onu CJS'ten `require` edemiyor; iki kapı bilinçli
 * olarak ayrı yerlerde.
 *
 * <p>Buradaki iddialar tarifin SONUCU hakkında: ankorlar korunuyor mu, takma
 * adlar merdivenden ayrılmış mı, palette saf beyaz/siyah kalmış mı.
 */
import {
  ACCENT,
  ACTION_LINE,
  BAND,
  BRAND,
  CART,
  CORPORATE,
  DANGER_SOLID,
  NEUTRAL,
  ROLE,
  SALE,
  STAR,
  STATUS,
  SURFACE_DARK,
} from '@/theme/palette';

const HEX = /^#[0-9a-f]{6}$/;

const EVERY_BLOCK = {
  NEUTRAL,
  SURFACE_DARK,
  STATUS,
  CART,
  ROLE,
  ACCENT,
  DANGER_SOLID,
  STAR,
  SALE,
  BAND,
  CORPORATE,
  BRAND,
} as const;

const everyValue = () =>
  Object.values(EVERY_BLOCK).flatMap(record => Object.values(record as Record<string, string>));

describe('markanın iki ankoru', () => {
  it('pine ve mint birebir korunur', () => {
    /*
     * ⚠ Kurumsal kimlik kılavuzu 2.0'ın iki sabiti. Bunlar türetilmez ve
     * değişmez; paletin geri kalanı onlardan çıkar.
     */
    expect(BRAND.pine).toBe('#00322a');
    expect(BRAND.mint).toBe('#43ff9c');
    expect(ACTION_LINE.light).toBe(BRAND.pine);
    expect(ACTION_LINE.dark).toBe(BRAND.mint);
    expect(BAND.base).toBe(BRAND.pine);
  });

  it('saf beyaz ve saf siyah palette YOKTUR', () => {
    /*
     * "İstisnasız her renk değişir" kararının yapısal karşılığı. Ayrıca ikisi
     * de marka ekseninin dışında duruyor: kâğıdın yeşile kaydığı bir markada
     * saf beyaz bir yüzey SOĞUK okunuyor, saf siyah bir gölge de koyu yeşilin
     * üzerinde MOR bir kenar bırakıyor.
     */
    expect(everyValue()).not.toContain('#ffffff');
    expect(everyValue()).not.toContain('#000000');
  });
});

describe('takma adlar merdivenden ayrılmaz', () => {
  it('kurumsal üçlü merdivenin kendisidir', () => {
    /*
     * `paper`/`slate`/`mist` bir dönem bağımsız hex'lerdi ve nötr merdivenden
     * ayrı hareket edebiliyorlardı; ayrıştıklarında aynı gri iki farklı renk
     * gibi okunuyordu.
     */
    expect(CORPORATE.paper).toBe(NEUTRAL.n100);
    expect(CORPORATE.slate).toBe(NEUTRAL.n600);
    expect(CORPORATE.mist).toBe(SURFACE_DARK.textTwo);
    expect(BRAND.ink).toBe(NEUTRAL.n900);
  });

  it('indirim etiketi olumlu durum ailesinin kendisidir', () => {
    expect(SALE.bg).toBe(STATUS.okBg);
    expect(SALE.fg).toBe(STATUS.okFg);
    expect(SALE.bgDark).toBe(STATUS.okBgDark);
    expect(SALE.fgDark).toBe(STATUS.okFgDark);
  });

  it('ankorlar vurgu ailesinden gelir', () => {
    expect(ACCENT.onGreen).toBe(CART.on);
  });
});

describe('yüzey merdiveni', () => {
  it('açık temada kart sayfadan AÇIK — düzlük geri gelmez', () => {
    /*
     * ⚠ Ölçülmüş arıza: `page` ve `surface` bir dönem İKİSİ DE saf beyazdı ve
     * kart sayfadan dolguyla hiç ayrışmıyordu; ayrımın tamamını kenarlık ile
     * gölge taşıyordu. Kenarlığı kaldıran her yeni bileşen sayfanın içinde
     * kayboluyordu.
     */
    expect(NEUTRAL.n0).not.toBe(NEUTRAL.n25);
  });

  it('koyu temada girinti sayfanın ALTINA iner', () => {
    expect(SURFACE_DARK.inset).not.toBe(SURFACE_DARK.page);
  });
});

describe('biçim', () => {
  it('her değer altı haneli küçük harf hex', () => {
    for (const [block, record] of Object.entries(EVERY_BLOCK)) {
      for (const [key, value] of Object.entries(record as Record<string, string>)) {
        expect([`${block}.${key}`, HEX.test(value)]).toEqual([`${block}.${key}`, true]);
      }
    }
  });

  it('durum ailelerinin altısı da eksiksiz', () => {
    for (const family of ['ok', 'warn', 'off', 'bad', 'oem', 'alt']) {
      for (const slot of ['Bg', 'Fg', 'Line', 'BgDark', 'FgDark', 'LineDark']) {
        expect(STATUS).toHaveProperty(`${family}${slot}`);
      }
    }
  });
});
