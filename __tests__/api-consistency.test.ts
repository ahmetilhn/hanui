import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const COMPONENTS = resolve(__dirname, '../src/components');

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

const isPlatformAttribute = (name: string): boolean =>
  name.startsWith('aria-') || name.startsWith('data-');

const FORBIDDEN_ALIASES: Record<string, 'size' | 'tone' | 'variant'> = {
  sizing: 'size',
  scale: 'size',
  color: 'tone',
  intent: 'tone',
  kind: 'variant',
  appearance: 'variant',
};

const STATE_NOT_TONE = ['status', 'type'];

type PropEntry = { component: string; name: string; type: string };

const readDeprecated = (component: string): Set<string> => {
  const file = resolve(COMPONENTS, component, 'index.tsx');

  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    return new Set();
  }

  const names = new Set<string>();

  for (const [, name] of source.matchAll(
    /@deprecated[\s\S]*?\*\/\s*\n\s*'?([A-Za-z][\w-]*)'?\??:/g,
  ))
    names.add(name);

  return names;
};

const readProps = (component: string): PropEntry[] => {
  const file = resolve(COMPONENTS, component, 'index.tsx');

  let source: string;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    return [];
  }

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

const isDeprecated = (entry: PropEntry): boolean =>
  deprecated.get(entry.component)?.has(entry.name) ?? false;

describe('API tutarlılığı', () => {
  it('bileşenlerin prop`ları okunabildi', () => {
    expect(components.length).toBeGreaterThan(40);
    expect(props.length).toBeGreaterThan(150);
  });

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

  it('her `@deprecated` prop `CLAUDE.md`de kayıtlı', () => {
    const migration = readFileSync(resolve(__dirname, '../CLAUDE.md'), 'utf8');

    const undocumented = [...deprecated.entries()].flatMap(([component, names]) =>
      [...names]
        .filter(name => !migration.includes(`${component}.${name}`))
        .map(name => `${component}.${name}`),
    );

    expect(undocumented).toEqual([]);
  });

  it('`className` ve `testId` adları tekil', () => {
    const aliases = props
      .filter(entry => /^(class|cssClass|classNames|dataTestId|testID)$/.test(entry.name))
      .map(entry => `${entry.component}.${entry.name}`);

    expect(aliases).toEqual([]);
  });
});
