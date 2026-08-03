/**
 * `src/theme/tokens.ts`i DERLEYİCİSİZ bir betikten okunabilir hâle getirir.
 *
 * <p>İki betik aynı kaynağa ihtiyaç duyuyor: `build-tokens.mjs` SCSS üretiyor,
 * `check-contrast.mjs` aynı değerleri ölçüyor. Yükleyici iki yere kopyalandığında
 * biri değişip diğeri eski kalır ve ölçüm ÜRETİLEN dosyadan başka bir şeyi
 * denetlemeye başlar — yani nöbetçi sessizce yanlış şeyi bekler.
 *
 * <p>Tipler DÜZENLİ İFADEYLE sökülmez: `as const`, jenerik tip argümanı ve
 * `Record<…>` bir düzenli ifadenin doğru ayrıştıramayacağı kadar iç içe.
 * TypeScript'in kendi `transpileModule`'ü kullanılıyor — paket zaten
 * `typescript`e bağımlı ve dönüşüm birebir doğru.
 *
 * <p>Palet kaynağı token kaynağının başına GÖMÜLÜR: `data:` URL modülleri
 * birbirini göreli yolla çözemez.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

/** Depo kökü — bu dosya `scripts/lib/` altında. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const transpile = file =>
  ts.transpileModule(readFileSync(resolve(ROOT, file), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      isolatedModules: false,
    },
  }).outputText;

/** `{ LIGHT_THEME, DARK_THEME, DEFAULT_FONTS }` — kaynağın kendisinden. */
export const loadTokens = () => {
  const palette = transpile('src/theme/palette.ts').replace(/^export /gm, '');
  const tokens = transpile('src/theme/tokens.ts').replace(
    /^import \{[\s\S]*?\} from ['"]\.\/palette['"];?$/m,
    palette,
  );

  return import(`data:text/javascript;base64,${Buffer.from(tokens).toString('base64')}`);
};
