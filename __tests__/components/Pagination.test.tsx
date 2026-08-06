import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Pagination from '@/components/Pagination';

const LABELS = { label: 'Sayfalar', previousLabel: 'Önceki sayfa', nextLabel: 'Sonraki sayfa' };

describe('Pagination', () => {
  it('`buildHref` verildiğinde sayfa numaraları BAĞLANTI olur', () => {
    render(<Pagination page={2} totalPages={5} {...LABELS} buildHref={page => `?sayfa=${page}`} />);

    const third = screen.getByRole('link', { name: '3' });

    expect(third).toHaveAttribute('href', '?sayfa=3');
  });

  it('etkin sayfa `aria-current="page"` taşır', () => {
    render(<Pagination page={2} totalPages={5} {...LABELS} buildHref={page => `?sayfa=${page}`} />);

    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '3' })).not.toHaveAttribute('aria-current');
  });

  it('`onPageChange` verildiğinde numaralar DÜĞME kalır', async () => {
    const onPageChange = jest.fn();
    render(<Pagination page={1} totalPages={5} {...LABELS} onPageChange={onPageChange} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('oklar sınırlarda devre dışı kalır', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={5} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(screen.getByRole('button', { name: LABELS.previousLabel })).toBeDisabled();
    expect(screen.getByRole('button', { name: LABELS.nextLabel })).toBeEnabled();

    rerender(
      <Pagination page={5} totalPages={5} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(screen.getByRole('button', { name: LABELS.previousLabel })).toBeEnabled();
    expect(screen.getByRole('button', { name: LABELS.nextLabel })).toBeDisabled();
  });

  it('tek sayfada hiç çizilmez', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('uzun listede uçlar korunur, arası kısaltılır', () => {
    render(
      <Pagination page={12} totalPages={24} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '24' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '11' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '13' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '7' })).not.toBeInTheDocument();
  });
});
