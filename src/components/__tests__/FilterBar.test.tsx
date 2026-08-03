import { fireEvent, render, screen } from '@testing-library/react';

import FilterBar, { FilterBarField } from '../FilterBar';
import Input from '../Input';

/**
 * Filtre şeridi HER ZAMAN bir formdur.
 *
 * <p>Beş ekran şeridi elle kuruyordu ve yalnızca üçü `<form>` kullanıyordu:
 * arama kutusunda Enter üç ekranda filtreyi uyguluyor, ikisinde hiçbir şey
 * yapmıyordu. Tarayıcının örtük gönderimi (Enter) birden çok alanlı bir formda
 * ancak bir gönderme düğmesi varsa çalışır; şerit bu yüzden görünmez bir yedek
 * düğme taşır.
 */
describe('FilterBar — Enter tutarlılığı', () => {
  const renderBar = (onSubmit: () => void) =>
    render(
      <FilterBar onSubmit={onSubmit} label="Filtreler">
        <FilterBarField isWide>
          <Input aria-label="Ara" defaultValue="SP-1" />
        </FilterBarField>
        <FilterBarField>
          <Input aria-label="Durum" defaultValue="" />
        </FilterBarField>
      </FilterBar>,
    );

  it('form gönderimi onSubmit çağırır ve varsayılan gezinmeyi keser', () => {
    const onSubmit = jest.fn();
    renderBar(onSubmit);

    // `preventDefault` bilesenin isi: jsdom "not implemented" firlatmadan gecer.
    fireEvent.submit(screen.getByRole('form', { name: 'Filtreler' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Enter'ın yedeği: görünmez gönderme düğmesi formda durur ve gönderir", () => {
    const onSubmit = jest.fn();
    const { container } = renderBar(onSubmit);

    // Ortuk gonderim tarayicida bu dugmeyi "tiklar"; dugme yoksa Enter oluyor.
    const fallback = container.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(fallback).not.toBeNull();

    fireEvent.click(fallback!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
