import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as hanui from '../index';

/** GALERİ KAPSAMI — görsel regresyonun kör noktası olmasın. */

const source = readFileSync(resolve(__dirname, '../../playground/scenarios.tsx'), 'utf8');

/** React bileşeni mi? `memo`/`forwardRef` FONKSİYON DEĞİL nesne döndürür. */
const isComponent = (value: unknown): boolean =>
  (typeof value === 'function' && /^[A-Z]/.test((value as { name?: string }).name ?? '')) ||
  (typeof value === 'object' && value !== null && '$$typeof' in value);

const exported = Object.entries(hanui)
  .filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value))
  .map(([name]) => name);

describe('galeri defteri `index.ts` ile eşleşir', () => {
  it('dışa verilen her bileşenin galeri senaryosu var', () => {
    const missing = exported.filter(name => !new RegExp(`^  ${name}: \\{`, 'm').test(source));

    expect(missing).toEqual([]);
  });
});
