#!/usr/bin/env node
/**
 * GENEL API NOBETCISI — `build/index.d.ts` icindeki disa aktarim kumesini
 * `scripts/api-baseline.txt` ile karsilastirir.
 *
 * NEDEN VAR: `src/index.ts` bir cephedir; tip govdeleri `types/` altina
 * tasinabilir ve tuketici ayni adi ayni yerden almaya devam eder. Ama bir
 * tasima sirasinda bir ad DUSERSE hata BURADA gorunmez — `hanparca-frontend`
 * ve `hanparca-admin` bagimliligi TAM SURUME pinli (caret yok), yani kirilma
 * bir sonraki hanui yukseltmesinde, sebebi coktan unutulmusken ortaya cikar.
 *
 * ⚠ Grep deseni `export { … }` DEGIL. vite-plugin-dts her bildirimi tek tek
 * `export declare …` olarak yaziyor ve dosyanin sonunda yalnizca bos bir
 * `export { }` birakiyor; `export { … }` arayan bir olcum HER ZAMAN "1 ad"
 * bulur ve yesil kalir.
 *
 * Kullanim:
 *   node scripts/check-api.mjs            # dogrula
 *   node scripts/check-api.mjs --update   # taban cizgisini tazele (BILINCLI)
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DECLARATION_FILE = join(ROOT, 'build', 'index.d.ts');
const BASELINE_FILE = join(ROOT, 'scripts', 'api-baseline.txt');

const EXPORTED_NAME = /^export declare (?:const|type|function|class|interface|enum) ([A-Za-z0-9_$]+)/gm;

/** @returns {string[]} alfabetik, tekil disa aktarim adlari */
const readExportedNames = () => {
  if (!existsSync(DECLARATION_FILE)) {
    console.error(`✗ ${DECLARATION_FILE} yok. Once \`npm run build\` calistir.`);
    process.exit(1);
  }

  const source = readFileSync(DECLARATION_FILE, 'utf8');
  const names = [...source.matchAll(EXPORTED_NAME)].map(match => match[1]);

  if (names.length === 0) {
    console.error('✗ Hicbir disa aktarim bulunamadi — desen bayat olabilir, olcum yesil kalmamali.');
    process.exit(1);
  }

  return [...new Set(names)].sort();
};

const currentNames = readExportedNames();

if (process.argv.includes('--update')) {
  writeFileSync(BASELINE_FILE, `${currentNames.join('\n')}\n`, 'utf8');
  console.log(`✓ api-baseline.txt tazelendi: ${currentNames.length} ad.`);
  process.exit(0);
}

if (!existsSync(BASELINE_FILE)) {
  console.error('✗ Taban cizgisi yok. `node scripts/check-api.mjs --update` calistir.');
  process.exit(1);
}

const baselineNames = readFileSync(BASELINE_FILE, 'utf8').split('\n').filter(Boolean);

const removed = baselineNames.filter(name => !currentNames.includes(name));
const added = currentNames.filter(name => !baselineNames.includes(name));

if (removed.length === 0 && added.length === 0) {
  console.log(`✓ Genel API degismedi: ${currentNames.length} ad.`);
  process.exit(0);
}

console.error('\n✗ Genel API taban cizgisinden AYRISTI.\n');

for (const name of removed) console.error(`   − ${name}  (KIRICI: tuketici bu adi kaybeder)`);
for (const name of added) console.error(`   + ${name}  (yeni SURUM TAAHHUDU)`);

console.error(
  '\n   Disa verilen her ad bir sozlesmedir. Degisiklik BILINCLIYSE: ' +
    '`node scripts/check-api.mjs --update` ve gerekcesini CLAUDE.md\'ye yaz.\n',
);

process.exit(1);
