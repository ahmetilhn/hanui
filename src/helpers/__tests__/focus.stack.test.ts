import {
  captureFocus,
  focusFirstMeaningful,
  isTopModal,
  pushModal,
  resetModalStack,
} from '../focus.helper';

/**
 * ODAK YÖNETİMİ — geri dönüş, ilk anlamlı öğe ve kipsel yığın.
 *
 * <p>Üçü de görsel iz bırakmadan bozulan davranışlar: odak `<body>`ye
 * düştüğünde ekranda hiçbir şey değişmiyor, yalnızca klavye kullanıcısı
 * sayfanın en başına gidiyor.
 */

const mount = (html: string): HTMLElement => {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
};

describe('captureFocus', () => {
  it('odağı AÇAN öğeye geri verir', () => {
    const root = mount('<div><button id="trigger">Aç</button><input id="inside" /></div>');
    const trigger = root.querySelector<HTMLElement>('#trigger')!;

    trigger.focus();
    const restore = captureFocus();

    root.querySelector<HTMLElement>('#inside')!.focus();
    restore();

    expect(trigger).toHaveFocus();
  });

  /*
   * Acan dugme panel kapanirken DOM'dan kalkmis olabilir: bir satiri silen
   * onay penceresi, satirla birlikte dugmeyi de goturuyor. Kalkmis bir ogeye
   * `focus()` sessizce hicbir sey yapmiyor ve odak `<body>`ye dusuyordu.
   */
  it('açan öğe DOM`dan kalktıysa sessizce vazgeçer', () => {
    const root = mount('<div><button id="trigger">Sil</button></div>');
    const trigger = root.querySelector<HTMLElement>('#trigger')!;

    trigger.focus();
    const restore = captureFocus();
    trigger.remove();

    expect(() => restore()).not.toThrow();
  });
});

describe('focusFirstMeaningful', () => {
  /*
   * `showModal()` odagi DOM sirasindaki ILK odaklanabilir ogeye tasiyor ve o
   * neredeyse her zaman basliktaki carpi oluyor: ekran okuyucu pencereyi
   * "Kapat, dugme" diye aciyor — kullanicinin duydugu ilk sey, pencerenin ne
   * oldugu degil ondan nasil kacilacagi.
   */
  it('KAPATMA düğmesini atlar', () => {
    const panel = mount(`
      <div>
        <button class="close" data-hanui-close>Kapat</button>
        <input id="first" />
        <button id="save">Kaydet</button>
      </div>
    `);

    focusFirstMeaningful(panel);

    expect(panel.querySelector('#first')).toHaveFocus();
  });

  it('`data-hanui-autofocus` her şeyi EZER', () => {
    const panel = mount(`
      <div>
        <input id="first" />
        <button id="save" data-hanui-autofocus>Kaydet</button>
      </div>
    `);

    focusFirstMeaningful(panel);

    expect(panel.querySelector('#save')).toHaveFocus();
  });

  it('atlanacak öğe TEK adaysa yine ona odaklanır', () => {
    const panel = mount('<div><button data-hanui-close>Kapat</button></div>');

    focusFirstMeaningful(panel);

    expect(panel.querySelector('button')).toHaveFocus();
  });

  /*
   * Odagi panelin DISINDA birakmak kip semantigini bozar: odak tuzagi
   * calismaz, Escape panele ulasmaz ve ekran okuyucu paneli hic duyurmaz.
   * Panelin kendisi son care.
   */
  it('odaklanabilir öğe yoksa PANELİN KENDİSİNE odaklanır', () => {
    const panel = mount('<div><p>Yalnızca metin</p></div>');

    focusFirstMeaningful(panel);

    expect(panel).toHaveFocus();
    expect(panel).toHaveAttribute('tabindex', '-1');
  });

  it('pasif öğe aday DEĞİLDİR', () => {
    const panel = mount('<div><button disabled>Pasif</button><a href="#x">Bağlantı</a></div>');

    focusFirstMeaningful(panel);

    expect(panel.querySelector('a')).toHaveFocus();
  });
});

describe('kipsel yığın', () => {
  beforeEach(resetModalStack);

  /*
   * Ust uste iki pencerede tek bir Escape IKISINI BIRDEN kapatiyordu: `cancel`
   * olayi her iki `<dialog>`a da ulasiyor ve ikisi de kendi `onClose`unu
   * cagiriyordu.
   */
  it('yalnızca EN ÜSTTEKİ panel en üsttedir', () => {
    const outer = pushModal();
    const inner = pushModal();

    expect(isTopModal(inner.token)).toBe(true);
    expect(isTopModal(outer.token)).toBe(false);
  });

  it('üstteki kapanınca alttaki en üste çıkar', () => {
    const outer = pushModal();
    const inner = pushModal();

    inner.pop();

    expect(isTopModal(outer.token)).toBe(true);
  });

  /* Sokum SIRASI garantili degil: ortadaki panel once kalkabilir. */
  it('ORTADAKİ panel çıkarıldığında sıra bozulmaz', () => {
    const first = pushModal();
    const second = pushModal();
    const third = pushModal();

    second.pop();

    expect(isTopModal(third.token)).toBe(true);
    expect(isTopModal(first.token)).toBe(false);
  });

  it('yığın boşken hiçbir belirteç en üstte değildir', () => {
    const { token, pop } = pushModal();
    pop();

    expect(isTopModal(token)).toBe(false);
  });
});
