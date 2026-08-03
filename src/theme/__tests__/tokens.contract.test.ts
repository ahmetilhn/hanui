import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { COMPACT_DENSITY, DARK_THEME, DEFAULT_FONTS, LIGHT_THEME, METRIC_TOKENS } from '../tokens';

/**
 * TOKEN SÖZLEŞMESİ — üç tarafın aynı listeyi görmesi.
 *
 * <p>Token listesi üç yerde yaşıyor: `LIGHT_THEME`, `DARK_THEME` ve üretilmiş
 * SCSS. Üçü ayrıştığında hiçbir katman uyarmıyor:
 *
 * <ul>
 *   <li>Bir token yalnızca açık temada varsa, koyu temada `var(--hanui-x)`
 *       tanımsız kalır. CSS bildirimi SESSİZCE düşer — kural geçersiz sayılır,
 *       öğe rengini kaybeder ve derleme yeşil döner.</li>
 *   <li>SCSS `npm run tokens` koşulmadan commit edilirse bileşenler var
 *       olmayan bir `$ad` okur (Sass hatası) ya da — daha kötüsü — ESKİ değeri
 *       okur ve tema ezmesi hiçbir yere ulaşmaz.</li>
 * </ul>
 *
 * <h3>Neden `npm run tokens` çağrılıp diff alınmıyor</h3>
 * Bir testin çalışma ağacına dosya YAZMASI kabul edilemez: test koşan
 * geliştiricinin `git status`u testin kendisi yüzünden kirlenir ve CI'da
 * "üretilmiş dosya değişti" hatası testin kendi yan etkisinden mi yoksa
 * kaynaktan mı geldiği anlaşılamaz. Test bunun yerine üretilmiş dosyayı OKUR
 * ve kaynakla karşılaştırır — aynı güvence, yan etkisiz.
 */

const STYLES = resolve(__dirname, '../../styles');

/*
 * Uretilmis dosyalar depoda DURMUYOR (`.gitignore`), derlemede uretiliyor.
 * Taze bir klonda `npm test` dogrudan kosuldugunda dosya yok ve ham `ENOENT`
 * bir yol adindan ibaret: "npm run tokens" cevabini kimse oradan okumuyor.
 */
const readGenerated = (file: string) => {
  try {
    return readFileSync(resolve(STYLES, file), 'utf8');
  } catch {
    throw new Error(
      `Üretilmiş dosya yok: src/styles/${file}. Önce \`npm run tokens\` çalıştırın ` +
        '(`npm run verify` ve `npm run build` bunu kendiliğinden yapar).',
    );
  }
};

/** `@mixin <ad> { … }` gövdesi — iki tema aynı dosyada, ayrı bloklarda. */
const mixinBody = (source: string, name: string): string => {
  const start = source.indexOf(`@mixin ${name} {`);
  if (start < 0) throw new Error(`\`@mixin ${name}\` üretilmiş dosyada yok`);

  const end = source.indexOf('\n}', start);
  return source.slice(start, end);
};

/** `--hanui-ad: değer;` satırlarını eşlemeye çevirir. */
const declarations = (block: string): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [, name, value] of block.matchAll(/^\s*--hanui-([\w-]+):\s*(.+);$/gm))
    result[name] = value.trim();

  return result;
};

describe('token sözleşmesi', () => {
  it('açık ve koyu tema BİREBİR aynı anahtarları taşır', () => {
    expect(Object.keys(DARK_THEME).sort()).toEqual(Object.keys(LIGHT_THEME).sort());
  });

  it('hiçbir token boş değer taşımaz', () => {
    for (const [theme, tokens] of [
      ['LIGHT', LIGHT_THEME],
      ['DARK', DARK_THEME],
    ] as const)
      for (const [name, value] of Object.entries(tokens))
        expect(`${theme}.${name} = ${String(value).trim()}`).not.toMatch(/= *$/);
  });
});

describe('üretilmiş SCSS kaynakla eşleşir', () => {
  const tokensFile = readGenerated('_tokens.generated.scss');
  const colorsFile = readGenerated('_colors.generated.scss');

  it.each([
    ['light', LIGHT_THEME],
    ['dark', DARK_THEME],
  ])('`@mixin %s` tam token eşlemesini yayar', (name, theme) => {
    expect(declarations(mixinBody(tokensFile, name))).toEqual(theme);
  });

  it('font rolleri varsayılanlarıyla yayılır', () => {
    const base = declarations(mixinBody(tokensFile, 'base-tokens'));

    for (const [role, stack] of Object.entries(DEFAULT_FONTS))
      expect(base[`font-${role}`]).toBe(stack);
  });

  it('`@mixin base-tokens` her ÖLÇÜ token`ını yayar', () => {
    const base = declarations(mixinBody(tokensFile, 'base-tokens'));

    for (const [name, value] of Object.entries(METRIC_TOKENS)) expect(base[name]).toBe(value);
  });

  /*
   * Yogun kip YALNIZCA ezdigi olculeri yazar; geri kalani `base-tokens`ten
   * miras alinir. Tam eslemeyi tekrar yazmak da calisirdi ama bir sonraki
   * surumde bir varsayilan degistiginde yogun kip ESKI degeri tasimaya devam
   * ederdi — ustelik yogunlukla hic ilgisi olmayan bir token icin.
   */
  it('yoğun kip yalnızca EZDİĞİ ölçüleri yazar ve hepsi gerçek bir token', () => {
    const start = tokensFile.indexOf("[data-hanui-density='compact'] {");
    const compact = declarations(tokensFile.slice(start, tokensFile.indexOf('\n}', start)));

    expect(compact).toEqual(COMPACT_DENSITY);

    for (const name of Object.keys(compact)) expect(METRIC_TOKENS).toHaveProperty(name);
  });

  it('ölçü sözleşmesi her token için `$ad: var(--hanui-ad)` satırı taşır', () => {
    const metricsFile = readGenerated('_metrics.generated.scss');
    const declared = [...metricsFile.matchAll(/^\$([\w-]+): var\(--hanui-([\w-]+)\);$/gm)];

    for (const [, name, variable] of declared) expect(name).toBe(variable);

    expect(declared.map(([, name]) => name).sort()).toEqual(Object.keys(METRIC_TOKENS).sort());
  });

  /*
   * Bir olcunun HEM renk hem olcu listesinde olmasi, iki uretilmis dosyanin
   * ayni SCSS degiskenini tanimlamasi demek: `@forward` catismasi verir ya da
   * — daha kotusu — biri digerini sessizce ezer.
   */
  it('renk ve ölçü ad kümeleri KESİŞMEZ', () => {
    const shared = Object.keys(METRIC_TOKENS).filter(name => name in LIGHT_THEME);

    expect(shared).toEqual([]);
  });

  /*
   * Bilesenlerin gordugu SCSS sozlesmesi. Bir token `tokens.ts`e eklenip
   * `npm run tokens` unutuldugunda bilesende `$yeni-token` yazan kural SASS
   * HATASI verir — ama ters yon SESSIZ: silinen bir token'in `$ad`i dosyada
   * kaldiginda kural `var(--hanui-silinmis)` olarak tarayiciya iner ve renk
   * duser. Iki yon de olculur.
   */
  it('her token için `$ad: var(--hanui-ad)` satırı var, fazlası yok', () => {
    const declared = [...colorsFile.matchAll(/^\$([\w-]+): var\(--hanui-([\w-]+)\);$/gm)];

    for (const [, name, variable] of declared) expect(name).toBe(variable);

    const colorNames = declared
      .map(([, name]) => name)
      .filter(name => !name.startsWith('font-') && !['header-offset'].includes(name));

    expect(colorNames.sort()).toEqual(Object.keys(LIGHT_THEME).sort());
  });
});
