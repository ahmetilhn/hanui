import { LABELS } from '../fixtures/labels';
import { act, render, screen } from '@testing-library/react';

import { CodeBlock } from '@/chat';
import { formatCode } from '@/chat/CodeBlock/format';
import { GRAMMARS } from '@/chat/CodeBlock/grammars';
import { type CodeToken, HIGHLIGHT_LIMIT, highlight } from '@/chat/CodeBlock/highlight';
import { HanuiProvider } from '@/index';

/** Yalnızca boyanan parçalar, `tür:metin` biçiminde — düz metin ve boşluk dışarıda. */
const painted = (code: string, language: string): string[] =>
  highlight(code, language)
    .filter((token): token is Required<CodeToken> => token.type !== undefined)
    .map(token => `${token.type}:${token.text}`);

describe('highlight — dilden bağımsız', () => {
  it('parçalar birleşince kodun KENDİSİ çıkar (hiçbir karakter düşmez ya da yinelenmez)', () => {
    const samples: [string, string][] = [
      ['ts', "const a = /x/g.test('y') ? b / c : `d ${e}`; // f"],
      ['tsx', 'const A = () => <Button onClick={go}>Kaydet</Button>;'],
      ['json', '{"a": [1, true, null], "b": {"c": "d\\"e"}}'],
      ['bash', 'echo "$HOME" a#b # yorum'],
      ['html', '<a href="x>y" disabled>&amp;</a><!-- c -->'],
      ['yaml', '- name: "x" # yorum\n  key: value'],
      ['diff', '@@ -1 +1 @@\n-a\n+b\n c'],
    ];

    for (const [language, code] of samples)
      expect(
        highlight(code, language)
          .map(token => token.text)
          .join(''),
      ).toBe(code);
  });

  it('bitişik aynı türden parçalar tek parçaya birleşir', () => {
    const tokens = highlight('{}', 'json');
    expect(tokens).toEqual([{ text: '{}', type: 'punctuation' }]);
  });

  it('tanınmayan ya da verilmeyen dil düz metindir', () => {
    expect(highlight('const a = 1;', 'brainfuck')).toEqual([{ text: 'const a = 1;' }]);
    expect(highlight('const a = 1;', undefined)).toEqual([{ text: 'const a = 1;' }]);
  });

  it('nesnenin kalıtılmış adları dil DEĞİL (`constructor`, `__proto__`)', () => {
    for (const language of ['constructor', '__proto__', 'toString', 'hasOwnProperty'])
      expect(highlight('a', language)).toEqual([{ text: 'a' }]);
  });

  it('dil adı büyük/küçük harf ve boşluk duyarsız', () => {
    expect(painted('const a', ' TS ')).toEqual(['keyword:const']);
  });

  it(`${HIGHLIGHT_LIMIT} karakterin üstü vurgulanmaz`, () => {
    const code = 'a'.repeat(HIGHLIGHT_LIMIT + 1);
    expect(highlight(code, 'ts')).toEqual([{ text: code }]);
  });

  it('her dil kurulur ve kurallarının hiçbiri boş eşleşmez', () => {
    expect(Object.keys(GRAMMARS)).toHaveLength(56);

    for (const [name, factory] of Object.entries(GRAMMARS))
      for (const [, rule] of factory().rules) {
        expect(rule.flags).toBe('');
        expect(new RegExp(`^(?:${rule.source})$`).test('')).toBe(false);
        /* Yakalayan grup eşleşen kuralın sırasını kaydırır. */
        expect(new RegExp(`${rule.source}|`).exec('')?.length).toBe(1);
        expect(name).toBeTruthy();
      }
  });

  it('kapanmamış yorum ve dize METNİN SONUNA kadar boyanır (akan yanıt)', () => {
    expect(painted('a /* yarım\nyorum', 'ts')).toEqual(['comment:/* yarım\nyorum']);
    expect(painted('x = """yarım\nbelge', 'python')).toEqual(['string:"""yarım\nbelge']);
  });
});

describe('highlight — JavaScript / TypeScript', () => {
  it('anahtar kelime, tip, çağrı, sabit ve değişmez', () => {
    expect(
      painted('const greet = (name: string): Greeting => format(MAX_SIZE, null);', 'ts'),
    ).toEqual([
      'keyword:const',
      'punctuation:(',
      'punctuation::',
      'type:string',
      'punctuation:):',
      'type:Greeting',
      'name:format',
      'punctuation:(',
      'number:MAX_SIZE',
      'punctuation:,',
      'number:null',
      'punctuation:);',
    ]);
  });

  it('özellik erişimi anahtar kelime DEĞİL (`map.get`, `obj.type`)', () => {
    expect(painted('map.get(k).type', 'ts')).toEqual([
      'punctuation:.',
      'name:get',
      'punctuation:(',
      'punctuation:).',
    ]);
  });

  it('`/` bağlama göre düzenli ifade ya da bölme', () => {
    expect(painted('x = /ab+c/gi', 'js')).toEqual(['string:/ab+c/gi']);
    expect(painted('x = /[a-z]/g', 'js')).toEqual(['string:/[a-z]/g']);
    expect(painted('return /a/', 'js')).toEqual(['keyword:return', 'string:/a/']);
    expect(painted('return /yarim', 'js')).toEqual(['keyword:return', 'string:/yarim']);
    expect(painted('a / b / c', 'js')).toEqual([]);
    expect(painted('f(x) / 2 / 3', 'js')).toEqual([
      'name:f',
      'punctuation:(',
      'punctuation:)',
      'number:2',
      'number:3',
    ]);
  });

  it('kapanmamış karakter sınıfı geri dönüşte kilitlenmez', () => {
    const open = `/${'['.repeat(4_000)}`;
    const divided = `a/${'['.repeat(4_000)}`;

    expect(highlight(open, 'js')).toEqual([{ text: open, type: 'string' }]);
    const tokens = highlight(divided, 'js');
    expect(tokens.some(token => token.type === 'string')).toBe(false);
    expect(tokens.map(token => token.text).join('')).toBe(divided);
  });

  it('JSX etiketi; TS tür parametresi etiket DEĞİL', () => {
    expect(painted('<div>Kaydet</Button>', 'tsx')).toEqual([
      'punctuation:<',
      'keyword:div',
      'type:Kaydet',
      'punctuation:</',
      'type:Button',
    ]);
    expect(painted('useState<string>()', 'tsx')).toEqual(['type:string', 'punctuation:()']);
    expect(painted('<div>', 'ts')).toEqual([]);
  });

  it('dekoratör çağrı gibi boyanır', () => {
    expect(painted('@Component()', 'ts')).toEqual(['name:@Component', 'punctuation:()']);
  });
});

describe('highlight — diğer diller', () => {
  it('JSON: anahtar ad, değer dize; büyük sayı olduğu gibi', () => {
    expect(painted('{"id": 12345678901234567890, "n": "a\\"b", "ok": true}', 'json')).toEqual([
      'punctuation:{',
      'name:"id"',
      'punctuation::',
      'number:12345678901234567890',
      'punctuation:,',
      'name:"n"',
      'punctuation::',
      'string:"a\\"b"',
      'punctuation:,',
      'name:"ok"',
      'punctuation::',
      'number:true',
      'punctuation:}',
    ]);
  });

  it('kabuk: `#` yalnızca kelime başında yorum; değişkenler ad', () => {
    expect(painted('echo $# a#b "${PATH}" # not', 'bash')).toEqual([
      'name:$#',
      'string:"${PATH}"',
      'comment:# not',
    ]);
    expect(painted('if [ -f x ]; then exit 1; fi', 'sh')).toEqual([
      'keyword:if',
      'punctuation:[',
      'punctuation:];',
      'keyword:then',
      'keyword:exit',
      'number:1',
      'punctuation:;',
      'keyword:fi',
    ]);
  });

  it('Python: önekli dize, dekoratör, değişmez', () => {
    expect(painted('@dataclass\nprint(f"x{y}", True)', 'py')).toEqual([
      'name:@dataclass',
      'name:print',
      'punctuation:(',
      'string:f"x{y}"',
      'punctuation:,',
      'number:True',
      'punctuation:)',
    ]);
  });

  it('CSS: özellik adı yalnızca bildirimde; seçicinin `:hover`ı değil', () => {
    expect(painted('a:hover { color: #fff; margin: -4px }', 'css')).toEqual([
      'punctuation::',
      'punctuation:{',
      'name:color',
      'punctuation::',
      'number:#fff',
      'punctuation:;',
      'name:margin',
      'punctuation::',
      'number:-4px',
      'punctuation:}',
    ]);
    expect(painted('b { background: url(http://x.png); } // c', 'scss')).toEqual([
      'punctuation:{',
      'name:background',
      'punctuation::',
      'name:url',
      'punctuation:(',
      'name:http',
      'punctuation::',
      'punctuation:);',
      'punctuation:}',
      'comment:// c',
    ]);
  });

  it('HTML: etiket, öznitelik, değer, varlık, yorum', () => {
    expect(painted('<a href="x>y" disabled>&amp;</a><!-- c -->', 'html')).toEqual([
      'punctuation:<',
      'keyword:a',
      'name:href',
      'punctuation:=',
      'string:"x>y"',
      'name:disabled',
      'punctuation:>',
      'number:&amp;',
      'punctuation:</',
      'keyword:a',
      'punctuation:>',
      'comment:<!-- c -->',
    ]);
  });

  it('YAML: liste öğesinin anahtarı tiresiz; `#` yalnızca boşluktan sonra yorum', () => {
    expect(painted('- name: "x" # c\n  url: http://a#b', 'yaml')).toEqual([
      'punctuation:-',
      'name:name',
      'string:"x"',
      'comment:# c',
      'name:url',
    ]);
  });

  it("SQL büyük/küçük harf duyarsız; `''` kaçışı dizeyi kapatmaz", () => {
    expect(painted("select COUNT(*) FROM t WHERE n = 'O''B'", 'sql')).toEqual([
      'keyword:select',
      'name:COUNT',
      'punctuation:(',
      'punctuation:)',
      'keyword:FROM',
      'keyword:WHERE',
      "string:'O''B'",
    ]);
  });

  it('fark: eklenen, silinen, başlık', () => {
    expect(painted('--- a/x\n+++ b/x\n@@ -1 +1 @@\n-eski\n+yeni\n bağlam', 'diff')).toEqual([
      'keyword:--- a/x',
      'keyword:+++ b/x',
      'name:@@ -1 +1 @@',
      'deleted:-eski',
      'inserted:+yeni',
    ]);
  });

  it("Rust: yaşam süresi (`'a`) dize açmaz, makro çağrıdır", () => {
    expect(painted("fn f<'a>(x: &'a str) { println!(\"{}\", 'c') }", 'rust')).toEqual([
      'keyword:fn',
      'punctuation:(',
      'punctuation::',
      'type:str',
      'punctuation:)',
      'punctuation:{',
      'name:println',
      'punctuation:(',
      'string:"{}"',
      'punctuation:,',
      "string:'c'",
      'punctuation:)',
      'punctuation:}',
    ]);
  });

  it('PHP: tek tırnak dize, `#` yorum; Ruby: sembol, `Foo::Bar` sembol değil', () => {
    expect(painted("$x = 'a'; # c", 'php')).toEqual([
      'name:$x',
      "string:'a'",
      'punctuation:;',
      'comment:# c',
    ]);
    expect(painted(':sym Foo::Bar', 'ruby')).toEqual([
      'number::sym',
      'type:Foo',
      'punctuation::',
      'type:Bar',
    ]);
  });

  it('TOML, Markdown, GraphQL, Go', () => {
    expect(painted('[a]\nk = "v" # c', 'toml')).toEqual([
      'type:[a]',
      'name:k',
      'punctuation:=',
      'string:"v"',
      'comment:# c',
    ]);
    expect(painted('# Başlık\n- `kod` [b](u)', 'md')).toEqual([
      'keyword:# Başlık',
      'punctuation:-',
      'string:`kod`',
      'name:[b](u)',
    ]);
    expect(painted('query Q($id: ID!) { a }', 'graphql')).toEqual([
      'keyword:query',
      'name:Q',
      'punctuation:(',
      'name:$id',
      'punctuation::',
      'type:ID',
      'punctuation:!)',
      'punctuation:{',
      'punctuation:}',
    ]);
    expect(painted('func main() { fmt.Println(`ham`, nil) }', 'go')).toEqual([
      'keyword:func',
      'name:main',
      'punctuation:()',
      'punctuation:{',
      'punctuation:.',
      'name:Println',
      'punctuation:(',
      'string:`ham`',
      'punctuation:,',
      'number:nil',
      'punctuation:)',
      'punctuation:}',
    ]);
  });
});

describe('formatCode', () => {
  it('JSON iki boşlukla yeniden girintilenir — `JSON.stringify(…, null, 2)` ile aynı', () => {
    const value = { a: [1, 2, { b: 'c' }], e: {}, f: [], s: 'x"y:,{' };
    expect(formatCode(JSON.stringify(value), 'json')).toBe(JSON.stringify(value, null, 2));
  });

  it('JSON değerleri METİN olarak korunur: büyük sayı, kaçış, yinelenen anahtar', () => {
    expect(formatCode('{"n":12345678901234567890,"u":"\\u00e7","k":1,"k":2}', 'json')).toBe(
      '{\n  "n": 12345678901234567890,\n  "u": "\\u00e7",\n  "k": 1,\n  "k": 2\n}',
    );
  });

  it('geçersiz JSON (yarım blok) olduğu gibi kalır', () => {
    expect(formatCode('{"a": [1,', 'json')).toBe('{"a": [1,');
  });

  it('kenarlardaki boş satırlar atılır; girinti başka dilde DEĞİŞMEZ', () => {
    expect(formatCode('\n\n    def f():\n        pass\n\n', 'python')).toBe(
      '    def f():\n        pass',
    );
  });
});

describe('CodeBlock', () => {
  const wrap = (node: React.ReactNode) =>
    render(<HanuiProvider labels={LABELS}>{node}</HanuiProvider>);

  it('kodu vurgulayarak çizer; renk sınıfı parça türünden', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    wrap(<CodeBlock code="const a = 1;" language="ts" />);

    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
    expect(screen.getByText('const')).toHaveClass('block__token--keyword');
    expect(screen.getByText('1')).toHaveClass('block__token--number');
  });

  it('biçimlendirilmiş JSON çizilir ve GÖRÜNDÜĞÜ gibi kopyalanır', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { container } = wrap(<CodeBlock code='{"a":1}' language="json" />);
    expect(container.querySelector('code')?.textContent).toBe('{\n  "a": 1\n}');

    await act(async () => {
      screen.getByRole('button', { name: 'json kodunu kopyala' }).click();
    });

    expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}');
  });

  it('`html` verilince yerleşik vurgulayıcı devre dışı; `code` olduğu gibi kopyalanır', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { container } = wrap(
      <CodeBlock code='{"a":1}' language="json" html="<pre><code><span>x</span></code></pre>" />,
    );
    expect(container.querySelector('[class*="block__token"]')).toBeNull();

    await act(async () => {
      screen.getByRole('button', { name: 'json kodunu kopyala' }).click();
    });

    expect(writeText).toHaveBeenCalledWith('{"a":1}');
  });
});
