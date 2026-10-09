import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * SOHBET GİRİŞİNİN SINIRI — `src/chat` ana girişe ait her şeyi PAKET ADIYLA alır.
 *
 * ⚠ Sohbet derlemesinde `@ahmetilhn/hanui` dışsal kalır. Bir sohbet dosyası ana girişin bir
 * modülüne GÖRELİ yolla uzanırsa o modülün ikinci bir kopyası `chat.js`e paketlenir:
 * - `theme/context` → sohbet bileşenleri `HanuiProvider`ın metinlerini ve yönlendiricisini GÖRMEZ
 * - `helpers/focus.helper` → kipsel yüzey yığını ikiye bölünür, Escape yanlış yüzeyi kapatır
 * - bir bileşen → CSS'i `chat.css`e de girer, iki kez iner
 * Derleme bunların hiçbirinde kırılmaz; bu test kırar.
 *
 * Göreli yolla alınabilenler yalnızca DURUMSUZ yardımcılar ve SCSS.
 * `@/` takma adı da yasak: dosya başına üretilen tip dosyalarında çözülmeden kalıyor.
 */
const ALLOWED_RELATIVE = [
  /^\.\.\/\.\.\/helpers\/(class-name|component|label|text)\.helper$/,
  /^\.\.\/\.\.\/types\/[\w-]+\.type$/,
  /^\.\.\/\.\.\/constants\/[\w-]+\.constants$/,
  /^\.\/index\.module\.scss$/,
  /^\.\.\/[A-Z]\w*$/,
  /^\.\/[\w-]+$/,
];

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);

    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });

const imports = (path: string): string[] =>
  [...readFileSync(path, 'utf8').matchAll(/(?:from|import)\s+'([^']+)'/g)].map(match => match[1]);

describe('sohbet girişinin sınırı', () => {
  it.each(files('src/chat'))('%s ana girişi yalnızca paket adıyla alır', path => {
    const offenders = imports(path).filter(
      specifier =>
        (specifier.startsWith('.') && !ALLOWED_RELATIVE.some(rule => rule.test(specifier))) ||
        specifier.startsWith('@/'),
    );

    expect(offenders).toEqual([]);
  });

  it('ana giriş sohbet girişini İÇE AKTARMAZ — Hanparça`nın paketine sohbet kodu inmez', () => {
    const offenders = files('src')
      .filter(path => !path.startsWith('src/chat'))
      .filter(path => imports(path).some(specifier => /(^|\/)chat(\/|$)/.test(specifier)));

    expect(offenders).toEqual([]);
  });
});
