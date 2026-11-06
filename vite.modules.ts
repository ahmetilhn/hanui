import MagicString from 'magic-string';
import type { Plugin, Rollup } from 'vite';

/**
 * BİLEŞEN BAŞINA MODÜL DERLEMESİ — `build/components/<Ad>/index.js` (6.0).
 *
 * 5.x tek bir `index.js` üretiyor ve dosyanın başına tek bir `'use client'` yazıyordu: Turbopack
 * bileşen düzeyinde ağaç sarsamıyor, her `Button` bir hidrasyon sınırı oluyor ve modül parçaları
 * (`turbopackModuleFragments`) tek dosyayı ~2.000 halkalık bir değerlendirme zincirine bölüp
 * tarayıcı yığınını taşırıyordu (ölçüm: handijit.com, Kasım 2026). 6.0'da Rollup `preserveModules`
 * ile her kaynak dosya kendi çıktısıdır; bu dosyadaki iki eklenti o kurgunun eksiklerini kapatır.
 */

const DIRECTIVE = /^\s*(['"])use client\1;?[ \t]*\r?\n?/;
const CSS_MODULE = /\.module\.scss$/;

/**
 * `'use client'` DOSYA BAŞINA: kaynaktaki yönerge derlemeden önce sökülür (Rollup modül düzeyindeki
 * yönergeyi düşürür ve uyarır), aynı modülün ÇIKTISINA geri yazılır. Yönergesi olmayan bir bileşen
 * (Button, Chip, Badge…) sunucu bileşeni olarak çizilebilir; yalnızca etkileşimli olanlar istemcidir.
 */
export const clientDirectives = (): Plugin => {
  const clientModules = new Set<string>();

  return {
    name: 'ui-client-directives',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id) || !DIRECTIVE.test(code)) return null;
      clientModules.add(id);

      return { code: code.replace(DIRECTIVE, ''), map: null };
    },
    renderChunk(code, chunk) {
      if (!chunk.facadeModuleId || !clientModules.has(chunk.facadeModuleId)) return null;

      const source = new MagicString(code).prepend("'use client';\n");

      return { code: source.toString(), map: source.generateMap({ hires: true }) };
    },
  };
};

type Chunk = Rollup.OutputChunk;
type Bundle = Rollup.OutputBundle;

const isChunk = (item: Rollup.OutputAsset | Rollup.OutputChunk): item is Chunk =>
  item.type === 'chunk';

/** `a/b/c.js` → `./x.css` (ithalatçıya göre göreli yol). */
const relativeImport = (from: string, to: string): string => {
  const fromParts = from.split('/').slice(0, -1);
  const toParts = to.split('/');
  while (fromParts.length > 0 && toParts.length > 1 && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }
  const up = fromParts.map(() => '..');

  return [...(up.length > 0 ? up : ['.']), ...toParts].join('/');
};

/**
 * CSS MODÜLÜ SINIF HARİTASINI İTHALATÇISINA GÖMER ve CSS'i bileşen başına dosyaya çıkarır.
 *
 * `preserveModules` her `index.module.scss`i de ayrı bir JS parçası yapar (`index.module.scss.js`:
 * yalnızca sınıf haritası). Parça tek bir ithalatçısı olan bir nesne sabitidir; buraya gömülür,
 * dosyası silinir ve ona bağlı CSS `components/<Ad>/style.css` olarak kalır. `base.css` (token'lar,
 * kutu modeli, `@keyframes`) ve `styles.css` (TAM paket) ayrıca üretilir.
 *
 * ⚠ JS ÇIKTISI CSS İÇE AKTARMAZ — ölçülerek karar verildi (handijit.com, Next 16.4.5 / Turbopack,
 * 7 Kasım 2026). Modüllerin `import './style.css'` taşıdığı sürümde Turbopack her istemci sınırının
 * CSS'ini ayrı dosyaya koydu: render-blocking CSS 6 → 12–15 dosya ve LCP yavaş 4G'de 1,9 → 2,5 s
 * (bayt 46,7 → 33,3 kB AZALMASINA rağmen); `turbopackModuleFragments` açıkken aynı içe aktarımlar
 * çıktıdan tamamen düşüyordu; esbuild ise erişilemeyen modüllerin CSS'ini de topluyordu. Tüketici
 * CSS'i TEK dosya olarak alır: `styles.css`, ya da `base.css` + kullandığı bileşenlerin
 * `components/<Ad>/style.css` dosyalarını kendi derlemesinde birleştirerek.
 */
export const componentCss = ({ baseEntry }: { baseEntry: string }): Plugin => ({
  name: 'ui-component-css',
  /* Vite'ın CSS eklentisinden SONRA: saf CSS parçaları (base.scss) o zamana dek ithalatçısına aktarılmıştır. */
  enforce: 'post',
  async generateBundle(options, bundle) {
    const isEsm = options.format === 'es';
    const cssOf = new Map<string, Set<string>>();
    const cssFor = (chunk: Chunk): Set<string> => {
      const found = cssOf.get(chunk.fileName) ?? new Set<string>();
      cssOf.set(chunk.fileName, found);

      return found;
    };

    for (const chunk of Object.values(bundle))
      if (isChunk(chunk))
        for (const css of chunk.viteMetadata?.importedCss ?? []) cssFor(chunk).add(css);

    /* 1) Sınıf haritası parçalarını göm. */
    for (const chunk of Object.values(bundle)) {
      if (!isChunk(chunk) || !CSS_MODULE.test(chunk.facadeModuleId ?? '')) continue;

      const map = await readClassMap(chunk, isEsm);
      const importers = Object.values(bundle).filter(
        (item): item is Chunk => isChunk(item) && item.imports.includes(chunk.fileName),
      );
      if (importers.length === 0)
        throw new Error(`[@handijit/ui] ${chunk.fileName}: sınıf haritasının ithalatçısı yok.`);

      for (const importer of importers) {
        inlineClassMap(importer, chunk.fileName, map, isEsm);
        for (const css of cssFor(chunk)) cssFor(importer).add(css);
      }

      delete bundle[chunk.fileName];
      delete bundle[`${chunk.fileName}.map`];
    }

    /* 2) Dosya adları: `components/X/index.module.css` → `components/X/style.css`, `styles/base.css` → `base.css`. */
    const renamed = new Map<string, string>();
    for (const asset of Object.values(bundle)) {
      if (asset.type !== 'asset' || !asset.fileName.endsWith('.css')) continue;
      const target = asset.fileName
        .replace(/\/index\.module\.css$/, '/style.css')
        .replace(/^styles\/base\.css$/, 'base.css');
      if (target === asset.fileName) continue;
      renamed.set(asset.fileName, target);
      delete bundle[asset.fileName];
      asset.fileName = target;
      bundle[target] = asset;
    }
    const nameOf = (css: string): string => renamed.get(css) ?? css;

    /* Taban girişinin JS'i boş: yalnızca CSS'i kalır. */
    const baseChunk = Object.values(bundle).find(
      (item): item is Chunk => isChunk(item) && item.facadeModuleId === baseEntry,
    );
    const baseCss = nameOf(findBaseCss(bundle, baseEntry));
    if (baseChunk) {
      delete bundle[baseChunk.fileName];
      delete bundle[`${baseChunk.fileName}.map`];
      cssOf.delete(baseChunk.fileName);
    }

    /* 3) `styles.css` — TAM paket: taban + bileşenler (ad sırası; katman içinde sıra önemsiz). */
    const full: string[] = [readAsset(bundle, baseCss)];

    for (const [fileName, cssFiles] of [...cssOf].sort(([a], [b]) => a.localeCompare(b))) {
      if (!bundle[fileName]) continue;

      for (const css of [...cssFiles]
        .map(nameOf)
        .filter(css => css !== baseCss)
        .sort())
        full.push(readAsset(bundle, css));
    }

    if (isEsm) this.emitFile({ type: 'asset', fileName: 'styles.css', source: full.join('\n') });
  },
});

/**
 * Sınıf haritası parçasını ÇALIŞTIRARAK okur: parça dış bağımlılığı olmayan sabitlerden ibarettir;
 * biçimi (esbuild ad kısaltması, adlı dışa aktarımlar) kestirmek yerine modülün kendisi değerlendirilir.
 */
const readClassMap = async (chunk: Chunk, isEsm: boolean): Promise<string> => {
  if (chunk.imports.length > 0)
    throw new Error(`[@handijit/ui] ${chunk.fileName}: sınıf haritası başka modül içe aktarıyor.`);

  let map: unknown;
  if (isEsm) {
    const url = `data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`;
    map = ((await import(url)) as { default: unknown }).default;
  } else {
    const module = { exports: {} as Record<string, unknown> };
    new Function('module', 'exports', chunk.code)(module, module.exports);
    map = module.exports.default ?? module.exports;
  }

  if (typeof map !== 'object' || map === null)
    throw new Error(`[@handijit/ui] ${chunk.fileName}: sınıf haritası bir nesne değil.`);

  /* Tek satır: ithalatçının satır haritası kaymasın. */
  return JSON.stringify(map);
};

/**
 * İthalatçıdaki sınıf haritası içe aktarımını nesne sabitine çevirir.
 * ESM: `import s from "./index.module.scss.js";` → `const s = {...};`
 * CJS (esbuild sıkıştırılmış): `e=require("./index.module.scss.cjs")` → `e={default:{...}}` —
 * Rollup varsayılan dışa aktarımı `.default` üzerinden okur (`output.exports: 'named'`).
 */
const inlineClassMap = (importer: Chunk, target: string, map: string, isEsm: boolean): void => {
  const specifier = relativeImport(importer.fileName, target);
  const pattern = isEsm
    ? new RegExp(`^import (\\w+) from ['"]${escape(specifier)}['"];?[ \\t]*$`, 'gm')
    : new RegExp(`require\\(['"]${escape(specifier)}['"]\\)`, 'g');
  const matches = [...importer.code.matchAll(pattern)];
  if (matches.length !== 1)
    throw new Error(
      `[@handijit/ui] ${importer.fileName}: '${specifier}' içe aktarımı ${matches.length} kez bulundu (1 beklenir).`,
    );

  const [match] = matches;
  const index = match.index ?? 0;
  const source = new MagicString(importer.code);
  source.overwrite(
    index,
    index + match[0].length,
    isEsm ? `const ${match[1]} = ${map};` : `{default:${map}}`,
  );
  importer.code = source.toString();
  if (importer.map) importer.map = source.generateMap({ hires: true }) as unknown as Chunk['map'];
  importer.imports = importer.imports.filter(file => file !== target);
};

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const findBaseCss = (bundle: Bundle, baseEntry: string): string => {
  const chunk = Object.values(bundle).find(
    (item): item is Chunk => isChunk(item) && item.facadeModuleId === baseEntry,
  );
  const [css] = chunk?.viteMetadata?.importedCss ?? [];
  if (!css)
    throw new Error(
      `[@handijit/ui] base.css üretilmedi (${chunk ? `${chunk.fileName}: ${chunk.imports.join(', ')}` : 'giriş yok'}).`,
    );

  return css;
};

const readAsset = (bundle: Bundle, fileName: string): string => {
  const asset = bundle[fileName];
  if (!asset || asset.type !== 'asset') throw new Error(`[@handijit/ui] ${fileName} çıktıda yok.`);

  return typeof asset.source === 'string' ? asset.source : Buffer.from(asset.source).toString();
};
