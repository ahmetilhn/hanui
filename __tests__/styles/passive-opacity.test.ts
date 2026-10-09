import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * KESIRLI `opacity` = SOLUKLASTIRMA. Depodaki her mesru kullanim bir gecisin ucu (`0` ya da
 * `1`); arada kalan bir deger metni de soluklastirip kontrast esigini sessizce dusuruyor.
 *
 * ⚠ KURAL CLAUDE.md'DE YAZILIYDI ve on bir bilesen yine de cignedi: pasif hal ve dinlenme vurgusu
 * `opacity: 0.35-0.6` ile ciziliyordu. stylelint `opacity`yi yasaklayamaz (gecislerde mesru);
 * nobetci bu test.
 */
const scssFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return scssFiles(path);

    return path.endsWith('.scss') ? [path] : [];
  });

const fractionalOpacity = (path: string): string[] =>
  readFileSync(path, 'utf8').match(/^\s*opacity:\s*(?![01];)[^;\s][^;]*;/gm) ?? [];

describe('opacity ile soluklaştırma', () => {
  it.each(scssFiles('src'))('%s kesirli opacity yazmaz', path => {
    expect(fractionalOpacity(path)).toEqual([]);
  });
});
