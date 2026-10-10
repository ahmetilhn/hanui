/**
 * DİL TANIMLARI — yerleşik vurgulayıcının (`highlight.ts`) kuralları.
 *
 * Her dil SIRALI bir kural listesidir: aynı konumda eşleşen İLK kural kazanır. Kurallar tek bir
 * düzenli ifadede birleşir (`gm` bayraklı), bu yüzden:
 * - kural ifadeleri bayrak TAŞIMAZ ve YAKALAYAN GRUP içermez (`(?:…)` yazılır) — eşleşen kuralı
 *   grubun sırası söyler;
 * - geriye bakış (`(?<=…)`) KULLANILMAZ: Safari 16.4 öncesinde ifade kurulurken `SyntaxError`
 *   atıyor ve kod bloğu çizilemiyordu. Önceki karaktere bağlı kurallar `reject` ile yazılır.
 *
 * ⚠ Kapanmamış yorum ve dize metnin SONUNA kadar uzanır (`(?![\s\S])`): akan yanıtta blok henüz
 * bitmemişken renk doğru tarafta kalır.
 *
 * Kurallar ve kelime kümeleri ilk kullanımda kurulur (fabrika): modül düzeyinde çağrı yok, sohbet
 * girişinden yalnızca başka bir bileşen alan uygulamaya vurgulayıcı inmez.
 */

/** Vurgulanan parçanın türü; her biri bir renk token'ına bağlanır (`index.module.scss`). */
export type CodeTokenType =
  | 'comment'
  | 'keyword'
  | 'string'
  | 'number'
  | 'name'
  | 'type'
  | 'punctuation'
  | 'inserted'
  | 'deleted';

/**
 * Kuralın türü. Bir `CodeTokenType` eşleşmeyi olduğu gibi boyar; ötekiler ek karar ister:
 * - `word` — tanıtıcı; anahtar kelime / sabit / tip / çağrı ayrımını `classify` yapar
 * - `tag` — `<ad` ya da `</ad`: ayraç noktalama, ad etiket (büyük harfle başlıyorsa bileşen → tip)
 * - `markup` — işaretleme etiketinin tamamı; içi `MARKUP_TAG` ile ayrıca vurgulanır
 * - `regex` — JS düzenli ifade değişmezi; `/` bölme işareti de olabildiği için bağlama bakılır
 */
export type RuleKind = CodeTokenType | 'word' | 'tag' | 'markup' | 'regex';

/** `[tür, ifade, reject?]` — `reject` eşleşmeden ÖNCEKİ karaktere uyarsa eşleşme reddedilir. */
export type Rule = readonly [kind: RuleKind, pattern: RegExp, reject?: RegExp];

export type Grammar = {
  rules: readonly Rule[];
  keywords?: ReadonlySet<string>;
  /** Sabit değişmezler (`true`, `null`, `None`) — sayıyla aynı renk. */
  literals?: ReadonlySet<string>;
  /** Yerleşik tipler (`string`, `int`, `varchar`). */
  types?: ReadonlySet<string>;
  /** Büyük harfle başlayan ad tiptir (`Button`); TAMAMI büyük harf olan sabittir (`MAX_SIZE`). */
  hasCapitalTypes?: boolean;
  /** SQL: anahtar kelime ve tip kümesi küçük harfle yazılır, kelime küçültülerek aranır. */
  isCaseInsensitive?: boolean;
};

const words = (list: string): ReadonlySet<string> => new Set(list.split(' '));

/* --- Ortak parçalar ------------------------------------------------------ */

/* Tek satırlık dize; kapanmamışsa satır sonunda biter (akış). */
const DQ = /"(?:[^"\\\n]|\\.)*"?/;
const SQ = /'(?:[^'\\\n]|\\.)*'?/;
/* Şablon dizesi satır aşar. */
const BACKTICK = /`(?:[^`\\]|\\[\s\S])*`?/;
const TRIPLE_DQ = /"""[\s\S]*?(?:"""|(?![\s\S]))/;
const TRIPLE_SQ = /'''[\s\S]*?(?:'''|(?![\s\S]))/;
/*
 * Karakter değişmezi: tek karakter ya da kaçış ve HEMEN kapanış. Rust'ın yaşam süresi (`'a`)
 * kapanmadığı için eşleşmez — tek tırnağı dize sayan bir kural satırın geri kalanını boyuyordu.
 */
const CHAR = /'(?:\\[^\n]{1,8}?|[^'\\\n])'/;
const SLASH_COMMENT = /\/\/.*/;
const BLOCK_COMMENT = /\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/;
const HASH_COMMENT = /#.*/;
const NUMBER =
  /\b(?:0[xX][\dA-Fa-f_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)[A-Za-z]*\b/;
const WORD = /[A-Za-z_]\w*/;
const PUNCTUATION = /[{}[\]();,.:]/;
/* Dekoratör ve açıklama (`@Component`, `@Override`, `@dataclass`) — çağrı gibi boyanır. */
const DECORATOR = /@[A-Za-z_][\w.]*/;
/* Önceki karakter tanıtıcının parçasıysa (`a#b`, `foo<T>`) kural geçerli değil. */
const AFTER_WORD = /[\w$)\]]/;
const AFTER_NON_SPACE = /\S/;

/* --- Kelime kümeleri ----------------------------------------------------- */

const JS_KEYWORDS =
  'break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield async await of static get set as from';
const TS_KEYWORDS =
  'type interface enum implements namespace declare abstract private protected public readonly keyof infer is satisfies override module asserts unique';
const JS_LITERALS = 'true false null undefined NaN Infinity';
const TS_TYPES = 'string number boolean any unknown never object symbol bigint';

/* C ailesinin ortak tipleri ve sabitleri — dillerin birleşimi; yalnızca renk seçer. */
const C_TYPES =
  'int long short char float double bool boolean byte void unsigned signed string str usize isize u8 u16 u32 u64 u128 i8 i16 i32 i64 i128 f32 f64 rune uint uint8 uint16 uint32 uint64 int8 int16 int32 int64 float32 float64 error any decimal size_t';
const C_LITERALS = 'true false null nil nullptr NULL';

const C_KEYWORDS =
  'auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while';
const CPP_KEYWORDS = `${C_KEYWORDS} alignas alignof catch class constexpr consteval const_cast decltype delete dynamic_cast explicit export friend mutable namespace new noexcept operator private protected public reinterpret_cast static_assert static_cast template this thread_local throw try typeid typename using virtual override final concept requires co_await co_return co_yield`;
const CSHARP_KEYWORDS =
  'abstract as async await base break case catch checked class const continue default delegate do dynamic else enum event explicit extern finally fixed for foreach get goto if implicit in init interface internal is lock namespace new operator out override params partial private protected public readonly record ref return sealed set sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using var virtual volatile when where while yield';
const JAVA_KEYWORDS =
  'abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package permits private protected public record return sealed static strictfp super switch synchronized this throw throws transient try var volatile while yield';
const KOTLIN_KEYWORDS =
  'abstract annotation as break by catch class companion const constructor continue crossinline data do else enum external final finally for fun get if import in infix init inline inner interface internal is lateinit noinline object open operator out override package private protected public reified return sealed set super suspend this throw try typealias val var vararg when where while';
const SWIFT_KEYWORDS =
  'actor as associatedtype async await break case catch class continue default defer deinit do else enum extension fallthrough fileprivate final for func guard if import in init inout internal is lazy let mutating open operator override private protocol public repeat rethrows return self Self some static struct subscript super switch throw throws try typealias var weak where while';
const GO_KEYWORDS =
  'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var';
const RUST_KEYWORDS =
  'as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait type unsafe use where while';
const PHP_KEYWORDS =
  'abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new or print private protected public readonly require require_once return static switch throw trait try unset use var while xor yield';

const BASH_KEYWORDS =
  'if then else elif fi for while until do done case esac in function return local export select time break continue declare readonly unset shift source alias exit';
const DOCKER_KEYWORDS =
  'FROM AS RUN CMD LABEL EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL MAINTAINER';

/* --- Diller -------------------------------------------------------------- */

const javascript = (isTyped: boolean, hasJsx: boolean): Grammar => ({
  rules: [
    ['comment', SLASH_COMMENT],
    ['comment', BLOCK_COMMENT],
    ['string', DQ],
    ['string', SQ],
    ['string', BACKTICK],
    /*
     * Düzenli ifade. Tamamı (kapanış `/` ve bayraklar) önce gelir; alternatifler AYRIK olduğu
     * için geri dönüş doğrusaldır.
     * ⚠ Karakter sınıfının kapanışı bu kuralda ZORUNLU. `\]?` dıştaki tekrar ve sondaki `/` ile
     * birkaç bin `[`de üstel geri dönüş yapıp sayfayı kilitliyordu.
     * Kapanmamış ifade alttaki kural: sonda aranan bir `/` yok, bu yüzden başarısız olup geri
     * dönmez; gövde satır sonuna kadar boyanır.
     */
    ['regex', /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuvy]*/],
    ['regex', /\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]?|[^/\\\n[])*/],
    /*
     * Bileşen etiketi yalnızca JSX'te; TS'te `<` bir tür parametresi ya da karşılaştırma. Açılış
     * etiketi addan sonra gelemez (`useState<string>`); kapanış gelebilir (`Kaydet</Button>`).
     */
    ...(hasJsx
      ? ([
          ['tag', /<\/[A-Za-z][\w.:-]*/],
          ['tag', /<[A-Za-z][\w.:-]*/, AFTER_WORD],
        ] as const)
      : []),
    ['name', DECORATOR],
    ['number', NUMBER],
    ['word', /[A-Za-z_$][\w$]*/],
    ['punctuation', PUNCTUATION],
  ],
  keywords: words(isTyped ? `${JS_KEYWORDS} ${TS_KEYWORDS}` : JS_KEYWORDS),
  literals: words(JS_LITERALS),
  types: isTyped ? words(TS_TYPES) : undefined,
  hasCapitalTypes: true,
});

/** C ailesi: ortak kurallar + dilin anahtar kelimeleri. `extra` ortak kurallardan ÖNCE gelir. */
const cFamily = (keywords: string, extra: readonly Rule[] = []): Grammar => ({
  rules: [
    ...extra,
    ['comment', SLASH_COMMENT],
    ['comment', BLOCK_COMMENT],
    /* Önişlemci (`#include`) ve Rust özniteliği (`#[derive(Debug)]`). */
    ['keyword', /^[ \t]*#[ \t]*[a-z]+|#!?\[[^\]\n]*\]/],
    ['string', TRIPLE_DQ],
    ['string', DQ],
    ['string', CHAR],
    /* Go'nun ham dizesi. */
    ['string', BACKTICK],
    ['name', DECORATOR],
    ['number', NUMBER],
    ['word', WORD],
    ['punctuation', PUNCTUATION],
  ],
  keywords: words(keywords),
  literals: words(C_LITERALS),
  types: words(C_TYPES),
  hasCapitalTypes: true,
});

const python = (): Grammar => ({
  rules: [
    ['comment', HASH_COMMENT],
    [
      'string',
      /(?:\b[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|(?![\s\S]))|'''[\s\S]*?(?:'''|(?![\s\S])))/,
    ],
    ['string', /(?:\b[rRbBuUfF]{1,2})?(?:"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)/],
    ['name', DECORATOR],
    ['number', NUMBER],
    ['word', WORD],
    ['punctuation', PUNCTUATION],
  ],
  keywords: words(
    'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case',
  ),
  literals: words('True False None'),
  types: words('int float str bool list dict set tuple bytes object'),
  hasCapitalTypes: true,
});

const ruby = (): Grammar => ({
  rules: [
    ['comment', HASH_COMMENT],
    ['string', DQ],
    ['string', SQ],
    /* Sembol (`:ad`) sabittir; `Foo::Bar` içindeki `:Bar` değil. */
    ['number', /:[A-Za-z_]\w*[?!]?/, /[\w:]/],
    ['name', /@{1,2}[A-Za-z_]\w*/],
    ['number', NUMBER],
    ['word', /[A-Za-z_]\w*[?!]?/],
    ['punctuation', PUNCTUATION],
  ],
  keywords: words(
    'alias and begin break case class def defined? do else elsif end ensure for if in module next not or redo rescue retry return self super then undef unless until when while yield require require_relative attr_accessor attr_reader attr_writer private protected public raise',
  ),
  literals: words('true false nil'),
  hasCapitalTypes: true,
});

const bash = (keywords: string): Grammar => ({
  rules: [
    /* `#` yorum açar yalnızca kelime başında: `$#`, `a#b` yorum değil. */
    ['comment', HASH_COMMENT, /[^\s;|&(]/],
    /* Kabukta çift tırnak satır aşar, tek tırnak kaçış tanımaz. */
    ['string', /"(?:[^"\\]|\\[\s\S])*"?/],
    ['string', /'[^']*'?/],
    ['name', /\$(?:\{[^}\n]*\}?|[A-Za-z_]\w*|[@#?$!*\d-])/],
    ['number', /\b\d+\b/],
    ['word', /[A-Za-z_][\w-]*/],
    ['punctuation', /[{}[\]();|&]/],
  ],
  keywords: words(keywords),
});

const json = (): Grammar => ({
  rules: [
    ['comment', SLASH_COMMENT],
    ['comment', BLOCK_COMMENT],
    /* Anahtar: ardından `:` gelen dize. */
    ['name', /"(?:[^"\\\n]|\\.)*"(?=\s*:)/],
    ['string', DQ],
    ['number', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/],
    ['word', WORD],
    ['punctuation', /[{}[\],:]/],
  ],
  literals: words('true false null'),
});

const yaml = (): Grammar => ({
  rules: [
    ['comment', HASH_COMMENT, AFTER_NON_SPACE],
    /* Anahtar; ilk karakteri `-` olamaz (`- ad:` bir liste öğesi). */
    [
      'name',
      /(?:"(?:[^"\\\n]|\\.)*"|'[^'\n]*'|[\w$./][\w$./-]*(?:[ \t]+[\w$./-]+)*)(?=[ \t]*:(?:[ \t]|$))/,
    ],
    ['string', DQ],
    ['string', SQ],
    /* Çapa (`&ad`), takma ad (`*ad`), etiket (`!!str`). */
    ['type', /[&*][\w-]+|!!?[\w-]+/, AFTER_NON_SPACE],
    ['punctuation', /^[ \t]*-(?=[ \t]|$)|[{}[\],]|[|>][-+]?(?=[ \t]*$)/],
    ['number', /[-+]?\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b/],
    ['word', WORD],
  ],
  literals: words('true false null True False Null TRUE FALSE NULL'),
});

const toml = (): Grammar => ({
  rules: [
    ['comment', HASH_COMMENT],
    ['type', /^[ \t]*\[\[?[^\]\n]*\]\]?/],
    ['name', /(?:"[^"\n]*"|[\w.-]+)(?=[ \t]*=)/],
    ['string', TRIPLE_DQ],
    ['string', TRIPLE_SQ],
    ['string', DQ],
    ['string', /'[^'\n]*'?/],
    [
      'number',
      /\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b|[-+]?\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
    ],
    ['word', WORD],
    ['punctuation', /[{}[\],=]/],
  ],
  literals: words('true false inf nan'),
});

const css = (): Grammar => ({
  rules: [
    ['comment', BLOCK_COMMENT],
    /* SCSS/Less satır yorumu; `url(http://…)` içindeki `//` değil. */
    ['comment', SLASH_COMMENT, /:/],
    ['string', DQ],
    ['string', SQ],
    ['keyword', /@[\w-]+|!important\b/],
    /*
     * Özellik adı: ardındaki `:` bir bildirimi açıyorsa (`;` ya da `}` `{`dan önce geliyorsa).
     * `a:hover {` bir seçici — ardından önce `{` geliyor.
     */
    ['name', /-{0,2}[A-Za-z][\w-]*(?=\s*:[^;{}]*[;}])/],
    ['name', /\$[\w-]+/],
    ['number', /#[\dA-Fa-f]{3,8}\b|-?(?:\b\d+(?:\.\d+)?|\.\d+)(?:%|[A-Za-z]+\b)?/],
    ['word', /-?[A-Za-z_][\w-]*/],
    ['punctuation', /[{}();:,]/],
  ],
});

const markup = (): Grammar => ({
  rules: [
    ['comment', /<!--[\s\S]*?(?:-->|(?![\s\S]))/],
    ['keyword', /<![A-Za-z][^>]*>?|<\?[\s\S]*?(?:\?>|(?![\s\S]))/],
    ['markup', /<\/?[A-Za-z][\w:.-]*(?:"[^"]*"?|'[^']*'?|[^'">])*>?/],
    /* Karakter başvurusu (`&amp;`). */
    ['number', /&#?\w+;/],
  ],
});

const markdown = (): Grammar => ({
  rules: [
    [
      'string',
      /^[ \t]*```[\s\S]*?(?:^[ \t]*```|(?![\s\S]))|^[ \t]*~~~[\s\S]*?(?:^[ \t]*~~~|(?![\s\S]))/,
    ],
    ['keyword', /^#{1,6}[ \t].*/],
    ['punctuation', /^[ \t]*(?:[-*+]|\d+[.)])(?=[ \t])|^[ \t]*>/],
    ['string', /`[^`\n]+`/],
    ['name', /!?\[[^\]\n]*\]\([^)\n]*\)/],
  ],
});

const sql = (): Grammar => ({
  rules: [
    ['comment', /--.*/],
    ['comment', BLOCK_COMMENT],
    ['string', /'(?:[^']|'')*'?/],
    ['name', /"[^"\n]*"?|`[^`\n]*`?/],
    ['number', NUMBER],
    ['word', WORD],
    ['punctuation', /[(),;.]/],
  ],
  keywords: words(
    'select from where and or not insert into values update set delete create table alter drop index view join inner left right full outer cross on as group by order having limit offset union all distinct case when then else end is in exists between like ilike primary key foreign references default unique constraint returning with asc desc begin commit rollback transaction if replace check cascade grant revoke add column database schema trigger procedure function declare',
  ),
  literals: words('null true false'),
  types: words(
    'int integer bigint smallint serial bigserial text varchar char boolean bool date time timestamp timestamptz interval numeric decimal real float double json jsonb uuid bytea',
  ),
  isCaseInsensitive: true,
});

const diff = (): Grammar => ({
  rules: [
    ['keyword', /^(?:diff|index|\+\+\+|---)(?: .*|$)/],
    ['name', /^@@.*/],
    ['inserted', /^\+.*/],
    ['deleted', /^-.*/],
  ],
});

const graphql = (): Grammar => ({
  rules: [
    ['comment', HASH_COMMENT],
    ['string', TRIPLE_DQ],
    ['string', DQ],
    ['name', /\$\w+/],
    ['name', /@\w+/],
    ['number', NUMBER],
    ['word', WORD],
    ['punctuation', /[{}[\]():,!=|]/],
  ],
  keywords: words(
    'query mutation subscription fragment on type input enum interface union scalar schema extend directive implements',
  ),
  literals: words('true false null'),
  /* `ID` tamamı büyük harf ama sabit değil, yerleşik tip. */
  types: words('ID'),
  hasCapitalTypes: true,
});

/** İşaretleme etiketinin İÇİ (`markup` kuralının eşleşmesi): ad, öznitelik, değer. */
export const MARKUP_TAG = (): Grammar => ({
  rules: [
    ['tag', /<\/?[A-Za-z][\w:.-]*/],
    ['string', /"[^"]*"?|'[^']*'?/],
    ['name', /[^\s"'<>/=]+/],
    ['punctuation', /\/?>|=/],
  ],
});

const JS = () => javascript(false, false);
const JSX = () => javascript(false, true);
const TS = () => javascript(true, false);
const TSX = () => javascript(true, true);
const BASH = () => bash(BASH_KEYWORDS);
const DOCKER = () => bash(DOCKER_KEYWORDS);
const C = () => cFamily(C_KEYWORDS);
const CPP = () => cFamily(CPP_KEYWORDS);
const CSHARP = () => cFamily(CSHARP_KEYWORDS);
const KOTLIN = () => cFamily(KOTLIN_KEYWORDS);
const GO = () => cFamily(GO_KEYWORDS);
const RUST = () => cFamily(RUST_KEYWORDS);
/* PHP'de tek tırnak DİZE (karakter değil), `#` yorum ve değişken `$ad`. */
const PHP = () =>
  cFamily(PHP_KEYWORDS, [
    ['comment', HASH_COMMENT],
    ['name', /\$[A-Za-z_]\w*/],
    ['string', SQ],
  ]);

/** Dil adı (küçük harf) → dil. Takma adlar aynı fabrikayı gösterir; önbellek fabrikaya bağlı. */
export const GRAMMARS: Readonly<Record<string, () => Grammar>> = {
  javascript: JS,
  js: JS,
  mjs: JS,
  cjs: JS,
  jsx: JSX,
  typescript: TS,
  ts: TS,
  mts: TS,
  cts: TS,
  tsx: TSX,
  json,
  jsonc: json,
  bash: BASH,
  sh: BASH,
  shell: BASH,
  zsh: BASH,
  console: BASH,
  dockerfile: DOCKER,
  docker: DOCKER,
  python,
  py: python,
  ruby,
  rb: ruby,
  yaml,
  yml: yaml,
  toml,
  css,
  scss: css,
  less: css,
  html: markup,
  xml: markup,
  svg: markup,
  vue: markup,
  markdown,
  md: markdown,
  sql,
  diff,
  patch: diff,
  graphql,
  gql: graphql,
  c: C,
  h: C,
  cpp: CPP,
  'c++': CPP,
  hpp: CPP,
  csharp: CSHARP,
  cs: CSHARP,
  java: () => cFamily(JAVA_KEYWORDS),
  kotlin: KOTLIN,
  kt: KOTLIN,
  swift: () => cFamily(SWIFT_KEYWORDS),
  go: GO,
  golang: GO,
  rust: RUST,
  rs: RUST,
  php: PHP,
};
