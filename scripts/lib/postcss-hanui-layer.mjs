/**
 * KÜTÜPHANE CSS'İNİN TAMAMINI `@layer hanui` İÇİNE ALIR.
 *
 * <h3>Sorun: özgüllük savaşı ve kaynak sırası</h3>
 * Tüketicinin `.card { padding: 0 }` kuralıyla bizim `.hanui-card-x3f`
 * kuralımız AYNI özgüllükte (0,1,0). Eşit özgüllükte kazanan, belgeye SONRA
 * inen. O sıra ise tüketicinin bundler'ının elinde: geliştirme sunucusunda
 * CSS enjeksiyon sırası, üretim derlemesinde chunk sırası — ikisi aynı olmak
 * zorunda değil.
 *
 * <p>Bu tam olarak `hanparca-frontend`te `react-hot-toast`ın goober sınıfıyla
 * yaşanan hataydı: aynı bildirim geliştirmede ve üretimde İKİ FARKLI RENKTE
 * çıkıyordu. Orada kütüphane sarmalayıcısı bırakılıp gövde bizden yazılarak
 * çözülmüştü — yani sorun çözülmedi, kaçınıldı.
 *
 * <h3>Katman ne yapıyor</h3>
 * Katmanlı bir kural, katmansız bir kurala her zaman YENİLİR — özgüllüğe ve
 * sıraya bakılmaksızın. Tüketici hiçbir şey yapmadan, kendi sıradan sınıfıyla
 * bizim kuralımızı ezebiliyor; `!important` ya da `.app .card .card` gibi
 * özgüllük şişirmesi gerekmiyor. Bizim kurallarımız kendi aralarında yine
 * normal özgüllük kurallarıyla yarışıyor: katman İÇİNDE hiçbir şey değişmez.
 *
 * <h3>Neden bir eklenti, neden SCSS'te `@layer` yazmıyoruz</h3>
 * Her modülün başına `@layer hanui {` yazmak 46 dosyaya dokunmak ve her yeni
 * dosyada unutulabilir olmak demek. Çıktı zaten TEK dosya
 * (`cssCodeSplit: false`); sarmalama tek yerde, derleme anında yapılıyor ve
 * unutulamaz.
 *
 * <h3>`@charset` ve `@import` dışarıda kalmak ZORUNDA</h3>
 * İkisi de stil sayfasının en başında durmalı; bir katmanın içine
 * alındıklarında geçersiz olur ve sessizce düşerler. Eklenti onları yerinde
 * bırakıyor.
 */
const PRELUDE = new Set(['charset', 'import']);

/**
 * Yalnızca KÜTÜPHANE CSS'i sarmalanır.
 *
 * <p>Galeri uygulaması aynı boru hattını kullanıyor ve kendi kabuğu
 * (`playground.css`) tüketici CSS'inin taklidi: katmansız kalması GEREKİYOR.
 * Sarmalansaydı galeri, tüketicinin gördüğü ezme davranışını değil kendi
 * özel bir hâlini gösterirdi — yani katmanın işe yarayıp yaramadığı orada
 * görülemezdi.
 */
const isLibrarySource = file =>
  typeof file === 'string' && (file.includes('/src/') || file.includes('\\src\\'));

/** @type {import('postcss').PluginCreator<{ layer?: string }>} */
const hanuiLayer = ({ layer = 'hanui' } = {}) => ({
  postcssPlugin: 'postcss-hanui-layer',

  OnceExit(root, { AtRule }) {
    if (!isLibrarySource(root.source?.input?.file)) return;

    /* Ikinci kez sarmalamayi engelle: eklenti iki yapilandirmada birden
       tanimliysa (kutuphane + galeri) ayni dosya iki kez gecebilir. */
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

hanuiLayer.postcss = true;

export default hanuiLayer;
