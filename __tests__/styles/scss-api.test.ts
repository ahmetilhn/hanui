/**
 * @jest-environment node
 */
/* dart2js Sass jsdom ortamında `Null check operator` ile düşüyor; derleme DOM istemez. */
import { resolve } from 'node:path';

import { compileString } from 'sass';

/*
 * SCSS API — `@use '@ahmetilhn/hanui/scss' as hanui;` tüketicide derlenir ve HİÇBİR KURAL basmaz.
 *
 * ⚠ Modül değişken ve mixin taşır, CSS değil: `:root` token kuralları `styles.css`te. Bir
 * `@use` kural bassaydı her tüketici dosyası onları yeniden üretirdi (hanration'da ~60 modül).
 * Ad kümesinin sözleşmesi `scripts/api-baseline.scss.txt`te (`check:api`).
 */
const STYLES = resolve(__dirname, '../../src/styles');

const compile = (body: string) =>
  compileString(`@use 'index' as hanui;\n${body}`, { loadPaths: [STYLES] }).css.trim();

describe('SCSS API', () => {
  it('yalnızca @use edildiğinde HİÇBİR kural basmaz', () => {
    expect(compile('')).toBe('');
  });

  it("değişkenler çalışma zamanı token'ı — tema derleme anında sabitlenmez", () => {
    expect(compile('.a { color: hanui.$text; padding: hanui.$space-3; }')).toContain(
      'color: var(--hanui-text)',
    );
  });

  it('kırılma noktaları kütüphanenin kendi değerleri (tüketicide kopyalanıp kayıyordu)', () => {
    const css = compile(
      '@media (max-width: hanui.$breakpoint-tablet-portrait) { .a { display: none; } }',
    );

    expect(css).toContain('768px');
  });

  it("mixin'ler iletilir", () => {
    const css = compile(
      '.a { @include hanui.focus-ring; @include hanui.reduced-motion { transition: none; } }',
    );

    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
  });
});
