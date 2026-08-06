import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** API TUTARLILIK DENETÇİSİ. */

const COMPONENTS = resolve(__dirname, '../components');

/** YEREL ÖZNİTELİK ADLARI — `is*` kuralından muaf. */
const NATIVE_BOOLEANS = new Set([
  'disabled',
  'required',
  'checked',
  'readOnly',
  'multiple',
  'autoFocus',
  'open',
  'hidden',
  'inert',
  'loading',
]);

/** `aria-*` ve `data-*` — HTML/ARIA sözleşmesi, bizim adlandırmamız değil. */
const isPlatformAttribute = (name: string): boolean =>
  name.startsWith('aria-') || name.startsWith('data-');

/** Aynı işi yapan ama YANLIŞ adlandırılmış prop'lar → kabul edilen tek ad. */
const FORBIDDEN_ALIASES: Record<string, 'size' | 'tone' | 'variant'> = {
  sizing: 'size',
  scale: 'size',
  color: 'tone',
  intent: 'tone',
  kind: 'variant',
  appearance: 'variant',
};

/** `status` LİSTEDE DEĞİL — ve bu bilinçli bir ayrım. */
const STATE_NOT_TONE = ['status', 'type'];

type PropEntry = { component: string; name: string; type: string };

/** `@deprecated` işaretli prop adları. */
const readDeprecated = (component: string): Set<string> => {
  const file = resolve(COMPONENTS, component, 'index.tsx');

  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    return new Set();
  }

  const names = new Set<string>();

  /* JSDoc blogunun HEMEN ardindaki prop adi. */
  for (const [, name] of source.matchAll(
    /@deprecated[\s\S]*?\*\/\s*\n\s*'?([A-Za-z][\w-]*)'?\??:/g,
  ))
    names.add(name);

  return names;
};

/** `type Props = { … }` bloklarındaki prop adlarını ve tiplerini çıkarır. */
const readProps = (component: string): PropEntry[] => {
  const file = resolve(COMPONENTS, component, 'index.tsx');

  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    return [];
  }

  /* Yorumlar SOKULUR: JSDoc icindeki ornek kod ve prop adlari yanlis
     eslesmeye yol aciyordu. */
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  const entries: PropEntry[] = [];

  for (const [, name, type] of stripped.matchAll(/^\s{2}'?([A-Za-z][\w-]*)'?\??:\s*([^;]+);$/gm))
    entries.push({ component, name, type: type.trim() });

  return entries;
};

const components = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name !== '__tests__')
  .map(entry => entry.name);

const props = components.flatMap(readProps);

const deprecated = new Map(components.map(component => [component, readDeprecated(component)]));

/** Prop `@deprecated` işaretli mi — yani belgelenmiş bir göç yolu mu. */
const isDeprecated = (entry: PropEntry): boolean =>
  deprecated.get(entry.component)?.has(entry.name) ?? false;

describe('API tutarlılığı', () => {
  it('bileşenlerin prop`ları okunabildi', () => {
    /* Ayristirici bozulursa test SESSIZCE gecerdi: sifir prop bulmak "hepsi
       temiz" gibi gorunur. */
    expect(components.length).toBeGreaterThan(40);
    expect(props.length).toBeGreaterThan(150);
  });

  /*
   * Ayni kavram bir bilesende `isOpen`, digerinde `open` olunca tuketici her
   * bilesende sozlesmeyi yeniden ogrenmek zorunda kaliyordu.
   */
  it('boolean prop`lar `is*` / `has*` ile başlar', () => {
    const offenders = props
      .filter(entry => /^boolean$/.test(entry.type))
      .filter(entry => !/^(is|has)[A-Z]/.test(entry.name))
      .filter(entry => !NATIVE_BOOLEANS.has(entry.name) && !isPlatformAttribute(entry.name))
      .map(entry => `${entry.component}.${entry.name}`);

    expect(offenders).toEqual([]);
  });

  it('olay prop`ları `on*` ile başlar', () => {
    const offenders = props
      .filter(entry => /=>\s*(void|Promise<void>|void \| Promise<void>)/.test(entry.type))
      .filter(entry => !/^on[A-Z]/.test(entry.name))
      /* Bicimlendirici ve uretici fonksiyonlar OLAY DEGIL: bir deger
         donduruyorlar ve `on*` adlandirmasi onlari olay saniyor. */
      .filter(entry => !/^(format|build|render|to)[A-Z]/.test(entry.name))
      .map(entry => `${entry.component}.${entry.name}`);

    expect(offenders).toEqual([]);
  });

  it('ölçü/ton/varyant için TEK ad kullanılır', () => {
    const offenders = props
      .filter(entry => entry.name in FORBIDDEN_ALIASES && !STATE_NOT_TONE.includes(entry.name))
      .filter(entry => !isDeprecated(entry))
      .map(entry => `${entry.component}.${entry.name} → ${FORBIDDEN_ALIASES[entry.name]}`);

    expect(offenders).toEqual([]);
  });

  /*
   * Muafiyet BEDAVA DEGIL: unutulan bir `@deprecated`, sessizce kalici hale
   * gelen bir istisnaydi. Her muaf prop `MIGRATION.md`de kayitli olmali.
   */
  it('her `@deprecated` prop `MIGRATION.md`de kayıtlı', () => {
    const migration = readFileSync(resolve(__dirname, '../../docs/MIGRATION.md'), 'utf8');

    const undocumented = [...deprecated.entries()].flatMap(([component, names]) =>
      [...names]
        .filter(name => !migration.includes(`${component}.${name}`))
        .map(name => `${component}.${name}`),
    );

    expect(undocumented).toEqual([]);
  });

  /*
   * `className` ve `testId` HER bilesende ayni adi tasimali: biri `class`,
   * digeri `cssClass` yazdiginda tuketici hangisinin nerede oldugunu
   * hatirlamak zorunda kaliyordu.
   */
  it('`className` ve `testId` adları tekil', () => {
    const aliases = props
      .filter(entry => /^(class|cssClass|classNames|dataTestId|testID)$/.test(entry.name))
      .map(entry => `${entry.component}.${entry.name}`);

    expect(aliases).toEqual([]);
  });
});
