#!/usr/bin/env node
/**
 * GENEL API NOBETCISI — her girisin disa aktarim kumesini kendi taban cizgisiyle karsilastirir.
 *
 * - `@ahmetilhn/hanui`      → `build/index.d.ts`             ↔ `scripts/api-baseline.txt`
 * - `@ahmetilhn/hanui/chat` → `build/types/chat/index.d.ts`  ↔ `scripts/api-baseline.chat.txt`
 * - `@ahmetilhn/hanui/charts` → `build/types/charts/index.d.ts` ↔ `scripts/api-baseline.charts.txt`
 *
 * ⚠ Grep deseni `export { … }` DEGIL (ana giris icin). vite-plugin-dts her bildirimi tek tek
 * `export declare …` olarak yaziyor ve dosyanin sonunda yalnizca BOS bir `export { }` birakiyor.
 * Alt girislerin tipleri ise dosya basina (`tsc`) ve cephe dosyasi `export { … } from` satirlari
 * tasiyor — ana giris ve alt girisler iki desen.
 * ⚠ Cephe `export type { … } from` da yazabilir (grafik girisi): ilk desen yalnizca `export { … }`
 * okuyordu ve tip adlarini SESSIZCE atliyordu — taban cizgisi 22 yerine 17 ad sayiyordu.
 * ⚠ Sifir eslesmede acikca duser: olcemedigi seyi yesil gecmez.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const DECLARED_NAME = /^export declare (?:const|type|function|class|interface|enum) ([A-Za-z0-9_$]+)/gm;
const REEXPORT_BLOCK = /^export (?:type )?\{([^}]*)\} from /gm;

/** `export { default as X, type Y, Z } from` → `X`, `Y`, `Z`. */
const reexportedNames = source =>
  [...source.matchAll(REEXPORT_BLOCK)].flatMap(match =>
    match[1]
      .split(',')
      .map(part => part.trim().replace(/^type\s+/, ''))
      .filter(Boolean)
      .map(part => (part.includes(' as ') ? part.split(' as ')[1].trim() : part)),
  );

const ENTRIES = [
  {
    name: '@ahmetilhn/hanui',
    declarationFile: join(ROOT, 'build', 'index.d.ts'),
    baselineFile: join(ROOT, 'scripts', 'api-baseline.txt'),
    read: source => [...source.matchAll(DECLARED_NAME)].map(match => match[1]),
  },
  {
    name: '@ahmetilhn/hanui/chat',
    declarationFile: join(ROOT, 'build', 'types', 'chat', 'index.d.ts'),
    baselineFile: join(ROOT, 'scripts', 'api-baseline.chat.txt'),
    read: reexportedNames,
  },
  {
    name: '@ahmetilhn/hanui/charts',
    declarationFile: join(ROOT, 'build', 'types', 'charts', 'index.d.ts'),
    baselineFile: join(ROOT, 'scripts', 'api-baseline.charts.txt'),
    read: reexportedNames,
  },
];

/** @returns {string[]} alfabetik, tekil disa aktarim adlari */
const readExportedNames = entry => {
  if (!existsSync(entry.declarationFile)) {
    console.error(`✗ ${entry.declarationFile} yok. Once \`npm run build\` calistir.`);
    process.exit(1);
  }

  const names = entry.read(readFileSync(entry.declarationFile, 'utf8'));

  if (names.length === 0) {
    console.error(
      `✗ ${entry.name}: hicbir disa aktarim bulunamadi — desen bayat olabilir, olcum yesil kalmamali.`,
    );
    process.exit(1);
  }

  return [...new Set(names)].sort();
};

const isUpdate = process.argv.includes('--update');
let hasDrift = false;

for (const entry of ENTRIES) {
  const currentNames = readExportedNames(entry);

  if (isUpdate) {
    writeFileSync(entry.baselineFile, `${currentNames.join('\n')}\n`, 'utf8');
    console.log(`✓ ${entry.name}: taban cizgisi tazelendi — ${currentNames.length} ad.`);
    continue;
  }

  if (!existsSync(entry.baselineFile)) {
    console.error(`✗ ${entry.name}: taban cizgisi yok. \`node scripts/check-api.mjs --update\` calistir.`);
    process.exit(1);
  }

  const baselineNames = readFileSync(entry.baselineFile, 'utf8').split('\n').filter(Boolean);
  const removed = baselineNames.filter(name => !currentNames.includes(name));
  const added = currentNames.filter(name => !baselineNames.includes(name));

  if (removed.length === 0 && added.length === 0) {
    console.log(`✓ ${entry.name}: genel API degismedi — ${currentNames.length} ad.`);
    continue;
  }

  hasDrift = true;
  console.error(`\n✗ ${entry.name}: genel API taban cizgisinden AYRISTI.\n`);
  for (const name of removed) console.error(`   − ${name}  (KIRICI: tuketici bu adi kaybeder)`);
  for (const name of added) console.error(`   + ${name}  (yeni SURUM TAAHHUDU)`);
}

if (hasDrift) {
  console.error(
    '\n   Disa verilen her ad bir sozlesmedir. Degisiklik BILINCLIYSE: ' +
      "`node scripts/check-api.mjs --update` ve gerekcesini CLAUDE.md'ye yaz.\n",
  );
  process.exit(1);
}
