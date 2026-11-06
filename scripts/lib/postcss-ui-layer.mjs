/** KÜTÜPHANE CSS'İNİN TAMAMINI `@layer ui` İÇİNE ALIR. */
const PRELUDE = new Set(['charset', 'import']);

/** Yalnızca KÜTÜPHANE CSS'i sarmalanır. */
const isLibrarySource = file =>
  typeof file === 'string' && (file.includes('/src/') || file.includes('\\src\\'));

/** @type {import('postcss').PluginCreator<{ layer?: string }>} */
const uiLayer = ({ layer = 'ui' } = {}) => ({
  postcssPlugin: 'postcss-ui-layer',

  OnceExit(root, { AtRule }) {
    if (!isLibrarySource(root.source?.input?.file)) return;

    /*
     * Ikinci kez sarmalamayi engelle: eklenti iki yapilandirmada birden tanimliysa (kutuphane +
     * galeri) ayni dosya iki kez gecebilir.
     */
    if (root.first?.type === 'atrule' && root.first.name === 'layer') return;

    const moved = root.nodes.filter(
      node => !(node.type === 'atrule' && PRELUDE.has(node.name.toLowerCase())),
    );

    if (moved.length === 0) return;

    const wrapper = new AtRule({ name: 'layer', params: layer });
    root.append(wrapper);

    for (const node of moved) wrapper.append(node.remove());
  },
});

uiLayer.postcss = true;

export default uiLayer;
