import { readFileSync } from 'node:fs';

const read = (path: string): string => readFileSync(path, 'utf8');

/** Satır başında `selector {` ile açılan üst düzey bloğun gövdesi (iç içe bloklar dahil). */
const blockOf = (source: string, selector: string): string => {
  const match = new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{`, 'm').exec(
    source,
  );
  if (!match) throw new Error(`${selector} bulunamadı`);
  const start = match.index;
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${selector} kapanmıyor`);
};

/*
 * Durum katmanları: hover yalnız zemini bir kademe değiştirir. İki ihlal tüketicide ölçüldü (bir
 * kurumsal site ve yönetim paneli, 2026-11-01): dizin satırı hover'da kenarlık ve bağ rengi
 * değiştiriyor, açılır bölüm başlığı yuvarlak çerçevenin içinde kare bir zemin çiziyordu.
 */
describe('hover yüzeyleri', () => {
  it('dizin satırı `interactive-surface` kullanır; hover kenarlık ya da renk değiştirmez', () => {
    const row = blockOf(read('src/components/Directory/index.module.scss'), '.row');

    expect(row).toMatch(/@include\s+interactive-surface/);
    expect(row).not.toMatch(/&:hover/);
    expect(row).not.toMatch(/border:\s*1px solid transparent/);
  });

  it('açılır bölüm başlığının zemini içeride ve kendi yarıçapıyla çizilir', () => {
    const summary = blockOf(
      read('src/components/Disclosure/index.module.scss'),
      '.disclosure__summary',
    );

    expect(summary).toMatch(/background-clip:\s*padding-box/);
    expect(summary).toMatch(/border:\s*\$space-1 solid transparent/);
    expect(summary).toMatch(/border-radius:/);
  });

  it('alan hover çizgisi metin tonuna atlamaz, bir ton koyulaşır', () => {
    const base = blockOf(read('src/styles/_mixins.scss'), '@mixin input-base');

    expect(base).not.toMatch(/border-color:\s*\$text-3/);
    expect(base).toMatch(/color-mix\(in oklab/);
  });

  it('önek/sonek payı akışkan bölüm aralığından değil ölçülen genişlikten', () => {
    const input = read('src/components/Input/index.module.scss');

    expect(input).not.toMatch(/\$space-8/);
    expect(input).toContain('--hanui-input-prefix-width');
    expect(input).toContain('--hanui-input-suffix-width');
  });
});
