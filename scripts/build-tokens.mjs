/**
 * SCSS token dosyalarını `src/theme/tokens.ts`ten ÜRETİR.
 *
 * <h3>Neden üretiliyor</h3>
 * Aynı token listesi iki dilde duruyor: TypeScript tarafı çalışma zamanı
 * temasını (kullanıcı ezmeleri) tanır, SCSS tarafı bileşenlerin gördüğü
 * sözleşmedir. İkisini elle tutmak bir tarafta var olup diğerinde olmayan bir
 * token demek ve ayrışma SESSİZ: bileşen tanımsız bir değişkeni okur, kural
 * `var(--hanui-yok)` olarak tarayıcıya iner, renk düşer ve derleme yeşil
 * döner.
 *
 * <p>Üretilen iki dosya:
 * <ul>
 *   <li>`_tokens.generated.scss` — `:root` ve `[data-hanui-theme]` yayını.
 *       Yalnızca `base.scss` bir kez import eder.</li>
 *   <li>`_colors.generated.scss` — `$page: var(--hanui-page)` biçiminde SCSS
 *       sözleşmesi. `_variables.scss` bunu `@forward` eder.</li>
 * </ul>
 *
 * <p>Çalıştırma: `npm run tokens` (build ve verify bunu kendiliğinden yapar).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadTokens, ROOT } from './lib/load-tokens.mjs';

const STYLES_DIR = resolve(ROOT, 'src/styles');

/** CSS özel özelliği öneki. Tüketicinin kendi değişkenleriyle çakışmaz. */
const PREFIX = '--hanui-';

const { LIGHT_THEME, DARK_THEME, DEFAULT_FONTS, METRIC_TOKENS, COMPACT_DENSITY } =
  await loadTokens();

const BANNER = `// ÜRETİLMİŞ DOSYA — ELLE DÜZENLEMEYİN.
// Kaynak: src/theme/tokens.ts · Üretici: scripts/build-tokens.mjs
// Yeniden üretmek için: npm run tokens
`;

/** `:root` bloğunun gövdesi: her token bir CSS özel özelliği. */
const declarations = (theme, indent = '  ') =>
  Object.entries(theme)
    .map(([name, value]) => `${indent}${PREFIX}${name}: ${value};`)
    .join('\n');

const fontDeclarations = (indent = '  ') =>
  Object.entries(DEFAULT_FONTS)
    .map(([role, stack]) => `${indent}${PREFIX}font-${role}: ${stack};`)
    .join('\n');

const tokensFile = `${BANNER}
/*
 * Tema yayını.
 *
 * Tema seçimi \`<html data-hanui-theme="dark">\` ile taşınır. Öznitelik
 * yoksa \`prefers-color-scheme\` yedeği devreye girer — ama kullanıcının AÇIK
 * bir seçimi varsa sistem tercihi onu EZMEZ (\`:not([data-hanui-theme])\`).
 *
 * Bu dosya ÇIKTI ÜRETİR ve yalnızca \`base.scss\` tarafından bir kez import
 * edilir. Bileşen modülleri \`_variables.scss\` adlarını kullanır.
 */

@mixin light {
${declarations(LIGHT_THEME)}

  color-scheme: light;
}

@mixin dark {
${declarations(DARK_THEME)}

  color-scheme: dark;
}

/// Temadan bağımsız varsayılanlar: ölçü, font yığınları ve ölçüm değişkenleri.
@mixin base-tokens {
${declarations(METRIC_TOKENS)}

${fontDeclarations()}

  /*
   * Yapışkan bandın yüksekliği. Kütüphane bunu ÖLÇMEZ — tüketicinin kendi
   * başlığı var ve ölçüsü çalışma zamanında değişiyor (mobilde arama kutusu
   * kendi satırına düşüyor, uyarı şeridi çıkıp kayboluyor). Tüketici gerçek
   * değeri \`ResizeObserver\` ile yazana kadar 0: bandı olmayan bir sayfada
   * yapışkan öğe doğru yerde, \`top: 0\`da durur.
   */
  ${PREFIX}header-height: 0px;

  /*
   * Alt sayfanın GÖRÜNEN alana yaslanması için ölçüm. \`useSheetViewport\`
   * yazar; panel kapalıyken silinir ve CSS yedek değeri (0 / 100dvh) doğru
   * olanı verir.
   */
  ${PREFIX}sheet-inset-bottom: 0px;
}

:root {
  @include base-tokens;
  @include light;
}

/*
 * Satır içi tema betiği çalışmadıysa sistem tercihi yine karşılanır.
 * \`:not([data-hanui-theme])\` — kullanıcının açık bir seçimi varsa sistem
 * tercihi onu ezmez.
 */
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

/*
 * YOĞUN KİP — \`<html data-hanui-density="compact">\`.
 *
 * Yalnızca EZİLEN ölçüler yazılır; geri kalanı \`base-tokens\`ten miras alınır.
 * Tam eşlemeyi tekrar yazmak da çalışırdı ama bir sonraki sürümde varsayılan
 * bir ölçü değiştiğinde yoğun kip ESKİ değeri taşımaya devam ederdi — üstelik
 * yoğunlukla hiç ilgisi olmayan bir token için.
 */
:root[data-hanui-density='compact'] {
${declarations(COMPACT_DENSITY)}
}
`;

const colorsFile = `${BANNER}
/*
 * Bileşenlerin gördüğü RENK SÖZLEŞMESİ.
 *
 * Her ad bir \`var(${PREFIX}…)\` işaret eder. Bunun iki sonucu var:
 *
 *   1. Renk üzerinde SCSS RENK FONKSİYONU ÇALIŞMAZ. \`rgba($surface, .9)\`
 *      derlenmez — daha kötüsü, Sass onu çözemeyip olduğu gibi geçirir ve
 *      tarayıcıya geçersiz \`rgba(var(--hanui-surface), .9)\` iner. Bildirim
 *      sessizce düşer. Gereken her saydam değer aşağıda HAZIR token olarak
 *      duruyor: \`$scrim\`, \`$glass\`, \`$ring\`, \`$track\`, \`$glow-1\`…
 *   2. \`prefers-color-scheme\` ile renk seçilmez; tema
 *      \`data-hanui-theme\` üzerinden gelir.
 */

${Object.keys(LIGHT_THEME)
  .map(name => `$${name}: var(${PREFIX}${name});`)
  .join('\n')}

// --- Yazı tipi rolleri ---
$font-heading: var(${PREFIX}font-heading);
$font-body: var(${PREFIX}font-body);
$font-mono: var(${PREFIX}font-mono);

/// Küçük arayüz metni BAŞLIK FONTUNU KULLANMAZ (bkz. theme/tokens.ts).
$font-ui: $font-body;

// --- Ölçüm değişkenleri (çalışma zamanında yazılır) ---
// Yedek değerler ZORUNLU: değişken hiç yazılmadığında (JavaScript kapalı,
// hidrasyondan önceki ilk kare) kural düşmemeli, eski davranışa dönmeli.
$header-offset: var(${PREFIX}header-height, 0px);
$sheet-inset-bottom: var(${PREFIX}sheet-inset-bottom, 0px);
$sheet-height: var(${PREFIX}sheet-height, 100dvh);
`;

/*
 * NOT: bu dosyanın açıklamaları `//` ile yazılıyor, `/* *` + `/` ile değil.
 * CSS yorumu çıktıya GEÇER ve Sass onun içindeki `#{…}` dizisini de
 * yorumlar — açıklamada geçen bir örnek kod, derlemeyi "Undefined variable"
 * ile kırıyordu. Sass yorumu (`//`) çıktıya hiç inmez.
 */
const metricsFile = `${BANNER}
// Bileşenlerin gördüğü ÖLÇÜ SÖZLEŞMESİ.
//
// Renkler gibi bunlar da \`var(${PREFIX}…)\` işaret ediyor ve bunun bir bedeli
// var: SCSS ARİTMETİĞİ ÇALIŞMAZ. \`$space-8 - $space-2\` derlenmez; Sass iki
// \`var()\` çağrısını çıkaramaz. Gereken her hesap \`calc()\` ile YAZILIR ve
// tarayıcıda yapılır — negatif değer dahil:
//
//     padding-inline-start: calc(#\{$space-8\} - #\{$space-2\});
//     margin-inline: calc(-1 * #\{$space-2\});
//
// Karşılaştırma (\`@if $size >= $font-size-lg\`) ise HİÇ çalışmaz: çalışma
// zamanında ezilebilen bir değer derleme anında karşılaştırılamaz. \`heading()\`
// mixin'i bu yüzden punto değil KADEME ADI alıyor (bkz. \`_mixins.scss\`).

${Object.keys(METRIC_TOKENS)
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
