import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Pagination from '../Pagination';

const LABELS = { label: 'Sayfalar', previousLabel: 'Önceki sayfa', nextLabel: 'Sonraki sayfa' };

describe('Pagination', () => {
  /*
   * Sayfa numaralari `<button>` oldugunda iki bedel vardi: arama motoru bir
   * tiklama olayini calistirmadigi icin ikinci sayfaya HIC gecemiyor, kullanici
   * da orta tikla yeni sekmede acamiyordu.
   */
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

  /*
   * Adres cubuguna yazilmayan (kisiye ozel, `noindex`) listelerde baglanti
   * verilebilecek bir hedef yok; orada dugme dogrusu.
   */
  it('`onPageChange` verildiğinde numaralar DÜĞME kalır', async () => {
    const onPageChange = jest.fn();
    render(<Pagination page={1} totalPages={5} {...LABELS} onPageChange={onPageChange} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  /*
   * `<a>` etiketinin "devre disi" hali yok ve `aria-disabled` tiklamayi
   * engellemiyor; oklar bu yuzden her iki kipte de dugme kalir.
   */
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

  /* Kenarlarda 1 ve son sayfa HER ZAMAN gorunur: kullanici listenin
     nerede bittigini bilmeli ve basa donebilmeli. */
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
