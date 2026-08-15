import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * ÖLÜ MIXIN BİRİKMEZ.
 *
 * ⚠ Ölçüldü (2026-08-15): `_mixins.scss` 814 satırdı ve **11 mixin ölüydü**
 * (169 satır). Dördü ayrıca ELLE YENİDEN YAZILMIŞTI — `selected-surface`
 * Chip/Select/RadioCard/Tile içinde, `notice` Alert'te, `aspect` Card'da,
 * `sticky-viewport-height` DataTable'da. Yani ortak tanım çürürken kopyaları
 * çoğalıyordu: kural bir yerde duruyor, davranış başka yerlerde ayrışıyor.
 *
 * ⚠ ÖLÇÜM `_mixins.scss`İN KENDİSİNİ DE TARAR. İlk yazdığım tespit onu
 * dışarıda bırakıyordu ve `hide-scrollbar`ı ölü sanmıştı — oysa `scroll-row`
 * onu çağırıyor. Silinseydi derleme *"Undefined mixin"* ile düşerdi
 * (denendi, düştü). Kendi içindeki çağrılar da kullanımdır.
 */

const MIXINS_FILE = 'src/styles/_mixins.scss';

/** `src/` altındaki tüm `.scss` dosyaları. */
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
    /*
     * ⚠ Bu iddia tarayıcının kapsamını kilitliyor. `_mixins.scss` taramanın
     * dışında bırakılsaydı `hide-scrollbar` ölü görünür ve silinmesi
     * derlemeyi düşürürdü.
     */
    expect(source).toMatch(/@include\s+hide-scrollbar\b/);
    expect(declared).toContain('hide-scrollbar');
  });
});
