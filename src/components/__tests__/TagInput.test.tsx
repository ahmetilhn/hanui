import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TagInput from '../TagInput';

/** ETİKET GİRDİSİ — kayıp metin ve sessiz yutma. */

const setup = (values: string[] = []) => {
  const onChange = jest.fn();

  render(
    <TagInput
      values={values}
      onChange={onChange}
      label="Etiketler"
      removeLabel="Kaldır"
      placeholder="Etiket ekleyin"
    />,
  );

  return { onChange, field: screen.getByRole('textbox', { name: 'Etiketler' }) };
};

describe('TagInput', () => {
  it('`Enter` yazılanı etikete çevirir', async () => {
    const { onChange, field } = setup();

    await userEvent.type(field, 'fren balatası{Enter}');

    expect(onChange).toHaveBeenCalledWith(['fren balatası']);
  });

  it('virgül de ayırıcıdır', async () => {
    const { onChange, field } = setup();

    await userEvent.type(field, 'OEM,');

    expect(onChange).toHaveBeenCalledWith(['OEM']);
  });

  it('baştaki ve sondaki boşluk kırpılır, boş değer eklenmez', async () => {
    const { onChange, field } = setup();

    await userEvent.type(field, '   {Enter}');
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(field, '  OEM  {Enter}');
    expect(onChange).toHaveBeenCalledWith(['OEM']);
  });

  /*
   * Yarim kalmis bir metin alan terk edildiginde kayboluyordu ve kullanici
   * bunu ancak gonderdikten sonra fark ediyordu.
   */
  it('alan terk edildiğinde yazılan metin ETİKETE DÖNER', async () => {
    const { onChange, field } = setup();

    await userEvent.type(field, 'kaybolmasın');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(['kaybolmasın']);
  });

  /*
   * Sessizce yutmak yerine GOSTER: kullanici "yazdim, kayboldu" diyordu.
   * Deger eklenmiyor ama girdi temizleniyor ve durum duyuruluyor.
   */
  it('YİNELENEN değer eklenmez', async () => {
    const { onChange, field } = setup(['OEM']);

    await userEvent.type(field, 'OEM{Enter}');

    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('');
  });

  /*
   * Kosulsuz yazildiginda kullanici bir harf silmek isterken etiketi
   * siliyordu.
   */
  it('BOŞ girdide `Backspace` son etiketi kaldırır', async () => {
    const { onChange, field } = setup(['bir', 'iki']);

    field.focus();
    await userEvent.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith(['bir']);
  });

  it('metin VARKEN `Backspace` etiketi kaldırmaz', async () => {
    const { onChange, field } = setup(['bir']);

    await userEvent.type(field, 'ab{Backspace}');

    expect(onChange).not.toHaveBeenCalled();
  });

  /*
   * Ad degeri ICERIR: on bes cipin hepsi "Kaldir" diye okundugunda hangisi
   * oldugu belli olmuyordu.
   */
  it('kaldırma düğmesinin adı DEĞERİ içerir', async () => {
    const { onChange } = setup(['fren balatası']);

    const remove = screen.getByRole('button', { name: 'fren balatası — Kaldır' });
    await userEvent.click(remove);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('`maxTags` dolduğunda girdi PASİF olur, GİZLENMEZ', () => {
    render(
      <TagInput
        values={['bir', 'iki']}
        onChange={jest.fn()}
        label="Etiketler"
        removeLabel="Kaldır"
        maxTags={2}
      />,
    );

    /* Kaybolan bir alan "neden ekleyemiyorum" sorusunu cevapsiz birakiyordu. */
    expect(screen.getByRole('textbox', { name: 'Etiketler' })).toBeDisabled();
  });
});
