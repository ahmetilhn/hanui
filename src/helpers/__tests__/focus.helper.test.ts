import { isKeyboardOpeningElement, preventAutoKeyboard } from '../focus.helper';

describe('isKeyboardOpeningElement', () => {
  const input = (type: string) => {
    const element = document.createElement('input');
    element.type = type;
    return element;
  };

  it('metin alanları klavye açar', () => {
    expect(isKeyboardOpeningElement(input('text'))).toBe(true);
    expect(isKeyboardOpeningElement(input('email'))).toBe(true);
    expect(isKeyboardOpeningElement(input('search'))).toBe(true);
    expect(isKeyboardOpeningElement(document.createElement('textarea'))).toBe(true);
  });

  it('metin OLMAYAN girdiler klavye açmaz', () => {
    expect(isKeyboardOpeningElement(input('checkbox'))).toBe(false);
    expect(isKeyboardOpeningElement(input('radio'))).toBe(false);
    expect(isKeyboardOpeningElement(input('range'))).toBe(false);
    expect(isKeyboardOpeningElement(input('button'))).toBe(false);
    expect(isKeyboardOpeningElement(document.createElement('button'))).toBe(false);
  });

  /* jsdom `isContentEditable`i uygulamiyor ve her zaman false donuyor;
     oznitelik kontrolu testte de gecerli olan yedek. */
  it('düzenlenebilir bölge klavye açar', () => {
    const element = document.createElement('div');
    element.setAttribute('contenteditable', 'true');

    expect(isKeyboardOpeningElement(element)).toBe(true);
  });

  it('öğe yoksa false döner', () => {
    expect(isKeyboardOpeningElement(null)).toBe(false);
  });
});

describe('preventAutoKeyboard', () => {
  const buildDialog = (childTag: 'input' | 'button') => {
    const dialog = document.createElement('dialog');
    const child = document.createElement(childTag);
    dialog.appendChild(child);
    document.body.appendChild(dialog);
    child.focus();

    return { dialog, child };
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('odak metin alanındaysa PANELE geri alınır', () => {
    const { dialog, child } = buildDialog('input');
    expect(document.activeElement).toBe(child);

    preventAutoKeyboard(dialog);

    /*
     * Odak panelin DISINA birakilmaz: kip semantigi bozulur — odak tuzagi
     * calismaz, Escape panele ulasmaz ve ekran okuyucu paneli hic duyurmaz.
     */
    expect(document.activeElement).toBe(dialog);
    expect(dialog.tabIndex).toBe(-1);
  });

  it('odak metin alanında değilse hiçbir şey yapmaz', () => {
    const { dialog, child } = buildDialog('button');

    preventAutoKeyboard(dialog);

    expect(document.activeElement).toBe(child);
  });
});
