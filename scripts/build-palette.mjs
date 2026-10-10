#!/usr/bin/env node
/** `src/theme/palette.ts` ÜRETECİ — `npm run tokens` içinde, `build-tokens`ten önce. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { deltaE, fromHex } from './lib/oklch.mjs';
import {
  ACCENT_STEPS,
  BAND_STEPS,
  CART_STEPS,
  CATEGORY_HUES,
  CATEGORY_SHAPE,
  CORPORATE_STEPS,
  DANGER_SOLID_STEPS,
  HUE,
  INK,
  LINK_STEPS,
  MINT,
  MIN_CATEGORY_DELTA_E,
  MIN_SATURATION,
  MIN_SYNTAX_DELTA_E,
  MIN_TINT_DELTA_E,
  NEUTRAL_CHROMA_CEILING,
  NEUTRAL_STEPS,
  PINE,
  STAR_STEPS,
  STATUS_FAMILIES,
  STATUS_OVERRIDES,
  STATUS_SHAPE,
  SURFACE_DARK_STEPS,
  SYNTAX_HUES,
  SYNTAX_SHAPE,
  mix,
  resolve as resolveStep,
} from './lib/palette-recipe.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = resolve(ROOT, 'src/theme/palette.ts');
const LEGACY = resolve(ROOT, 'scripts/legacy-hex.txt');

/* --- Türetme ------------------------------------------------------------- */

const neutral = Object.fromEntries(
  NEUTRAL_STEPS.map(([name, step]) => [name, resolveStep(step)]),
);

const surfaceDark = Object.fromEntries(
  Object.entries(SURFACE_DARK_STEPS).map(([name, step]) => [name, resolveStep(step)]),
);

const band = {
  base: PINE,
  two: mix(BAND_STEPS.two),
  three: mix(BAND_STEPS.three),
  dark: PINE,
  darkLine: mix(BAND_STEPS.darkLine),
  fgThree: mix(BAND_STEPS.fgThree),
};

const cart = Object.fromEntries(Object.entries(CART_STEPS).map(([name, step]) => [name, mix(step)]));
const link = Object.fromEntries(Object.entries(LINK_STEPS).map(([name, step]) => [name, mix(step)]));

/**
 * Durum ailesi: ortak şablon + ailenin ton açısı. Sapma `c` taşıyorsa (nötr `off`) mutlak chroma
 * kazanır.
 */
const statusFamily = family => {
  const hue = HUE[family];
  const override = STATUS_OVERRIDES[family] ?? {};
  const value = key => mix({ ...STATUS_SHAPE[key], ...(override[key] ?? {}), h: hue });

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

/** Kategori: her ton iki temada aynı şablon (`light` / `dark`), değişen yalnızca ton açısı. */
const category = Object.fromEntries(
  Object.entries(CATEGORY_HUES).flatMap(([name, hue]) => [
    [name, mix({ ...CATEGORY_SHAPE.light, h: hue })],
    [`${name}Dark`, mix({ ...CATEGORY_SHAPE.dark, h: hue })],
  ]),
);

/** Sözdizimi: kategorik tonlar, metin aydınlığında (`light` / `dark`). */
const syntax = Object.fromEntries(
  Object.entries(SYNTAX_HUES).flatMap(([name, hue]) => [
    [name, mix({ ...SYNTAX_SHAPE.light, h: hue })],
    [`${name}Dark`, mix({ ...SYNTAX_SHAPE.dark, h: hue })],
  ]),
);

const corporate = Object.fromEntries(
  Object.entries(CORPORATE_STEPS).map(([name, step]) => [name, mix(step)]),
);
const brand = { pine: PINE, mint: MINT, ink: INK };
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
  ...Object.values(corporate),
  ...Object.values(cart),
  ...Object.values(link),
  ...Object.values(status),
  ...Object.values(dangerSolid),
  ...Object.values(accent),
  ...Object.values(star),
  ...Object.values(category),
  ...Object.values(syntax),
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
  for (const [name, step] of Object.entries(LINK_STEPS))
    check(`link.${name}`, step, MIN_SATURATION.fill);

  if (violations.length > 0) throw new Error(`Canlilik tabani asildi:\n  ${violations.join('\n  ')}`);
};

/**
 * ⚠ NÖTR GERÇEKTEN NÖTR: 4.x'te eksen "doygun nötr" adıyla chroma 0,05'e çıkmıştı ve arayüzün her
 * yüzeyi yeşil çiziliyordu — hiçbir kapı bunu görmedi. Tavan ÇIKTIYA uygulanır, tarife değil.
 */
const assertNeutralStaysNeutral = () => {
  const violations = [
    ...Object.entries(neutral).map(([name, hex]) => [`NEUTRAL.${name}`, hex]),
    ...Object.entries(surfaceDark).map(([name, hex]) => [`SURFACE_DARK.${name}`, hex]),
  ].filter(([, hex]) => fromHex(hex).c > NEUTRAL_CHROMA_CEILING);

  if (violations.length > 0)
    throw new Error(
      `Notr eksen renklendi (chroma > ${NEUTRAL_CHROMA_CEILING}): ` +
        violations.map(([name, hex]) => `${name} ${hex}`).join(', '),
    );
};

/**
 * ⚠ DURUM ZEMİNİ YÜZEYDEN AYRIŞMALI: krem kartta 4.x'in uyarı tinti ΔE 2,0 veriyordu. Her ailenin
 * zemini, temasının sayfa / yüzey / kart üçlüsüne karşı ölçülür.
 */
const assertTintsSeparate = () => {
  const light = [neutral.n25, neutral.n0, neutral.n100];
  const dark = [surfaceDark.page, surfaceDark.surface, surfaceDark.surfaceTwo];
  const violations = [];

  for (const family of STATUS_FAMILIES) {
    for (const [key, surfaces] of [
      ['Bg', light],
      ['BgDark', dark],
    ]) {
      const tint = status[`${family}${key}`];
      const nearest = Math.min(...surfaces.map(surface => deltaE(tint, surface)));
      if (nearest < MIN_TINT_DELTA_E)
        violations.push(`${family}${key} ${tint} ΔE ${nearest.toFixed(1)} < ${MIN_TINT_DELTA_E}`);
    }
  }

  if (violations.length > 0)
    throw new Error(`Durum zemini yuzeyle karisiyor:\n  ${violations.join('\n  ')}`);
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
 * ⚠ Dört ankor sabit: marka için \`pine\` / \`mint\`, nötr eksen için \`ink\` / \`canvas\`.
 *   Geri kalan her şey onlardan türer.
 */`,
    block(
      'BRAND',
      `/**
 * MARKA — kılavuzun iki ankoru ve arayüzün mürekkebi.
 * ⚠ \`mint\` AÇIK ZEMİNDE METİN OLAMAZ (krem üzerinde 1,24:1).
 */`,
      entries(brand),
    ),
    block(
      'CORPORATE',
      `/**
 * KURUMSAL YARDIMCI RENKLER — kâğıt / slate / sis, MARKA EKSENİNDE.
 * ⚠ Yalnızca marka şeridinde (\`band-*\`) yaşar; arayüz nötrleri sıcak mürekkep merdivenidir.
 */`,
      entries(corporate),
    ),
    block(
      'NEUTRAL',
      `/**
 * NÖTR EKSEN — SICAK MÜREKKEP: açık uç krem kâğıt (\`n25\` = canvas), koyu uç siyah (\`n900\` = ink).
 * ⚠ Marka ekseninde DEĞİL: 4.x'te öyleydi ve arayüzün her yüzeyi yeşil çiziliyordu.
 * ⚠ \`n0\` kartın zemini — sayfadan bir kademe açık, saf beyaz değil.
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
 * KOYU TEMA YÜZEYLERİ — sıcak siyah.
 * ⚠ Kademeler arası fark bilinçle küçük (1,03-1,14:1); derinliği kenarlık kurar.
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
      'LINK',
      `/**
 * BAĞLANTI VE ODAK — 4.x \`role\` ailesinin yeşil kalan yarısı.
 * ⚠ Seçim, ilerleme, onay kutusu ve anahtar bu aileyi KULLANMAZ; mürekkep merdivenindedir.
 * ⚠ TON AÇISI GÖZLE ÖLÇÜLDÜ: H 162 ilk kesin yeşil, yukarı çekilmez.
 */`,
      entries(link),
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
    block(
      'CATEGORY',
      `/**
 * KATEGORİK PALET — grafik serileri ve kategori işaretleri.
 * ⚠ Marka yeşilleri seri rengi OLMAZ; \`cat3\` orta aydınlıkta bir kategori yeşili.
 */`,
      entries(category),
    ),
    block(
      'SYNTAX',
      `/**
 * SÖZDİZİMİ — \`CodeBlock\`ın vurgulayıcısı; kategorik tonlar METİN aydınlığında (≥4,5:1).
 * ⚠ Yeşil yok: fark satırının yeşili bir durum (\`ok-fg\`), sözdizimi rengi değil.
 */`,
      entries(syntax),
    ),
  ].join('\n');

/** ⚠ İki kategori tonu grafikte YAN YANA duruyor; birbirine yakınsa lejant anlamını yitirir. */
const assertCategoriesDistinct = () => {
  const violations = [];

  for (const suffix of ['', 'Dark']) {
    const names = Object.keys(CATEGORY_HUES);
    names.forEach((first, index) =>
      names.slice(index + 1).forEach(second => {
        const distance = deltaE(category[`${first}${suffix}`], category[`${second}${suffix}`]);
        if (distance < MIN_CATEGORY_DELTA_E)
          violations.push(`${first}${suffix} / ${second}${suffix} ΔE ${distance.toFixed(1)}`);
      }),
    );
  }

  if (violations.length > 0)
    throw new Error(`Kategori tonlari birbirine cok yakin:\n  ${violations.join('\n  ')}`);
};

/** ⚠ Koyu temada açık tonlar birbirine yaklaşıyor; iki sözdizimi rengi aynı satırda yan yana. */
const assertSyntaxDistinct = () => {
  const violations = [];

  for (const suffix of ['', 'Dark']) {
    const names = Object.keys(SYNTAX_HUES);
    names.forEach((first, index) =>
      names.slice(index + 1).forEach(second => {
        const distance = deltaE(syntax[`${first}${suffix}`], syntax[`${second}${suffix}`]);
        if (distance < MIN_SYNTAX_DELTA_E)
          violations.push(`${first}${suffix} / ${second}${suffix} ΔE ${distance.toFixed(1)}`);
      }),
    );
  }

  if (violations.length > 0)
    throw new Error(`Sozdizimi tonlari birbirine cok yakin:\n  ${violations.join('\n  ')}`);
};

assertVividEnough();
assertNeutralStaysNeutral();
assertCategoriesDistinct();
assertSyntaxDistinct();
assertTintsSeparate();
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
