import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * KÜTÜPHANE SABİT METİN TAŞIMAZ.
 *
 * Sözleşme `resolveLabel`'ın kendisinde yazılı: hiçbir varsayılan yok, metin
 * verilmediğinde **boş dönüp geliştirme uyarısı** basıyor. Yani "sabit
 * varsayılan yok" bir üslup tercihi değil, çözümleyicinin davranışı.
 *
 * ⚠ Ölçüldü: beş dize bu sözleşmeyi **ihlal ediyordu** ve dördü ekran okuyucu
 * katmanındaydı (`announce`, `Progress.label`) — yani ihlal görsel olarak
 * hiçbir yerde görünmüyordu.
 *
 * | Yer | Dize |
 * |---|---|
 * | `Stat` | artış · azalış · değişim yok |
 * | `Steps` | tamamlandı · şu anki adım · sıradaki |
 * | `Timeline` | tamamlandı · şu an · başarısız |
 * | `TagInput` | `${value} eklendi` · `${value} kaldırıldı` |
 * | `FileUpload` | `{name} çok büyük…` · `${n} dosya eklendi` · `${name} yükleniyor` |
 *
 * ⚠ İLK TARAMAM EKSİK SAYDI. Yalnızca Türkçe'ye özgü harfe (`çğıöşü`)
 * bakıyordu ve `"eklendi"` ile `"yükleniyor"`un bir kısmını kaçırdı; plan
 * **13** diyordu, gerçek **13 + 2**. Tarayıcı artık sözcük dağarcığına
 * bakıyor.
 */

const SOURCE = 'src';

/**
 * Türkçe arayüz metnine işaret eden sözcükler.
 *
 * ⚠ `\b` KULLANILMAZ ve bu ölçülmüş bir tuzak. JS'in kelime sınırı ASCII
 * tabanlı: `ş`, `ı`, `ğ` **kelime karakteri sayılmıyor**, yani `\bartış\b`
 * kalıbı `'artış'` metnini HİÇ eşleştirmiyordu. İlk yazdığım nöbetçi bu
 * yüzden düzeltme geri alındığında da **yeşil kalıyordu** — yani hiçbir şey
 * ölçmüyordu.
 */
const TURKISH_WORDS =
  /(eklendi|kaldırıldı|yükleniyor|tamamlandı|başarısız|bekliyor|artış|azalış|değişim yok|sıradaki|şu anki|şu an|seçili|kopyalandı|çok büyük|en fazla)/i;

/** `src/` altındaki kaynak dosyalar. */
const sourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap(entry => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });

/**
 * Yorumları SOYULMUŞ kaynak.
 *
 * ⚠ ZORUNLU: bu turda üç kez aynı tuzağa düşüldü — açıklamanın kendisi
 * yasakladığı metni içeriyor ve tarama onu ihlal sayıyordu.
 */
const strippedSource = (path: string): string =>
  readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');

/** Sabit Türkçe metin taşıyan dize sabitleri. */
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
    /*
     * ⚠ Boş bir sonuç, taramanın hiçbir dosya okumamasından da gelebilir.
     * Bu iddia kapsamın gerçek olduğunu gösteriyor.
     */
    expect(sourceFiles(SOURCE).length).toBeGreaterThan(90);
    expect(TURKISH_WORDS.test('3 dosya eklendi')).toBe(true);
  });

  it('sözleşme `resolveLabel`da — varsayılan YOK, boş döner ve uyarır', () => {
    const helper = readFileSync('src/helpers/label.helper.ts', 'utf8');

    /*
     * ⚠ Bu iddia i18n işinin ÖNCÜLÜNÜ tutuyor. Çözümleyici bir gün Türkçe
     * varsayılan döndürmeye başlasaydı yukarıdaki tarama yeşil kalır ama
     * kütüphane yine tek dilli olurdu.
     */
    expect(helper).toMatch(/return ''/);
    expect(helper).toMatch(/Eksik metin/);
  });
});
