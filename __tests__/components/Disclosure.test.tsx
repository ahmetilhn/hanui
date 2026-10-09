import { fireEvent, render, screen } from '@testing-library/react';

import Disclosure from '@/components/Disclosure';

const details = (container: HTMLElement) =>
  container.querySelector('details') as HTMLDetailsElement;

/* jsdom `<summary>` tıklamasıyla `open`ı değiştirir ama `toggle` olayını yayınlamaz; tarayıcı yayınlar. */
const toggleTo = (element: HTMLDetailsElement, open: boolean) => {
  element.open = open;
  fireEvent(element, new Event('toggle'));
};

describe('Disclosure', () => {
  it('kontrolsüz: kapalı başlar, açılınca `onOpenChange(true)`', () => {
    const onOpenChange = jest.fn();
    const { container } = render(
      <Disclosure summary="Ayrıntılar" onOpenChange={onOpenChange}>
        Gövde
      </Disclosure>,
    );

    expect(details(container).open).toBe(false);

    toggleTo(details(container), true);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(details(container).open).toBe(true);
  });

  it('`isDefaultOpen` açık başlatır', () => {
    const { container } = render(
      <Disclosure summary="Düşündü" isDefaultOpen>
        Gövde
      </Disclosure>,
    );

    expect(details(container).open).toBe(true);
  });

  it('kontrollü: prop değişince DOM izler, kullanıcı açarsa yalnızca bildirir', () => {
    const onOpenChange = jest.fn();
    const { container, rerender } = render(
      <Disclosure summary="Araç" isOpen={false} onOpenChange={onOpenChange}>
        Gövde
      </Disclosure>,
    );

    rerender(
      <Disclosure summary="Araç" isOpen onOpenChange={onOpenChange}>
        Gövde
      </Disclosure>,
    );
    expect(details(container).open).toBe(true);

    toggleTo(details(container), false);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    /* Ebeveyn durumu değiştirmediyse prop kazanır: bir sonraki GERÇEK render DOM'u geri açar. */
    rerender(
      <Disclosure summary="Araç" meta="1 sn" isOpen onOpenChange={onOpenChange}>
        Gövde
      </Disclosure>,
    );
    expect(details(container).open).toBe(true);
  });

  it('pasif başlık sekme sırasından çıkar ve tıklama açmaz', () => {
    render(
      <Disclosure summary="Kapalı bölüm" isDisabled>
        Gövde
      </Disclosure>,
    );

    const summary = screen.getByText('Kapalı bölüm').closest('summary') as HTMLElement;

    expect(summary).toHaveAttribute('aria-disabled', 'true');
    expect(summary).toHaveAttribute('tabindex', '-1');
    expect(fireEvent.click(summary)).toBe(false);
  });

  it('`meta` başlığın yanında çizilir', () => {
    render(
      <Disclosure summary="Düşündü" meta="2,4 sn">
        Gövde
      </Disclosure>,
    );

    expect(screen.getByText('2,4 sn').closest('summary')).not.toBeNull();
  });
});
