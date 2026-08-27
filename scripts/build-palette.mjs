#!/usr/bin/env node
/** `src/theme/palette.ts` ÜRETECİ — `npm run tokens` içinde, `build-tokens`ten önce. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ACCENT_STEPS,
  BAND_STEPS,
  CART_STEPS,
  DANGER_SOLID_STEPS,
  HUE,
  MINT,
  MIN_SATURATION,
  NEUTRAL_STEPS,
  OFF_SATURATION_FACTOR,
  PINE,
  ROLE_STEPS,
  STAR_STEPS,
  STATUS_FAMILIES,
  STATUS_OVERRIDES,
  STATUS_SHAPE,
  SURFACE_DARK_STEPS,
  mix,
} from './lib/palette-recipe.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(ROOT, 'src/theme/palette.ts');
const LEGACY = resolve(ROOT, 'scripts/legacy-hex.txt');

/* --- Türetme ------------------------------------------------------------- */

const neutral = Object.fromEntries(NEUTRAL_STEPS.map(([name, step]) => [name, mix(step)]));

const surfaceDark = Object.fromEntries(
  Object.entries(SURFACE_DARK_STEPS).map(([name, step]) => [name, mix(step)]),
);

const band = {
  base: PINE,
  two: mix(BAND_STEPS.two),
  three: mix(BAND_STEPS.three),
  dark: PINE,
  darkLine: mix(BAND_STEPS.darkLine),
};

const cart = Object.fromEntries(Object.entries(CART_STEPS).map(([name, step]) => [name, mix(step)]));
const role = Object.fromEntries(Object.entries(ROLE_STEPS).map(([name, step]) => [name, mix(step)]));

/** Durum ailesi: ortak şablon + ailenin ton açısı. `off` nötr olduğu için kısılır. */
const statusFamily = family => {
  const hue = HUE[family];
  const factor = family === 'off' ? OFF_SATURATION_FACTOR : 1;
  const override = STATUS_OVERRIDES[family] ?? {};
  const value = key => {
    const step = { ...STATUS_SHAPE[key], ...(override[key] ?? {}) };
    return mix({ ...step, s: step.s * factor, h: hue });
  };

  return {
    [`${family}Bg`]: value('bg'),
    [`${family}Fg`]: value('fg'),
    [`${family}Line`]: value('line'),
    [`${family}BgDark`]: value('bgDark'),
    [`${family}FgDark`]: value('fgDark'),
    [`${family}LineDark`]: value('lineDark'),
  };
};

const status = Object.assign({}, ...STATUS_FAMILIES.map(statusFamily));

const dangerSolid = Object.fromEntries(
  Object.entries(DANGER_SOLID_STEPS).map(([name, step]) => [name, mix(step)]),
);
const accent = Object.fromEntries(
  Object.entries(ACCENT_STEPS).map(([name, step]) => [name, mix(step)]),
);
const star = Object.fromEntries(Object.entries(STAR_STEPS).map(([name, step]) => [name, mix(step)]));

const corporate = { paper: neutral.n100, slate: neutral.n600, mist: surfaceDark.textTwo };
const brand = { pine: PINE, mint: MINT, ink: neutral.n900 };
const anchor = { red: accent.red, green: accent.green };
const sale = {
  bg: status.okBg,
  fg: status.okFg,
  bgDark: status.okBgDark,
  fgDark: status.okFgDark,
};
const actionLine = { light: PINE, dark: MINT };

/* --- Kapılar ------------------------------------------------------------- */

const every = [
  ...Object.values(neutral),
  ...Object.values(surfaceDark),
  ...Object.values(band),
  ...Object.values(cart),
  ...Object.values(role),
  ...Object.values(status),
  ...Object.values(dangerSolid),
  ...Object.values(accent),
  ...Object.values(star),
];

/** ⚠ Eski paletten tek bir değer bile hayatta kalmamalı. */
const assertNoLegacyHex = () => {
  const allowed = new Set([PINE, MINT]);
  const legacy = new Set(
    readFileSync(LEGACY, 'utf8')
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => /^#[0-9a-f]{6}$/.test(line)),
  );

  const survivors = [...new Set(every)].filter(hex => legacy.has(hex) && !allowed.has(hex));

  if (survivors.length > 0) {
    throw new Error(
      `Eski paletten ${survivors.length} deger hayatta kaldi: ${survivors.join(', ')}. ` +
        'Tarifteki aydinlik ya da doygunlugu kaydir.',
    );
  }
};

/** ⚠ "Soluk" bir görüş değil, kırılabilir bir kural. */
const assertVividEnough = () => {
  const violations = [];
  const check = (label, step, floor) => {
    if ((step.s ?? 0) < floor) violations.push(`${label} doygunluk ${step.s} < ${floor}`);
  };

  check('status.bg', STATUS_SHAPE.bg, MIN_SATURATION.tint);
  check('status.bgDark', STATUS_SHAPE.bgDark, MIN_SATURATION.tint);
  check('status.fg', STATUS_SHAPE.fg, MIN_SATURATION.text);
  check('status.fgDark', STATUS_SHAPE.fgDark, MIN_SATURATION.text);
  check('status.line', STATUS_SHAPE.line, MIN_SATURATION.line);
  check('status.lineDark', STATUS_SHAPE.lineDark, MIN_SATURATION.line);
  for (const [name, step] of Object.entries(CART_STEPS))
    if (!name.includes('Soft') && name !== 'soft' && name !== 'on')
      check(`cart.${name}`, step, MIN_SATURATION.fill);
  for (const [name, step] of Object.entries(ROLE_STEPS))
    if (['base', 'hover', 'active', 'text', 'dark', 'darkHover'].includes(name))
      check(`role.${name}`, step, MIN_SATURATION.fill);

  if (violations.length > 0) throw new Error(`Canlilik tabani asildi:\n  ${violations.join('\n  ')}`);
};

/* --- Yazım --------------------------------------------------------------- */

const entries = (record, indent = '  ') =>
  Object.entries(record)
    .map(([key, value]) => `${indent}${key}: '${value}',`)
    .join('\n');

const block = (name, doc, body) => `${doc}\nexport const ${name} = {\n${body}\n} as const;\n`;

const file = () =>
  [
    `/**
 * HAM PALET — kütüphanenin TEK hex kaynağı; değerler OKLCH'te türetilir.
 * ⚠ ÜRETİLMİŞ DOSYA: \`scripts/lib/palette-recipe.mjs\` tarifini değiştir, \`npm run tokens\`.
 * ⚠ Yalnızca \`pine\` ve \`mint\` sabit; geri kalan her şey onlardan türer.
 */`,
    block(
      'BRAND',
      `/**
 * MARKA — kılavuzun iki ankoru ve onlardan türeyen mürekkep.
 * ⚠ \`mint\` AÇIK ZEMİNDE METİN OLAMAZ (kâğıt üzerinde 1,3:1).
 */`,
      entries(brand),
    ),
    block(
      'CORPORATE',
      `/** KURUMSAL YARDIMCI RENKLER — nötr merdivene takma ad, ayrı hex değil. */`,
      entries(corporate),
    ),
    block(
      'NEUTRAL',
      `/**
 * NÖTR EKSEN — marka ekseninde, ton aydınlıkla birlikte kayar.
 * ⚠ Açık uç bilinçle DOYGUN: eski %8-13 doygunluk fiilen griydi.
 * ⚠ \`n0\` SAF BEYAZ KALIR — merdivenin tepesi renk değil referans nokta.
 */`,
      entries(neutral),
    ),
    block(
      'BAND',
      `/** BANT — üst bant, alt bilgi, tablo başlıkları ve BİRİNCİL EYLEM; tabanı \`pine\`. */`,
      entries(band),
    ),
    block(
      'SURFACE_DARK',
      `/**
 * KOYU TEMA YÜZEYLERİ.
 * ⚠ Koyu temada zemin SİYAHTIR, yeşil vurgudur; doygunluk yukarı çıktıkça DÜŞER.
 */`,
      entries(surfaceDark),
    ),
    block(
      'ACTION_LINE',
      `/**
 * BİRİNCİL EYLEMİN SINIRI — dolgunun kendisi değil, KENARI.
 * ⚠ Koyu temada çam dolgu kaybolur; mint saç çizgisi grafik eşiğini her zeminde geçer.
 */`,
      entries(actionLine),
    ),
    block(
      'CART',
      `/**
 * DÖNÜŞÜM EYLEMİ ("sepete ekle") — ekrandaki tek PARLAK yeşil.
 * ⚠ Birincil eylemden ayrımı TON AÇISI DEĞİL AYDINLIK.
 * ⚠ Etkileşim yönü açık temada TERS: hover AÇILIR, active KOYULUR.
 */`,
      entries(cart),
    ),
    block(
      'ROLE',
      `/**
 * GEZİNME VE KEŞİF ROLÜ — bağlantı, etkin filtre, seçili satır, ilerleme.
 * ⚠ TON AÇISI GÖZLE ÖLÇÜLDÜ: H 162 ilk kesin yeşil, yukarı çekilmez.
 * ⚠ Olumlu durumla karışma ton açısıyla değil BİÇİMLE çözülür.
 */`,
      entries(role),
    ),
    block(
      'ANCHOR',
      `/** ANKORLAR — halka ve vurgu renklerinin türediği iki uç. */`,
      entries(anchor),
    ),
    block(
      'STATUS',
      `/**
 * DURUM AİLELERİ — altı aile tek şablondan çıkar; değişen tek şey ton açısı.
 * ⚠ TINT ZEMİNLERİ AYDINLIKTA BİR KADEME DÜŞÜK: L .95'te chroma çok küçük.
 */`,
      entries(status),
    ),
    block(
      'DANGER_SOLID',
      `/** YIKICI EYLEM DOLGUSU — üzerine açık metin gelir, aydınlığı bu yüzden sınırlı. */`,
      entries(dangerSolid),
    ),
    block(
      'ACCENT',
      `/** İKON VURGUSU — WCAG 1.4.11, 3:1 grafik eşiği; metin katmanından bir kademe açık. */`,
      entries(accent),
    ),
    block(
      'SALE',
      `/** İNDİRİM ETİKETİ — olumlu durum ailesiyle aynı; ayrı bir yeşil değil. */`,
      entries(sale),
    ),
    block('STAR', `/** YILDIZ ALTINI — puan sayısının yanında durduğu için metin eşiğini de geçer. */`, entries(star)),
  ].join('\n');

assertVividEnough();
assertNoLegacyHex();

const contents = file();
const unique = new Set(every).size;

/**
 * Elle düzenlenmiş bir `palette.ts` hiçbir katmanı uyarmaz — geçerli TypeScript kalır, derleme
 * yeşil biter ve palet sessizce tarifinden ayrışır.
 * ⚠ `--check`: diskteki dosya tarifin çıktısı mı?
 */
if (process.argv.includes('--check')) {
  const onDisk = readFileSync(TARGET, 'utf8');

  if (onDisk !== contents) {
    process.stderr.write(
      'palette.ts tarifin ciktisiyla ayrismis. Elle duzenlenmis olabilir.\n' +
        'Duzeltme: scripts/lib/palette-recipe.mjs tarifini degistir, sonra `npm run tokens`.\n',
    );
    process.exit(1);
  }

  process.stdout.write(`palette.ts tarifle birebir — ${every.length} deger, ${unique} tekil.\n`);
} else {
  writeFileSync(TARGET, contents, 'utf8');
  process.stdout.write(`palette.ts yazildi — ${every.length} deger, ${unique} tekil.\n`);
}
