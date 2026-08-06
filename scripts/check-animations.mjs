#!/usr/bin/env node
/** DERLENMIS CSS'TE HER ANIMASYON ADI TANIMLI BIR `@keyframes`E BAGLI MI? */
import { readFileSync } from 'node:fs';
import { argv, exit } from 'node:process';

const CSS_PATH = argv[2] ?? 'build/styles.css';

/** `animation` kisayolundaki ADI ayiklar. */
const KEYWORDS = new Set([
  'normal',
  'reverse',
  'alternate',
  'alternate-reverse',
  'forwards',
  'backwards',
  'both',
  'infinite',
  'paused',
  'running',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'linear',
  'step-end',
  'step-start',
  'none',
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
]);

const isTime = token => /^-?[\d.]+m?s$/i.test(token);
const isNumber = token => /^-?[\d.]+$/.test(token);

/** Fonksiyon cagrilarini (ve iclerindeki virgulleri) atarak parcalara boler. */
const topLevelTokens = value => {
  const tokens = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;

    if (depth === 0 && /[\s,]/.test(char)) {
      if (current) tokens.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) tokens.push(current);

  return tokens;
};

const css = readFileSync(CSS_PATH, 'utf8');

/* Tanimli keyframe'ler. `@keyframes` yerellestirilmisse adi hashli gelir; o da
   gecerli bir tanimdir — onemli olan referansin BIR tanimi bulmasi. */
const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(match => match[1]));

/* Yayinlanan animasyon adi ozel ozellikleri: `--hanui-anim-spin: hanui-spin`. */
const customProperties = new Map(
  [...css.matchAll(/(--hanui-anim-[\w-]+)\s*:\s*([\w-]+)/g)].map(match => [match[1], match[2]]),
);

const problems = [];
const used = new Set();

for (const match of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
  const value = match[1].trim();
  const declaration = `animation: ${value}`;

  for (const token of topLevelTokens(value)) {
    const variable = token.match(/^var\(\s*(--[\w-]+)/);

    if (variable) {
      /* Sure ve egri de degisken: yalnizca animasyon adi olanlari sinariz. */
      if (!variable[1].startsWith('--hanui-anim-')) continue;

      const target = customProperties.get(variable[1]);

      if (!target) {
        problems.push(`${declaration}\n    → ${variable[1]} hicbir yerde yayinlanmamis.`);
        continue;
      }

      if (!defined.has(target)) {
        problems.push(`${declaration}\n    → ${variable[1]} = ${target}, ama @keyframes yok.`);
        continue;
      }

      used.add(target);
      continue;
    }

    if (KEYWORDS.has(token.toLowerCase()) || isTime(token) || isNumber(token)) continue;
    if (token.includes('(')) continue;
    if (!/^-?[a-z_]/i.test(token)) continue;

    if (!defined.has(token)) {
      problems.push(
        `${declaration}\n    → "${token}" adinda bir @keyframes yok.` +
          ' Ham ad yazilmis olabilir; `$anim-*` kullanin (bkz. base.scss).',
      );
      continue;
    }

    used.add(token);
  }
}

const unused = [...defined].filter(name => !used.has(name));

if (problems.length > 0) {
  console.error(`✗ ${CSS_PATH}: ${problems.length} kirik animasyon referansi\n`);
  for (const problem of problems) console.error(`  ${problem}\n`);
  console.error(
    "  Bilesen SCSS'inde ham `@keyframes` adi yazilmaz — CSS Modules onu\n" +
      '  yerellestirir ve global tanimla eslesmez. `_variables.scss` icindeki\n' +
      '  `$anim-*` degiskenlerini kullanin.',
  );
  exit(1);
}

if (unused.length > 0) {
  console.error(`✗ ${CSS_PATH}: hicbir kural tarafindan kullanilmayan @keyframes\n`);
  for (const name of unused) console.error(`  ${name}`);
  console.error(
    '\n  Ya tanim oludur ve silinmeli, ya da onu kullanmasi gereken kural\n' +
      '  kirik bir ada basvuruyor. Ikisi de sessizce yasar.',
  );
  exit(1);
}

console.log(
  `✓ Animasyonlar bagli: ${defined.size} keyframe, hepsi kullaniliyor, kirik referans yok.`,
);
