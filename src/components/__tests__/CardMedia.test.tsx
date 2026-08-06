import { render } from '@testing-library/react';

import { CardMedia } from '../Card';

/** MEDYA DOLDURMA BİÇİMİ — karar çağıranda. */

/** Çerçeve: oranı taşıyan `<span>`; sınıf adları saplamadan kendi adlarıyla gelir. */
const frameOf = (container: HTMLElement): HTMLElement => {
  const frame = container.querySelector<HTMLElement>('[class*="media__frame"]');

  if (!frame) throw new Error('medya çerçevesi çizilmedi');

  return frame;
};

describe('CardMedia — `fit`', () => {
  it.each([
    ['cover', 'media__frame--cover'],
    ['contain', 'media__frame--contain'],
    ['inset', 'media__frame--inset'],
  ] as const)('`fit="%s"` → `%s`', (fit, expected) => {
    const { container } = render(
      <CardMedia fit={fit}>
        <img alt="" src="data:," />
      </CardMedia>,
    );

    expect(frameOf(container).className.split(/\s+/)).toContain(expected);
  });

  /*
   * Varsayilan KIRPMAYAN secenek: kirpma bilgi yok eder ve kutuphane bunu
   * cagiranin haberi olmadan yapmamali. `inset` de varsayilan degil — o
   * estetik bir tercih (urun fotografi) ve her karta dayatilmaz.
   */
  it('varsayılan `contain` — kırpmayan seçenek', () => {
    const { container } = render(
      <CardMedia>
        <img alt="" src="data:," />
      </CardMedia>,
    );

    const classes = frameOf(container).className.split(/\s+/);

    expect(classes).toContain('media__frame--contain');
    expect(classes).not.toContain('media__frame--cover');
    expect(classes).not.toContain('media__frame--inset');
  });

  /* Uc dal AYNI eksende: ikisi birden uygulanirsa hangisinin kazandigi
     kaynak sirasina kalir ve iki cagirandan biri yanlis gorunum alir. */
  it('yalnızca TEK doldurma sınıfı çizilir', () => {
    const { container } = render(
      <CardMedia fit="inset">
        <img alt="" src="data:," />
      </CardMedia>,
    );

    const applied = frameOf(container)
      .className.split(/\s+/)
      .filter(name => name.startsWith('media__frame--'));

    expect(applied).toEqual(['media__frame--inset']);
  });
});

describe('CardMedia — eski `isContained` köprüsü', () => {
  it('`isContained` → `contain`', () => {
    const { container } = render(
      <CardMedia isContained>
        <img alt="" src="data:," />
      </CardMedia>,
    );

    expect(frameOf(container).className.split(/\s+/)).toContain('media__frame--contain');
  });

  it('`isContained={false}` → `cover`', () => {
    const { container } = render(
      <CardMedia isContained={false}>
        <img alt="" src="data:," />
      </CardMedia>,
    );

    expect(frameOf(container).className.split(/\s+/)).toContain('media__frame--cover');
  });

  /*
   * `isContained` varsayilani `true`ydu; eskiyi one alan bir cozumleme yeni
   * prop'u ETKISIZ birakirdi — yani `fit` yazan tuketici hicbir sey
   * degismedigini gorurdu. Ters yon de olculuyor: eski deger acikca
   * verildiginde bile `fit` kazanir.
   */
  it('açıkça verilen `fit`, `isContained`i EZER', () => {
    const { container } = render(
      <CardMedia fit="inset" isContained={false}>
        <img alt="" src="data:," />
      </CardMedia>,
    );

    expect(frameOf(container).className.split(/\s+/)).toContain('media__frame--inset');
  });
});
