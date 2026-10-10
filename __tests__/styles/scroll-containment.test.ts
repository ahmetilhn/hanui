import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * KAYDIRMA KABI KAPSAYICI BLOKTUR. `overflow: auto|scroll` yazan her kural `position` da yazar.
 *
 * Görsel olarak gizli metin (`visually-hidden`) `position: absolute` ile en yakın KONUMLU ataya göre
 * yerleşir. Kab konumlu değilse o ata kabın dışındadır: etiket kırpılmaz, kabın dibindeki statik
 * yerinde durup her atanın kaydırılabilir taşmasını uzatır.
 *
 * ⚠ TÜKETİCİDE ÖLÇÜLDÜ (2026-10-10): `ChatThread`in kökü konumluydu, kaydırma kabı değil; `ToolCall`
 * kartlarındaki `StatusDot` adları uygulama çerçevesini programla kaydırılabilir yaptı ve odak
 * iadesinde yerleşim ~210 px kaydı. Taramada 18 kaydırma kabından 16'sı konumsuzdu (konumlu
 * olanlar: `DataTable` ve satır içi `position: fixed` alan `Menu`); `TerminalOutput` kendi stderr
 * önekini sızdırıyordu. Geometri nöbetçisi `e2e/scroll-containment.spec.ts`; bu test kuralı her
 * kaba yayar.
 */

/** Konumu SCSS'te değil satır içi stilde olan kablar — gerekçesiyle. */
const POSITIONED_ELSEWHERE: Record<string, readonly string[]> = {
  /* `usePositioning` her çizimde `position: fixed` yazar (ilk çizim dahil). */
  'src/components/Menu/index.module.scss': ['.menu'],
};

const SCROLLER = /^overflow(-x|-y|-block|-inline)?\s*:\s*(auto|scroll)\b/;
const POSITIONED = /^position\s*:\s*(relative|absolute|fixed|sticky)\b/;

type Rule = {
  selector: string;
  declarations: string[];
  parent: Rule | null;
};

const scssFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return scssFiles(path);

    return path.endsWith('.scss') ? [path] : [];
  });

const stripComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Kural ağacı — yalnızca bu testin ihtiyacı kadar: seçici, kendi bildirimleri, ebeveyn. */
const parse = (source: string): Rule[] => {
  const root: Rule = { selector: '', declarations: [], parent: null };
  const rules: Rule[] = [];
  const text = stripComments(source);
  let current = root;
  let buffer = '';

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    /* `#{…}` ara değeri bir blok DEĞİL. */
    if (char === '#' && text[index + 1] === '{') {
      const end = text.indexOf('}', index);
      buffer += text.slice(index, end + 1);
      index = end;
    } else if (char === '{') {
      const rule: Rule = { selector: buffer.trim(), declarations: [], parent: current };
      rules.push(rule);
      current = rule;
      buffer = '';
    } else if (char === ';' || char === '}') {
      if (buffer.trim()) current.declarations.push(buffer.trim());
      if (char === '}') current = current.parent ?? root;
      buffer = '';
    } else buffer += char;
  }

  return rules;
};

/** `position` yazan mixin'ler (`tap-target`, `sticky-below-header`…) — include'ları da sayılır. */
const positioningMixins = new Set(
  parse(readFileSync('src/styles/_mixins.scss', 'utf8'))
    .filter(rule => rule.selector.startsWith('@mixin '))
    .filter(rule => rule.declarations.some(declaration => POSITIONED.test(declaration)))
    .map(rule => rule.selector.replace(/^@mixin\s+([\w-]+).*$/, '$1')),
);

/** Aynı öğeye uygulanan bloklar: BEM değiştiricisi (`&--x`), durum (`&:hover`, `&[…]`), medya. */
const sameElement = (rule: Rule): boolean =>
  /^(&(--|\.|:|\[)|@include |@media )/.test(rule.selector);

const isPositioned = (rule: Rule | null): boolean => {
  if (!rule) return false;

  const own = rule.declarations.some(
    declaration =>
      POSITIONED.test(declaration) ||
      positioningMixins.has(declaration.replace(/^@include\s+([\w-]+).*$/, '$1')),
  );

  return own || (sameElement(rule) && isPositioned(rule.parent));
};

const unpositionedScrollers = (path: string): string[] =>
  parse(readFileSync(path, 'utf8'))
    .filter(rule => rule.declarations.some(declaration => SCROLLER.test(declaration)))
    .filter(rule => !isPositioned(rule))
    .map(rule => rule.selector)
    .filter(selector => !(POSITIONED_ELSEWHERE[path] ?? []).includes(selector));

describe('kaydırma kabı kapsayıcı bloktur', () => {
  it.each(scssFiles('src'))('%s — her kaydırma kabı konumlu', path => {
    expect(unpositionedScrollers(path)).toEqual([]);
  });

  it('istisnalar bayat değil: kab hâlâ var ve SCSS hâlâ konum yazmıyor', () => {
    for (const [path, selectors] of Object.entries(POSITIONED_ELSEWHERE)) {
      const scrollers = parse(readFileSync(path, 'utf8')).filter(rule =>
        rule.declarations.some(declaration => SCROLLER.test(declaration)),
      );

      for (const selector of selectors) {
        const rule = scrollers.find(candidate => candidate.selector === selector);

        expect(rule).toBeDefined();
        expect(isPositioned(rule ?? null)).toBe(false);
      }
    }
  });

  it('ayrıştırıcı ara değeri blok saymaz ve değiştiriciyi ebeveynine bağlar', () => {
    const rules = parse(`
      .a {
        position: relative;
        margin: calc(-1 * #{$space-2});
        &--b { overflow-y: auto; }
        &__c { overflow: auto; }
      }
    `);

    expect(rules.map(rule => rule.selector)).toEqual(['.a', '&--b', '&__c']);
    expect(isPositioned(rules[1])).toBe(true);
    expect(isPositioned(rules[2])).toBe(false);
  });
});
