import { readdirSync, readFileSync } from 'node:fs';

/*
 * YEŞİL AYAK İZİ — 5.0'ın renk kuralı: yeşil yalnızca EYLEM, BAĞLANTI ve ODAKTA.
 *
 * ⚠ 4.x'te rol yeşili 28 bileşen dosyasında 87 bildirimdi: seçili çip, etkin sayfa, sekme çizgisi,
 * ilerleme, onay kutusu, anahtar, adım, bilgi tonu, CodeBadge… Hiçbiri tek başına yanlış değildi ve
 * hiçbir kapı birikimi görmedi; sonuçta yeşil bir vurgu olmaktan çıkıp arayüzün genel rengine
 * dönüştü. Bu liste o birikimi bir DERLEME HATASI yapar.
 *
 * Yeni bir bileşen yeşil bir aileye uzanıyorsa buraya GEREKÇESİYLE girer. Odak halkası (`$ring*`)
 * listede yok: her etkileşimli öğede olması zaten kural.
 */
const FAMILIES = {
  /** Birincil eylem dolgusu ve sınırı. `action-soft` (pasif dolgu) nötr olduğu için dışarıda. */
  action: /\$(?:action(?:-hover|-active|-line)?|on-action)(?![\w-])/g,
  /** Dönüşüm eylemi (Hanparça "sepete ekle"). */
  cart: /\$(?:cart(?:-[a-z]+)?|on-cart)(?![\w-])/g,
  /** Bağlantı metni. */
  link: /\$link(?:-hover)?(?![\w-])/g,
  /** Olumlu durumun ikon vurgusu — anlamsal, marka değil. */
  success: /\$(?:green-accent(?:-hover)?|on-green)(?![\w-])/g,
  /** Marka şeridi ve ışık lekeleri — kütüphanede çağıranı YOK, tüketiciye ait. */
  brand: /\$(?:band-[a-z0-9-]+|glow-[a-z0-9-]+)(?![\w-])/g,
} as const;

type Family = keyof typeof FAMILIES;

const ALLOWED: Record<Family, Record<string, string>> = {
  action: {
    Button: 'PRIMARY varyantı — ekranın tek birincil eylemi',
    IconButton: 'solid varyantı — ikonlu birincil eylem',
    Badge: '`action` tonunun dolu hâli (sayaç) — dolu zemin tıklanabilir bir sayacın işareti',
  },
  cart: {
    Button: 'CART varyantı',
    IconButton: 'cart varyantı',
  },
  link: {
    Badge: '`link` tonu — gezinme etiketi, yeşil yalnızca metinde',
    Breadcrumb: 'kırıntı bağlantısının hover hâli',
    Directory: 'dizin bağlantıları',
    TextLink: '`brand` tonu',
  },
  success: {
    CopyField: '"kopyalandı" tiki',
    Progress: '`success` tonu',
    Timeline: 'tamamlanan OLAY (bir olay başarısız olabilir; bir adım olamaz)',
    Toast: '`success` tonu',
  },
  brand: {
    Avatar: '`tone="brand"` — marka madalyonu (logo kuralı: çam zemin, mint işaret)',
  },
};

const COMPONENTS = 'src/components';

const usages = (): Record<Family, Set<string>> => {
  const found = Object.fromEntries(
    Object.keys(FAMILIES).map(family => [family, new Set<string>()]),
  ) as Record<Family, Set<string>>;

  for (const component of readdirSync(COMPONENTS)) {
    const files = readdirSync(`${COMPONENTS}/${component}`).filter(name => name.endsWith('.scss'));

    for (const file of files) {
      const source = readFileSync(`${COMPONENTS}/${component}/${file}`, 'utf8');

      for (const [family, pattern] of Object.entries(FAMILIES) as [Family, RegExp][])
        if (source.match(pattern)) found[family].add(component);
    }
  }

  return found;
};

describe('yeşil ayak izi', () => {
  const found = usages();

  it.each(Object.keys(FAMILIES) as Family[])('%s ailesi yalnızca izinli bileşenlerde', family => {
    const outside = [...found[family]].filter(component => !(component in ALLOWED[family]));

    expect(outside).toEqual([]);
  });

  /* Liste bayatlarsa yeşil sessizce geri dönebilecek bir boşluk açar: izin kullanılmıyorsa silinir. */
  it.each(Object.keys(FAMILIES) as Family[])('%s izin listesinde bayat girdi yok', family => {
    const unused = Object.keys(ALLOWED[family]).filter(component => !found[family].has(component));

    expect(unused).toEqual([]);
  });

  it('4.x rol ailesi geri gelmez — seçim mürekkep (`selected*`), bağlantı `link*`', () => {
    const offenders = readdirSync(COMPONENTS).filter(component =>
      readdirSync(`${COMPONENTS}/${component}`)
        .filter(name => name.endsWith('.scss'))
        .some(file =>
          /\$(?:role|on-role)(?![\w])|\$role-/.test(
            readFileSync(`${COMPONENTS}/${component}/${file}`, 'utf8'),
          ),
        ),
    );

    expect(offenders).toEqual([]);
  });
});
