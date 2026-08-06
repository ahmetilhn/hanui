/** `src/theme/tokens.ts`i DERLEYİCİSİZ bir betikten okunabilir hâle getirir. */
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
