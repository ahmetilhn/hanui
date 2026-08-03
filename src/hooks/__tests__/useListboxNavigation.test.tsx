import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';

import useListboxNavigation from '../useListboxNavigation';

/**
 * `Select` ve `Combobox`ın ORTAK klavye modeli.
 *
 * <p>Bu kanca çıkarılmadan önce aynı altı davranış iki bileşende kopya kod
 * olarak duruyordu ve ayrışma SESSİZDİ: her bileşenin kendi testi vardı ve her
 * biri kendi davranışını doğruluyordu — biri `Home` tuşunu desteklerken
 * diğerinin desteklememesi hiçbir yerde kırılmıyordu. Model artık tek yerde,
 * nöbetçisi de burada.
 */

const key = (name: string): KeyboardEvent<HTMLElement> =>
  ({ key: name, preventDefault: jest.fn() }) as unknown as KeyboardEvent<HTMLElement>;

const setup = (overrides: Partial<Parameters<typeof useListboxNavigation>[0]> = {}, options = {}) => {
  const onSelect = jest.fn();
  const onClose = jest.fn();

  const view = renderHook(
    (props: { count: number }) =>
      useListboxNavigation(
        { count: props.count, isOpen: true, onSelect, onClose, ...overrides },
        options,
      ),
    { initialProps: { count: 5 } },
  );

  const press = (name: string) => act(() => view.result.current.handleKeyDown(key(name)));

  return { ...view, onSelect, onClose, press };
};

describe('useListboxNavigation', () => {
  it('`ArrowDown` etkin seçeneği ilerletir', () => {
    const { result, press } = setup();

    press('ArrowDown');

    expect(result.current.activeIndex).toBe(1);
  });

  /*
   * UCLARDA DONER: son secenekteyken `ArrowDown` hicbir sey yapmasaydi
   * kullanici listeyi bastan gormek icin bes kez yukari basmak zorunda
   * kalirdi.
   */
  it('son seçenekten sonra başa döner', () => {
    const { result, press } = setup();

    for (let i = 0; i < 5; i += 1) press('ArrowDown');

    expect(result.current.activeIndex).toBe(0);
  });

  it('ilk seçenekten önce sona döner', () => {
    const { result, press } = setup();

    press('ArrowUp');

    expect(result.current.activeIndex).toBe(4);
  });

  it('`Home` / `End` uçlara gider', () => {
    const { result, press } = setup();

    press('End');
    expect(result.current.activeIndex).toBe(4);

    press('Home');
    expect(result.current.activeIndex).toBe(0);
  });

  it('`Enter` etkin seçeneği seçer', () => {
    const { onSelect, press } = setup();

    press('ArrowDown');
    press('Enter');

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  /*
   * BOSLUK bir KARAKTER. `Combobox`in arama kutusunda onu secime cevirmek
   * "fren balatasi" yazmayi imkansiz kiliyordu: ilk boslukta panel kapaniyor
   * ve yanlis secenek seciliyordu.
   */
  it('`Space` varsayılan olarak SEÇMEZ', () => {
    const { onSelect, press } = setup();

    press(' ');

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('`hasSpaceSelect` ile `Space` seçer', () => {
    const { onSelect, press } = setup({}, { hasSpaceSelect: true });

    press(' ');

    expect(onSelect).toHaveBeenCalledWith(0);
  });

  it('`Escape` kapatır', () => {
    const { onClose, press } = setup();

    press('Escape');

    expect(onClose).toHaveBeenCalled();
  });

  /*
   * `Tab` kapatir ama `preventDefault` CAGIRMAZ: klavye kullanicisi listeden
   * cikip bir sonraki alana gecebilmeli. Engellenseydi acik bir panel odak
   * tuzagina donusuyordu.
   */
  it('`Tab` kapatır ama gezinmeyi ENGELLEMEZ', () => {
    const { onClose, result } = setup();
    const event = key('Tab');

    act(() => result.current.handleKeyDown(event));

    expect(onClose).toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  /*
   * Liste SUZULDUGUNDE etkin dizin listenin disinda kalabiliyordu: yedi
   * secenek arasinda altinciyi secili birakip iki sonuca inen kullanici
   * `Enter`a bastiginda HICBIR SEY secilmiyordu.
   */
  it('liste küçüldüğünde etkin dizin sınır içine çekilir', () => {
    const { result, rerender, onSelect } = setup();

    act(() => result.current.setActiveIndex(4));
    rerender({ count: 2 });

    expect(result.current.activeIndex).toBe(1);

    act(() => result.current.handleKeyDown(key('Enter')));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  /* Bos listede `Enter` bir sey secmemeli: `onSelect(0)` olmayan bir secenegi
     bildirirdi. */
  it('boş listede seçim yapmaz', () => {
    const { result, rerender, onSelect } = setup();

    rerender({ count: 0 });
    act(() => result.current.handleKeyDown(key('Enter')));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
