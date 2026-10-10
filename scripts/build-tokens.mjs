/** SCSS token dosyalarını `src/theme/tokens.ts`ten ÜRETİR. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadTokens, ROOT } from './lib/load-tokens.mjs';

const STYLES_DIR = resolve(ROOT, 'src/styles');

/** CSS özel özelliği öneki. */
const PREFIX = '--hanui-';

const {
  LIGHT_THEME,
  DARK_THEME,
  SYNTAX_LIGHT_THEME,
  SYNTAX_DARK_THEME,
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

// Tema yayini: secim `<html data-hanui-theme>` ile tasinir, yoksa `prefers-color-scheme` yedegi
// devreye girer. Ana tokenlar ve sohbet girisinin sozdizimi tokenlari AYNI secicilerle yayilir.
const themeRules = (light, dark) => `@media (prefers-color-scheme: dark) {
  :root:not([data-hanui-theme]) {
    @include ${dark};
  }
}

:root[data-hanui-theme='dark'] {
  @include ${dark};
}

:root[data-hanui-theme='light'] {
  @include ${light};
}
`;

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

${themeRules('light', 'dark')}
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
// ⚠ Bunun iki sonucu var ve ikisi de sessizce kiriliyor: (1) renk uzerinde SCSS renk fonksiyonu
// CALISMAZ
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
// ⚠ Bedeli: SCSS ARITMETIGI CALISMAZ (`$space-8 - $space-2` derlenmez, Sass iki `var()` cagrisini
// cikaramaz)
const metricsFile = `${BANNER}${Object.keys(METRIC_TOKENS)
  .map(name => `$${name}: var(${PREFIX}${name});`)
  .join('\n')}
`;

// Sozdizimi tokenlari: kurallar VE degiskenler tek dosyada. Yalnizca `CodeBlock` `@use` eder, yani
// `:root` kurallari `chat.css`e iner; ana `styles.css`e ve SCSS API'sine girmez.
const syntaxFile = `${BANNER}@mixin syntax-light {
${declarations(SYNTAX_LIGHT_THEME)}
}

@mixin syntax-dark {
${declarations(SYNTAX_DARK_THEME)}
}

:root {
  @include syntax-light;
}

${themeRules('syntax-light', 'syntax-dark')}
${Object.keys(SYNTAX_LIGHT_THEME)
  .map(name => `$${name}: var(${PREFIX}${name});`)
  .join('\n')}
`;

mkdirSync(STYLES_DIR, { recursive: true });
writeFileSync(resolve(STYLES_DIR, '_tokens.generated.scss'), tokensFile, 'utf8');
writeFileSync(resolve(STYLES_DIR, '_colors.generated.scss'), colorsFile, 'utf8');
writeFileSync(resolve(STYLES_DIR, '_metrics.generated.scss'), metricsFile, 'utf8');
writeFileSync(resolve(STYLES_DIR, '_syntax.generated.scss'), syntaxFile, 'utf8');

console.log(
  `hanui: ${Object.keys(LIGHT_THEME).length} renk + ${Object.keys(METRIC_TOKENS).length} ölçü` +
    ` + ${Object.keys(SYNTAX_LIGHT_THEME).length} sözdizimi token üretildi → _tokens.generated.scss,` +
    ' _colors.generated.scss, _metrics.generated.scss, _syntax.generated.scss',
);
