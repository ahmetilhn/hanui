import { fireEvent, render, screen } from '@testing-library/react';

import FilterBar, { FilterBarField } from '@/components/FilterBar';
import Input from '@/components/Input';

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

    fireEvent.submit(screen.getByRole('form', { name: 'Filtreler' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("Enter'ın yedeği: görünmez gönderme düğmesi formda durur ve gönderir", () => {
    const onSubmit = jest.fn();
    const { container } = renderBar(onSubmit);

    const fallback = container.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(fallback).not.toBeNull();

    fireEvent.click(fallback!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
