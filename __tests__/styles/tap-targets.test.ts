import { readFileSync } from 'node:fs';

/**
 * KÜÇÜK ETKİLEŞİMLİ HEDEFLERİN VURUŞ ALANI BÜYÜTÜLÜR.
 *
 * ⚠ WCAG 2.5.5 dokunmatik hedef için 44×44 CSS piksel istiyor. Kütüphanede
 * `tap-target` mixin'i tam bunun için var ve **56 mixin arasında yalnızca 6
 * yerde** kullanılıyordu; en küçük üç hedef listede yoktu:
 *
 * | hedef | görünen ölçü | sonuç |
 * |---|---|---|
 * | `TableCheckbox` | **18×18** | deponun en küçüğü, üstelik çıplak bir `<td>` içinde |
 * | `Combobox__clear` | **22×22** | kullanıcı temizlemek isterken listeyi açıyordu |
 * | `Toast__action` | ~26 | "Geri al" kısa ömürlü; kaçırılan dokunuş geri alınamaz işlem demek |
 *
 * ⚠ MIXIN GÖRÜNÜMÜ DEĞİŞTİRMEZ. `::after` ile ısıtılabilir alanı büyütür;
 * görünen kutu aynı boyutta kalır. Bu şart — üçü de dar bir düzenin içinde
 * duruyor ve gerçekten büyütmek metni kaydırırdı.
 */

const read = (path: string): string => readFileSync(path, 'utf8');

/** Vuruş alanı büyütülmesi ZORUNLU olan küçük hedefler. */
const SMALL_TARGETS = [
  ['TableCheckbox', 'src/components/TableCheckbox/index.module.scss'],
  ['Combobox__clear', 'src/components/Combobox/index.module.scss'],
  ['Toast__action', 'src/components/Toast/index.module.scss'],
  ['TagInput remove', 'src/components/TagInput/index.module.scss'],
  ['IconButton', 'src/components/IconButton/index.module.scss'],
  ['Switch', 'src/components/Switch/index.module.scss'],
] as const;

describe('dokunma hedefleri', () => {
  it.each(SMALL_TARGETS)('%s vuruş alanını büyütür', (_name, path) => {
    expect(read(path)).toMatch(/@include\s+tap-target/);
  });

  it('mixin GÖRÜNEN ölçüyü değiştirmez — `::after` ile çalışır', () => {
    const mixins = read('src/styles/_mixins.scss');
    const block = mixins.slice(mixins.indexOf('@mixin tap-target'));

    /*
     * ⚠ Bu iddia mixin'in `width`/`height`i DOĞRUDAN yazmaya dönmesini
     * engelliyor: öyle olsaydı `Combobox`ın temizleme düğmesi alanın içinde
     * 44px yer kaplar ve metni kaydırırdı.
     */
    expect(block.slice(0, 400)).toContain('&::after');
  });

  it('varsayılan ölçü 44px — WCAG 2.5.5', () => {
    expect(read('src/styles/_variables.scss')).toMatch(/\$tap-target-size:\s*44px/);
  });
});
