import { type CodeTokenType, type Grammar, GRAMMARS, MARKUP_TAG, type Rule } from './grammars';

export type { CodeTokenType } from './grammars';

/** Vurgulanmış bir parça; `type` yoksa düz metin. */
export type CodeToken = { text: string; type?: CodeTokenType };

/**
 * Bu boyun üstündeki kod VURGULANMAZ, düz çizilir.
 * ⚠ Maliyet çözümlemede DEĞİL, `<span>` sayısında. Ölçüldü (chromium, galeri sunucusu, React
 * geliştirme kipi): 50 000 karakterlik TypeScript 8,5 ms'de 4 333 parçaya ayrılıyor, ama yalnızca
 * DOM kurulumu + yerleşim 66 ms, React'in ilk çizimi 590 ms ve akan yanıtta her güncelleme 173 ms.
 * 20 000 karakterde aynı ölçüm 3,8 ms · 1 555 parça · 17 ms · 139 ms · 78 ms. Sınırın altında renk,
 * üstünde akıcılık; ~500 satırdan uzun bir sohbet bloğu zaten istisna.
 */
export const HIGHLIGHT_LIMIT = 20_000;

type Compiled = { pattern: RegExp; grammar: Grammar };

/* Ad ardından `(` (Rust/Ruby'de `!(`) — çağrı. Yapışkan: kodu dilimlemeden bakar. */
const CALL = /!?[ \t]*\(/y;
const CONSTANT = /^[A-Z][A-Z\d_]+$/;
/* Bu karakterlerden sonra gelen `/` bir düzenli ifade açar; `)`, `]` ve addan sonra bölmedir. */
const REGEX_AFTER = /[(,=:[!&|?{};~+\-*%<>^]/;
const REGEX_AFTER_WORD = /*#__PURE__*/ new Set([
  'return',
  'typeof',
  'case',
  'do',
  'else',
  'in',
  'of',
  'new',
  'delete',
  'void',
  'throw',
  'yield',
  'await',
]);

const cache = /*#__PURE__*/ new Map<() => Grammar, Compiled>();

const compile = (factory: () => Grammar): Compiled => {
  const known = cache.get(factory);
  if (known) return known;

  const grammar = factory();
  const pattern = new RegExp(grammar.rules.map(([, rule]) => `(${rule.source})`).join('|'), 'gm');
  const compiled = { pattern, grammar };
  cache.set(factory, compiled);

  return compiled;
};

/**
 * Dil adı → dil; tanınmayan ya da verilmeyen dil `undefined` (düz metin).
 * ⚠ Yalnızca KENDİ anahtarları: `GRAMMARS.constructor` `Object`in kendisi — markdown'daki
 * ` ```constructor ` çiti onu dil sanıp bileşeni düşürürdü.
 */
const grammarOf = (language: string | undefined) => {
  const key = language?.trim().toLowerCase();

  return key && Object.hasOwn(GRAMMARS, key) ? GRAMMARS[key] : undefined;
};

const isRegexStart = (code: string, index: number): boolean => {
  let cursor = index - 1;
  while (cursor >= 0 && /\s/.test(code[cursor])) cursor--;
  if (cursor < 0 || REGEX_AFTER.test(code[cursor])) return true;

  const end = cursor + 1;
  while (cursor >= 0 && /[\w$]/.test(code[cursor])) cursor--;

  return REGEX_AFTER_WORD.has(code.slice(cursor + 1, end));
};

const classify = (
  grammar: Grammar,
  word: string,
  code: string,
  index: number,
  end: number,
): CodeTokenType | undefined => {
  CALL.lastIndex = end;
  const isCall = CALL.test(code);

  /* Özellik erişimi (`map.get`, `obj.type`) anahtar kelime DEĞİL. */
  if (code[index - 1] === '.') return isCall ? 'name' : undefined;

  const key = grammar.isCaseInsensitive ? word.toLowerCase() : word;
  if (grammar.keywords?.has(key)) return 'keyword';
  if (grammar.literals?.has(key)) return 'number';
  if (grammar.types?.has(key)) return 'type';
  if (isCall) return 'name';
  if (grammar.hasCapitalTypes && /^[A-Z]/.test(word))
    return CONSTANT.test(word) ? 'number' : 'type';

  return undefined;
};

const tokenize = ({ pattern, grammar }: Compiled, code: string): CodeToken[] => {
  const tokens: CodeToken[] = [];
  const push = (text: string, type?: CodeTokenType) => {
    if (!text) return;
    const last = tokens.at(-1);
    if (last && last.type === type) last.text += text;
    else tokens.push({ text, type });
  };

  let cursor = 0;
  pattern.lastIndex = 0;

  for (let match = pattern.exec(code); match; match = pattern.exec(code)) {
    const [text] = match;
    const { index } = match;
    const end = index + text.length;

    /* Boş eşleşme ilerlemez; kurallar boş eşleşmemeli, bu bir sigorta. */
    if (end === index) {
      pattern.lastIndex = index + 1;
      continue;
    }

    const [kind, , reject]: Rule = grammar.rules[match.indexOf(text, 1) - 1];

    const isRejected =
      (reject !== undefined && index > 0 && reject.test(code[index - 1])) ||
      (kind === 'regex' && !isRegexStart(code, index));

    /* Reddedilen eşleşmenin ilk karakteri düz metin kalır; arama bir sonrakinden sürer. */
    if (isRejected) {
      pattern.lastIndex = index + 1;
      continue;
    }

    push(code.slice(cursor, index));
    cursor = end;

    if (kind === 'word') push(text, classify(grammar, text, code, index, end));
    else if (kind === 'regex') push(text, 'string');
    else if (kind === 'tag') {
      const open = text[1] === '/' ? 2 : 1;
      const name = text.slice(open);
      push(text.slice(0, open), 'punctuation');
      push(name, /^[A-Z]/.test(name) || name.includes('.') ? 'type' : 'keyword');
    } else if (kind === 'markup')
      for (const token of tokenize(compile(MARKUP_TAG), text)) push(token.text, token.type);
    else push(text, kind);
  }

  push(code.slice(cursor));

  return tokens;
};

/**
 * Kodu renk parçalarına ayırır — bağımlılıksız, tek geçişlik bir sözcük çözümleyici.
 * Bir dilbilgisi ÇÖZÜMLEYİCİSİ değil: Shiki düzeyinde doğruluk gerekiyorsa vurgulanmış HTML
 * `CodeBlock`a `html` olarak verilir.
 */
export const highlight = (code: string, language: string | undefined): CodeToken[] => {
  const factory = grammarOf(language);

  return factory && code.length <= HIGHLIGHT_LIMIT
    ? tokenize(compile(factory), code)
    : [{ text: code }];
};
