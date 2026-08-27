import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileUpload, HanuiProvider } from '../../src';
import { LABELS } from '../fixtures/labels';

const file = (name: string, bytes: number): File =>
  new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });

const renderUpload = (props: Partial<React.ComponentProps<typeof FileUpload>> = {}) => {
  const onSelect = jest.fn();
  const onRemove = jest.fn();

  render(
    <HanuiProvider labels={LABELS}>
      <FileUpload
        files={[]}
        onSelect={onSelect}
        onRemove={onRemove}
        label="Belgeler"
        removeLabel="Kaldır"
        dropLabel="Dosyaları buraya bırakın"
        {...props}
      />
    </HanuiProvider>,
  );

  return { onSelect, onRemove };
};

describe('FileUpload', () => {
  it('girdinin erişilebilir ADI vardır', () => {
    renderUpload();

    expect(screen.getByLabelText(/Belgeler/)).toHaveAccessibleName(
      expect.stringContaining('Belgeler'),
    );
  });

  it('sınır ALTINDAKİ dosya çağırana ULAŞIR', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderUpload({ maxSize: 1_000 });

    await user.upload(screen.getByLabelText(/Belgeler/), file('kucuk.jpg', 100));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0][0].name).toBe('kucuk.jpg');
  });

  it('sınırı AŞAN dosya çağırana HİÇ ulaşmaz', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderUpload({ maxSize: 100 });

    await user.upload(screen.getByLabelText(/Belgeler/), file('buyuk.jpg', 5_000));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('boyut hatası KULLANICIYA yazılır', async () => {
    const user = userEvent.setup();
    renderUpload({ maxSize: 100, sizeErrorText: '{name} çok büyük (en fazla {max})' });

    await user.upload(screen.getByLabelText(/Belgeler/), file('buyuk.jpg', 5_000));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('buyuk.jpg');
    expect(alert).not.toHaveTextContent('{name}');
  });

  it('sınır YOKKEN her dosya geçer', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderUpload();

    await user.upload(screen.getByLabelText(/Belgeler/), file('devasa.jpg', 50_000));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('yüklenmiş dosya KALDIRILABİLİR ve düğmenin adı dosyayı söyler', async () => {
    const user = userEvent.setup();
    const { onRemove } = renderUpload({
      files: [{ id: 'f1', name: 'fatura.pdf', size: 120 }],
    });

    await user.click(screen.getByRole('button', { name: /fatura\.pdf.*Kaldır/ }));

    expect(onRemove).toHaveBeenCalledWith('f1');
  });

  it('PASİF durumda dosya seçilemez', () => {
    renderUpload({ isDisabled: true });

    expect(screen.getByLabelText(/Belgeler/)).toBeDisabled();
  });
});
