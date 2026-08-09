import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const COMPONENT = resolve(__dirname, '../../src/components/Carousel');

const read = (file: string) => readFileSync(resolve(COMPONENT, file), 'utf8');

const gridAutoColumns = (): string => {
  const match = read('index.module.scss').match(/grid-auto-columns:\s*([^;]+);/);
  if (!match) throw new Error('`grid-auto-columns` bildirimi yok');

  return match[1];
};

describe('Carousel şerit genişliği', () => {
  it('sütun genişliği esnek DEĞİL — dolmayan şerit kartları germez', () => {
    expect(gridAutoColumns()).not.toMatch(/\bfr\b/);
    expect(gridAutoColumns()).not.toContain('minmax(');
  });

  it('genişlik `--hanui-carousel-item` ile ezilebilir', () => {
    expect(gridAutoColumns()).toContain('var(--hanui-carousel-item,');
    expect(read('index.tsx')).toContain("'--hanui-carousel-item-default'");
  });

  it('dolmayan şerit başa yaslanır', () => {
    expect(read('index.module.scss')).toMatch(/justify-content:\s*start;/);
  });
});
