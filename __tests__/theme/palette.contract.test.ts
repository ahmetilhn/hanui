import {
  ACCENT,
  ACTION_LINE,
  BAND,
  BRAND,
  CART,
  CATEGORY,
  CORPORATE,
  DANGER_SOLID,
  LINK,
  NEUTRAL,
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
  LINK,
  CATEGORY,
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

describe('dört ankor', () => {
  it('nötr eksen claude.com mürekkebine ve kâğıdına oturur', () => {
    expect(BRAND.ink).toBe('#141413');
    expect(NEUTRAL.n900).toBe('#141413');
    expect(NEUTRAL.n25).toBe('#faf9f5');
    expect(SURFACE_DARK.page).toBe(BRAND.ink);
    expect(SURFACE_DARK.text).toBe(NEUTRAL.n25);
  });

  it('pine ve mint birebir korunur', () => {
    expect(BRAND.pine).toBe('#00322a');
    expect(BRAND.mint).toBe('#43ff9c');
    expect(ACTION_LINE.light).toBe(BRAND.pine);
    expect(ACTION_LINE.dark).toBe(BRAND.mint);
    expect(BAND.base).toBe(BRAND.pine);
  });

  it('saf beyaz ve saf siyah palette YOKTUR', () => {
    expect(everyValue()).not.toContain('#ffffff');
    expect(everyValue()).not.toContain('#000000');
  });
});

describe('takma adlar merdivenden ayrılmaz', () => {
  /*
   * ⚠ 5.0'da kurumsal üçlü nötr merdivenden AYRILDI: arayüz nötrleri sıcak mürekkep, üçlü yalnızca
   * marka şeridinde (çam zemin) yaşıyor. Nötr merdivenle çakışırsa nötr eksen yeniden yeşillenmiş
   * demektir.
   */
  it('kurumsal üçlü nötr merdivende YOKTUR', () => {
    const neutrals = new Set<string>([...Object.values(NEUTRAL), ...Object.values(SURFACE_DARK)]);
    for (const value of Object.values(CORPORATE)) expect(neutrals.has(value)).toBe(false);
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
