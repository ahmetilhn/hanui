import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MIXINS_FILE = 'src/styles/_mixins.scss';

const styleFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return styleFiles(path);
    return path.endsWith('.scss') ? [path] : [];
  });

describe('_mixins.scss', () => {
  const source = readFileSync(MIXINS_FILE, 'utf8');
  const declared = [...source.matchAll(/^@mixin\s+([a-z0-9-]+)/gm)].map(match => match[1]);
  const allStyles = styleFiles('src')
    .map(path => readFileSync(path, 'utf8'))
    .join('\n');

  it('tanımlı mixin bulunur — tarayıcı gerçekten okuyor', () => {
    expect(declared.length).toBeGreaterThan(30);
  });

  it('TANIMLI HER MIXIN KULLANILIR', () => {
    const dead = declared.filter(name => !new RegExp(`@include\\s+${name}\\b`).test(allStyles));

    expect(dead).toEqual([]);
  });

  it('kendi içindeki çağrı da KULLANIMDIR — `scroll-row` → `hide-scrollbar`', () => {
    expect(source).toMatch(/@include\s+hide-scrollbar\b/);
    expect(declared).toContain('hide-scrollbar');
  });
});
