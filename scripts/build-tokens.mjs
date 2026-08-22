/** SCSS token dosyalarını `src/theme/tokens.ts`ten ÜRETİR. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadTokens, ROOT } from './lib/load-tokens.mjs';

const STYLES_DIR = resolve(ROOT, 'src/styles');

/** CSS özel özelliği öneki. Tüketicinin kendi değişkenleriyle çakışmaz. */
const PREFIX = '--hanui-';

const {
  LIGHT_THEME,
  DARK_THEME,
  DEFAULT_FONTS,
  METRIC_TOKENS,
  COMPACT_DENSITY,
  NARROW_METRICS,
  NARROW_BREAKPOINT,
} = await loadTokens();

// Üretilen `.scss` dosyalari YORUM TASIMAZ; sozlesme burada, kaynakta yazili.
const BANNER = '';

/** `:root` bloğunun gövdesi: her token bir CSS özel özelliği. */
const declarations = (theme, indent = '  ') =>
  Object.entries(theme)
    .map(([name, value]) => `${indent}${PREFIX}${name}: ${value};`)
    .join('\n');

const fontDeclarations = (indent = '  ') =>
  Object.entries(DEFAULT_FONTS)
    .map(([role, stack]) => `${indent}${PREFIX}font-${role}: ${stack};`)
    .join('\n');

// Tema yayini: secim `<html data-hanui-theme>` ile tasinir, yoksa
// `prefers-color-scheme` yedegi devreye girer. Cikti yalnizca `base.scss`
// tarafindan bir kez import edilir; bilesenler `_variables.scss` adlarini kullanir.
const tokensFile = `${BANNER}@mixin light {
${declarations(LIGHT_THEME)}

  color-scheme: light;
}

@mixin dark {
${declarations(DARK_THEME)}

  color-scheme: dark;
}

@mixin base-tokens {
${declarations(METRIC_TOKENS)}

${fontDeclarations()}

  ${PREFIX}header-height: 0px;
  ${PREFIX}sheet-inset-bottom: 0px;
}

:root {
  @include base-tokens;
  @include light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-hanui-theme]) {
    @include dark;
  }
}

:root[data-hanui-theme='dark'] {
  @include dark;
}

:root[data-hanui-theme='light'] {
  @include light;
}

:root[data-hanui-density='compact'] {
${declarations(COMPACT_DENSITY)}
}

@media (max-width: ${NARROW_BREAKPOINT}) {
  :root {
${declarations(NARROW_METRICS, '    ')}
  }
}
`;

// Renk sozlesmesi: her ad bir `var(--hanui-…)` isaret eder.
//
// ⚠ Bunun iki sonucu var ve ikisi de sessizce kiriliyor: (1) renk uzerinde SCSS
// renk fonksiyonu CALISMAZ — `rgba($surface, .9)` gecersiz CSS uretir ve bildirim
// duser, hazir saydam token'lar kullanilir ($scrim, $glass, $ring, $track…);
// (2) tema `prefers-color-scheme` ile degil `data-hanui-theme` ile secilir.
const colorsFile = `${BANNER}${Object.keys(LIGHT_THEME)
  .map(name => `$${name}: var(${PREFIX}${name});`)
  .join('\n')}

$font-heading: var(${PREFIX}font-heading);
$font-body: var(${PREFIX}font-body);
$font-mono: var(${PREFIX}font-mono);
$font-ui: $font-body;

$header-offset: var(${PREFIX}header-height, 0px);
$sheet-inset-bottom: var(${PREFIX}sheet-inset-bottom, 0px);
$sheet-height: var(${PREFIX}sheet-height, 100dvh);
`;

// Olcu sozlesmesi: bunlar da `var(--hanui-…)` isaret ediyor.
//
// ⚠ Bedeli: SCSS ARITMETIGI CALISMAZ (`$space-8 - $space-2` derlenmez, Sass iki
// `var()` cagrisini cikaramaz) — her hesap `calc()` ile tarayicida yapilir.
// Karsilastirma (`@if $size >= $font-size-lg`) ise hic calismaz; `heading()`
// bu yuzden punto degil KADEME ADI alir.
const metricsFile = `${BANNER}${Object.keys(METRIC_TOKENS)
  .map(name => `$${name}: var(${PREFIX}${name});`)
  .join('\n')}
`;

mkdirSync(STYLES_DIR, { recursive: true });
writeFileSync(resolve(STYLES_DIR, '_tokens.generated.scss'), tokensFile, 'utf8');
writeFileSync(resolve(STYLES_DIR, '_colors.generated.scss'), colorsFile, 'utf8');
writeFileSync(resolve(STYLES_DIR, '_metrics.generated.scss'), metricsFile, 'utf8');

console.log(
  `hanui: ${Object.keys(LIGHT_THEME).length} renk + ${Object.keys(METRIC_TOKENS).length} ölçü` +
    ' token üretildi → _tokens.generated.scss, _colors.generated.scss, _metrics.generated.scss',
);
