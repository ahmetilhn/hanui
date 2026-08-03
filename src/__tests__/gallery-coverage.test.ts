import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as hanui from '../index';

/**
 * GALERİ KAPSAMI — görsel regresyonun kör noktası olmasın.
 *
 * <p>Görsel senaryolar `playground/scenarios.tsx` içindeki defterden
 * türetiliyor: deftere girmeyen bir bileşenin anlık görüntüsü hiç alınmaz ve
 * bir token değişikliği onu sessizce bozabilir. "Her bileşen taranıyor"
 * iddiası, listeyi güncellemeyi hatırlamaya bağlı kaldığında bir iddia değil
 * bir temennidir.
 *
 * <h3>Neden defter `import` EDİLMİYOR da metin olarak okunuyor</h3>
 * `playground/` Jest'in `roots`unun dışında ve oraya taşınması, galeri
 * bağımlılıklarını (Vite'a özgü `import.meta`, CSS import'u) test ortamına
 * sokardı. Sorulan soru bundan basit: <em>defterde bu ad bir anahtar olarak
 * geçiyor mu</em>. Metin araması bunu yan etkisiz yanıtlıyor.
 */

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
