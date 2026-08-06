import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TagInput from '@/components/TagInput';

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

  it('alan terk edildiğinde yazılan metin ETİKETE DÖNER', async () => {
    const { onChange, field } = setup();

    await userEvent.type(field, 'kaybolmasın');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(['kaybolmasın']);
  });

  it('YİNELENEN değer eklenmez', async () => {
    const { onChange, field } = setup(['OEM']);

    await userEvent.type(field, 'OEM{Enter}');

    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('');
  });

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

    expect(screen.getByRole('textbox', { name: 'Etiketler' })).toBeDisabled();
  });
});
