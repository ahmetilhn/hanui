import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PromptDialog from '@/components/PromptDialog';

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

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Gerekçe/)).toHaveValue('Müşteri vazgeçti');

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

    expect(screen.getByRole('button', { name: 'Gönder' })).toBeDisabled();
    fireEvent.submit(screen.getByLabelText(/Gerekçe/).closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

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

    expect(screen.getByLabelText(/Gerekçe/)).toHaveValue('1');
  });
});
