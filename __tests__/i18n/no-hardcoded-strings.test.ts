import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE = 'src';

const TURKISH_WORDS =
  /(eklendi|kaldırıldı|yükleniyor|tamamlandı|başarısız|bekliyor|artış|azalış|değişim yok|sıradaki|şu anki|şu an|seçili|kopyalandı|çok büyük|en fazla)/i;

const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });

const strippedSource = (path: string): string =>
  readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');

const offenders = (): string[] => {
  const found: string[] = [];

  for (const path of sourceFiles(SOURCE)) {
    strippedSource(path)
      .split('\n')
      .forEach((line, index) => {
        for (const literal of line.matchAll(/(['"`])((?:(?!\1).)*)\1/g)) {
          if (literal[2].length > 3 && TURKISH_WORDS.test(literal[2])) {
            found.push(`${path}:${index + 1} → ${literal[2]}`);
          }
        }
      });
  }

  return found;
};

describe('i18n sözleşmesi', () => {
  it('HİÇBİR bileşen sabit Türkçe metin taşımaz', () => {
    expect(offenders()).toEqual([]);
  });

  it('tarayıcı GERÇEKTEN çalışıyor — kendi kendini ölçmüyor', () => {
    expect(sourceFiles(SOURCE).length).toBeGreaterThan(90);
    expect(TURKISH_WORDS.test('3 dosya eklendi')).toBe(true);
  });

  it('sözleşme `resolveLabel`da — varsayılan YOK, boş döner ve uyarır', () => {
    const helper = readFileSync('src/helpers/label.helper.ts', 'utf8');

    expect(helper).toMatch(/return ''/);
    expect(helper).toMatch(/Eksik metin/);
  });
});
