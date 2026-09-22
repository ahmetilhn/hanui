import { readFileSync } from 'node:fs';

const read = (path: string): string => readFileSync(path, 'utf8');

/*
 * ⚠ BU LISTE ELLE BAKILIR ve tam da bu yuzden IKI IHLAL KACIRDI: `Chip` (40px)
 * ve `Pagination` (dar ekranda 36×40) yillardir listede degildi, dolayisiyla
 * nobetci yesil koserken kural cignenıyordu. Ikisi de hanui'nin kendi
 * urununde degil, TUKETICIDE olculdu (hanparca vitrini, 390px ve 320px).
 *
 * ⚠ TURETILMIS BIR KURAL DENENDI VE ELENDI: "44px altinda sabit yukseklik
 * yazan her dosya `tap-target` icermeli" kurali 32 satir isaretliyor ve ezici
 * cogunlugu SUS (`Progress` 4px cubuk, `Spinner`, `Steps` 1px baglayici
 * cizgi, `Avatar`). Gurultu, listenin kendisinden daha kotu bir nobetci
 * uretirdi. Liste kaliyor — ama yeni bir etkilesimli bilesen eklendiginde
 * BURAYA da eklenmesi gerektigi artik yazili.
 */
const SMALL_TARGETS = [
  ['TableCheckbox', 'src/components/TableCheckbox/index.module.scss'],
  ['Combobox__clear', 'src/components/Combobox/index.module.scss'],
  ['Toast__action', 'src/components/Toast/index.module.scss'],
  ['TagInput remove', 'src/components/TagInput/index.module.scss'],
  ['IconButton', 'src/components/IconButton/index.module.scss'],
  ['Switch', 'src/components/Switch/index.module.scss'],
  ['Chip', 'src/components/Chip/index.module.scss'],
  ['Pagination', 'src/components/Pagination/index.module.scss'],
] as const;

describe('dokunma hedefleri', () => {
  it.each(SMALL_TARGETS)('%s vuruş alanını büyütür', (_name, path) => {
    expect(read(path)).toMatch(/@include\s+tap-target/);
  });

  it('mixin GÖRÜNEN ölçüyü değiştirmez — `::after` ile çalışır', () => {
    const mixins = read('src/styles/_mixins.scss');
    const block = mixins.slice(mixins.indexOf('@mixin tap-target'));

    expect(block.slice(0, 400)).toContain('&::after');
  });

  it('varsayılan ölçü 44px — WCAG 2.5.5', () => {
    expect(read('src/styles/_variables.scss')).toMatch(/\$tap-target-size:\s*44px/);
  });
});
