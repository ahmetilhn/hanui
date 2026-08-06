import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PromptDialog from '../PromptDialog';

/** Pencere YALNIZCA başarıda kapanır. */
describe('PromptDialog — pencere yalnızca başarıda kapanır', () => {
  const baseProps = {
    isOpen: true,
    title: 'İptal gerekçesi',
    label: 'Gerekçe',
    submitLabel: 'Gönder',
    cancelLabel: 'Vazgeç',
    closeLabel: 'Kapat',
    inputMode: 'multiline' as const,
  };

  it('onSubmit reddederse pencere AÇIK kalır ve metin korunur', async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn().mockRejectedValue(new Error('Sunucu hatası'));

    render(<PromptDialog {...baseProps} onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Gerekçe/), { target: { value: 'Müşteri vazgeçti' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Müşteri vazgeçti'));

    // Kapatma cagrilmadi, metin durumda duruyor: kullanici tekrar deneyebilir.
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Gerekçe/)).toHaveValue('Müşteri vazgeçti');

    // Dugme donmeye devam etmiyor; ikinci deneme mumkun.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Gönder' })).not.toHaveAttribute(
        'aria-busy',
        'true',
      ),
    );
  });

  it('başarıda kapanır ve değer kırpılmış gönderilir', async () => {
    const onClose = jest.fn();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<PromptDialog {...baseProps} onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Gerekçe/), {
      target: { value: '  Müşteri vazgeçti  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Gönder' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith('Müşteri vazgeçti');
  });

  it('isRequired iken boş (yalnız boşluk) değer gönderilmez', () => {
    const onSubmit = jest.fn();

    render(
      <PromptDialog
        {...baseProps}
        isRequired
        requiredLabel="(zorunlu)"
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Gerekçe/), { target: { value: '   ' } });

    // Dugme pasif; form gonderimi de degeri gecirmez.
    expect(screen.getByRole('button', { name: 'Gönder' })).toBeDisabled();
    fireEvent.submit(screen.getByLabelText(/Gerekçe/).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  /*
   * Deger yalnizca ACILIS kenarinda tazelenir: `isOpen`e bagli duz bir etki,
   * pencere acikken gelen her ust render'da yazilani ezerdi.
   */
  it('pencere yeniden açılırken değer defaultValue’dan tazelenir', () => {
    const { rerender } = render(
      <PromptDialog {...baseProps} defaultValue="1" onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    fireEvent.change(screen.getByLabelText(/Gerekçe/), { target: { value: 'taslak' } });

    rerender(
      <PromptDialog
        {...baseProps}
        isOpen={false}
        defaultValue="1"
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );
    rerender(
      <PromptDialog {...baseProps} defaultValue="1" onClose={jest.fn()} onSubmit={jest.fn()} />,
    );

    // Onceki oturumun taslagi yeni istemde gorunmez.
    expect(screen.getByLabelText(/Gerekçe/)).toHaveValue('1');
  });
});
