import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * ALT GİRİŞLERİN SINIRI — `src/chat` ve `src/charts` ana girişe ait her şeyi PAKET ADIYLA alır.
 *
 * ⚠ Alt giriş derlemesinde `@ahmetilhn/hanui` dışsal kalır. Bir alt giriş dosyası ana girişin bir
 * modülüne GÖRELİ yolla uzanırsa o modülün ikinci bir kopyası `chat.js` / `charts.js`e paketlenir:
 * - `theme/context` → alt giriş bileşenleri `HanuiProvider`ın metinlerini ve yönlendiricisini GÖRMEZ
 * - `helpers/focus.helper` → kipsel yüzey yığını ikiye bölünür, Escape yanlış yüzeyi kapatır
 * - bir bileşen → CSS'i alt girişin CSS'ine de girer, iki kez iner
 * Derleme bunların hiçbirinde kırılmaz; bu test kırar.
 *
 * Göreli yolla alınabilenler yalnızca DURUMSUZ yardımcılar, SCSS ve girişin KENDİ dosyaları.
 * `@/` takma adı da yasak: dosya başına üretilen tip dosyalarında çözülmeden kalıyor.
 */
const ALLOWED_RELATIVE = [
  /^\.\.\/\.\.\/helpers\/(class-name|component|label|text)\.helper$/,
  /^\.\.\/\.\.\/types\/[\w-]+\.type$/,
  /^\.\.\/\.\.\/constants\/[\w-]+\.constants$/,
  /^\.\/(index|[A-Z]\w*|[a-z][\w-]*)\.module\.scss$/,
  /* Kardeş bileşen (`../Disclosure`) ve grafiklerin ortak çekirdeği (`../core/scale`). */
  /^\.\.\/[A-Z]\w*$/,
  /^\.\.?\/core\/[\w-]+$/,
  /^\.\/[\w-]+$/,
];

const ENTRIES = ['src/chat', 'src/charts'];

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);

    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });

const imports = (path: string): string[] =>
  [...readFileSync(path, 'utf8').matchAll(/(?:from|import)\s+'([^']+)'/g)].map(match => match[1]);

describe.each(ENTRIES)('%s girişinin sınırı', entry => {
  it.each(files(entry))('%s ana girişi yalnızca paket adıyla alır', path => {
    const offenders = imports(path).filter(
      specifier =>
        (specifier.startsWith('.') && !ALLOWED_RELATIVE.some(rule => rule.test(specifier))) ||
        specifier.startsWith('@/'),
    );

    expect(offenders).toEqual([]);
  });

  it('başka bir alt girişi İÇE AKTARMAZ — iki alt giriş birbirinden bağımsız indirilir', () => {
    const others = ENTRIES.filter(other => other !== entry).map(other => other.replace('src/', ''));
    const offenders = files(entry).filter(path =>
      imports(path).some(specifier =>
        others.some(other => new RegExp(`(^|/)${other}(/|$)`).test(specifier)),
      ),
    );

    expect(offenders).toEqual([]);
  });
});

it('ana giriş alt girişleri İÇE AKTARMAZ — yalnızca ana girişi kullanan uygulamaya sohbet ya da grafik kodu inmez', () => {
  const offenders = files('src')
    .filter(path => !ENTRIES.some(entry => path.startsWith(entry)))
    .filter(path => imports(path).some(specifier => /(^|\/)(chat|charts)(\/|$)/.test(specifier)));

  expect(offenders).toEqual([]);
});
