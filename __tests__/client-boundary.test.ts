import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * İSTEMCİ SINIRI — DOSYA BAŞINA (6.0).
 *
 * 5.x paketin tamamına tek bir `'use client'` yazıyordu; 6.0'da yönerge dosya başına çıktıya iner
 * (`vite.modules.ts`). O yüzden kural artık derlemeyle değil BURADA korunur:
 * - Kanca (`useX(`), tarayıcı API'si (`window`, `document`, `navigator`, `createPortal`) ya da
 *   kendi içinde tanımladığı bir olay işleyicisi olan bileşen `'use client'` TAŞIR — yoksa sunucu
 *   bileşeni olarak çizilir ve React ilk kancada düşer.
 * - Hiçbirini kullanmayan bileşen yönerge TAŞIMAZ — taşısaydı tüketicinin sunucu bileşeninde her
 *   `Button` bir hidrasyon sınırı olurdu (ölçüldü: ana sayfada 37 düğme + 121 çip, 420–548 istemci
 *   referansı; handijit.com, Kasım 2026).
 * - Sunucuda çizilebilen bileşen, istemci bileşenine (`UiLink`, `Spinner`) İŞLEV PROP'U
 *   geçirmez: RSC serileştirmesi işlevi taşıyamaz. Statik olarak yakalanabilen biçim `onX={…}`
 *   özniteliğidir; `{...rest}` yayımı tüketicinin sorumluluğundadır (sunucudan işlev gelemez).
 */
const ROOT = join(__dirname, '..');
const COMPONENTS = join(ROOT, 'src/components');

const DIRECTIVE = /^\s*(['"])use client\1;?/;
const HOOK = /\buse[A-Z]\w*\(/;
const BROWSER = /\b(createPortal|window|document|navigator|localStorage|matchMedia)\b/;
const INLINE_HANDLER = /\bon[A-Z]\w*=\{\s*(?:\(|function\b|\w+\s*=>)/;

const strip = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const components = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort((a, b) => a.localeCompare(b));

const sourceOf = (name: string): string =>
  strip(readFileSync(join(COMPONENTS, name, 'index.tsx'), 'utf8'));

const needsClient = (source: string): boolean =>
  HOOK.test(source) || BROWSER.test(source) || INLINE_HANDLER.test(source);

/*
 * SUNUCUDA ÇİZİLEBİLENLER — açık liste: bir bileşene kanca eklemek onu bu listeden düşürür ve bu
 * test kırar; düşüş bilinçliyse liste güncellenir ve CHANGELOG'a yazılır (tüketici için davranış
 * değişikliği: bileşen yeniden istemci sınırı olur).
 */
const SERVER_SAFE = [
  'Alert',
  'Badge',
  'Button',
  'Card',
  'Chip',
  'Divider',
  'EmptyState',
  'IconButton',
  'Kbd',
  'PageHeader',
  'Panel',
  'Progress',
  'SectionHeader',
  'Skeleton',
  'StatusDot',
  'SummaryCard',
  'TextLink',
  'Tile',
];

describe("'use client' dosya başına", () => {
  it.each(components)('%s: yönerge kullanımına göre var ya da yok', name => {
    const source = sourceOf(name);
    const hasDirective = DIRECTIVE.test(source);

    expect({ name, hasDirective }).toEqual({ name, hasDirective: needsClient(source) });
  });

  it('sunucuda çizilebilen küme sabit', () => {
    const serverSafe = components.filter(name => !DIRECTIVE.test(sourceOf(name)));

    expect(serverSafe).toEqual(SERVER_SAFE);
  });

  it.each(SERVER_SAFE)('%s istemci bileşenine satır içi işlev geçirmez', name => {
    const source = sourceOf(name);
    const handlers = [...source.matchAll(/\bon[A-Z]\w*=\{([^}]*)\}/g)]
      .map(match => match[1].trim())
      .filter(value => /^(\(|function\b|\w+\s*=>)/.test(value));

    expect(handlers).toEqual([]);
  });

  it('kancalar ve tema bağlamı istemci modülleri', () => {
    const files = [
      ...readdirSync(join(ROOT, 'src/hooks')).map(file => join('src/hooks', file)),
      'src/theme/context.ts',
      'src/theme/UiProvider.tsx',
    ];
    const offenders = files.filter(
      file => !DIRECTIVE.test(strip(readFileSync(join(ROOT, file), 'utf8'))),
    );

    expect(offenders).toEqual([]);
  });

  it('cephe (`index.ts`) yalnızca yeniden dışa aktarım taşır — `optimizePackageImports` için saf', () => {
    const statements = strip(readFileSync(join(ROOT, 'src/index.ts'), 'utf8'))
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .filter(
        line => !line.startsWith('export') && !line.startsWith('}') && !/^[\w,\s]+$/.test(line),
      )
      .filter(line => !/^(type\s+)?\w+,?$/.test(line) && !line.startsWith('from '));

    expect(statements).toEqual([]);
  });
});
