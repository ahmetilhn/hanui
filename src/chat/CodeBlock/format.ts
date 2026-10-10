/** Kodun başındaki boş satırlar (ilk dolu satırın girintisi korunur). */
const LEADING_BLANK_LINES = /^(?:[ \t]*\r?\n)+/;

const INDENT = '  ';

const isJson = (language: string | undefined) => language?.trim().toLowerCase() === 'json';

/** `"` ile açılan dizenin kapanışından sonraki konum. */
const endOfString = (text: string, start: number): number => {
  let cursor = start + 1;
  while (cursor < text.length && text[cursor] !== '"') cursor += text[cursor] === '\\' ? 2 : 1;

  return cursor + 1;
};

const nextSignificant = (text: string, start: number): number => {
  let cursor = start;
  while (cursor < text.length && /\s/.test(text[cursor])) cursor++;

  return cursor;
};

/**
 * Geçerli JSON'u iki boşlukla yeniden girintiler — `JSON.stringify(değer, null, 2)` çıktısının
 * aynısı, ama METİN üzerinden.
 * ⚠ Değer ayrıştırılıp yeniden yazılmaz: `JSON.parse` 2^53'ün üstündeki tamsayıyı yuvarlıyor
 * (`12345678901234567890` → `12345678901234567000`), kaçışları çözüyor ve yinelenen anahtarın
 * ilkini siliyordu — biçimlendirici GÖSTERDİĞİ veriyi değiştiriyordu. Ayrıştırma yalnızca
 * geçerliliği sınar; sayılar, kaçışlar ve anahtarlar karakteri karakterine korunur.
 * Geçersiz JSON (akan yanıtın yarım bloğu, yorumlu JSONC) olduğu gibi döner.
 */
const formatJson = (text: string): string => {
  try {
    JSON.parse(text);
  } catch {
    return text;
  }

  let output = '';
  let depth = 0;
  const newline = () => `\n${INDENT.repeat(depth)}`;

  for (let cursor = 0; cursor < text.length; cursor++) {
    const character = text[cursor];

    if (character === '"') {
      const end = endOfString(text, cursor);
      output += text.slice(cursor, end);
      cursor = end - 1;
    } else if (character === '{' || character === '[') {
      const next = nextSignificant(text, cursor + 1);
      /* Boş kap tek satırda kalır: `{}`, `[]`. */
      if (text[next] === (character === '{' ? '}' : ']')) {
        output += character + text[next];
        cursor = next;
      } else {
        depth++;
        output += character + newline();
      }
    } else if (character === '}' || character === ']') {
      depth--;
      output += newline() + character;
    } else if (character === ',') output += `,${newline()}`;
    else if (character === ':') output += ': ';
    else if (!/\s/.test(character)) output += character;
  }

  return output;
};

/**
 * Kod bloğunun biçimlendiricisi. Her dilde başındaki ve sonundaki boş satırları atar (çitli
 * bloğun son `\n`i gövdede boş bir satır çiziyordu); JSON'u yeniden girintiler.
 * ⚠ Girinti başka hiçbir dilde DEĞİŞTİRİLMEZ: bir dosyadan alınmış parçanın girintisi o dosyadaki
 * derinliği anlatıyor ve Python'da anlamın kendisi.
 */
export const formatCode = (code: string, language: string | undefined): string => {
  const trimmed = code.replace(LEADING_BLANK_LINES, '').trimEnd();

  return isJson(language) ? formatJson(trimmed) : trimmed;
};
