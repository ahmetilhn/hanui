#!/usr/bin/env node
/**
 * SCSS API — `src/styles` içindeki genel modülleri `build/scss/`e kopyalar (`exports["./scss"]`).
 *
 * Kopyalanan küme KAPALI bir listedir: `_index` yalnızca `variables` ve `mixins`i iletir, onlar da
 * yalnızca üretilmiş renk/ölçü dosyalarını kullanır. `base.scss` ve `_tokens.generated.scss`
 * (`:root` kuralları) BİLEREK dışarıda — tüketiciye `styles.css` zaten iniyor; ikinci kez
 * derlenselerdi her `@use` ile `:root` kuralları da tekrar basılırdı.
 * ⚠ Eksik bir dosya ya da listede olmayan bir `@use` derlemeyi açıkça düşürür.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SOURCE = join(ROOT, 'src', 'styles');
const TARGET = join(ROOT, 'build', 'scss');

const FILES = [
  '_index.scss',
  '_variables.scss',
  '_mixins.scss',
  '_colors.generated.scss',
  '_metrics.generated.scss',
];

const MODULES = new Set(FILES.map(file => file.replace(/^_|\.scss$/g, '')));

mkdirSync(TARGET, { recursive: true });

for (const file of FILES) {
  const source = join(SOURCE, file);
  if (!existsSync(source)) {
    console.error(`✗ SCSS API: ${file} yok.`);
    process.exit(1);
  }

  /* Kopyalanan bir modül kümenin DIŞINA uzanırsa tüketicide `@use` çözülmez — burada düşer. */
  for (const [, target] of readFileSync(source, 'utf8').matchAll(/^@(?:use|forward) '([^']+)'/gm))
    if (!target.startsWith('sass:') && !MODULES.has(target)) {
      console.error(`✗ SCSS API: ${file} → '${target}' kopyalanan kümenin dışında.`);
      process.exit(1);
    }

  copyFileSync(source, join(TARGET, file));
}

console.log(`✓ SCSS API: ${FILES.length} dosya → build/scss/`);
