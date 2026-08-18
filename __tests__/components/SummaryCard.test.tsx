import { render, screen } from '@testing-library/react';

import SummaryCard from '@/components/SummaryCard';

describe('SummaryCard', () => {
  it('başlık bağlantısı hedefe gider ve kart TEK sekme durağı taşır', () => {
    render(
      <SummaryCard
        title="Periyodik Bakım"
        href="/bakim-ucretleri/periyodik-bakim"
        description="Yağ ve filtre değişimi"
      />,
    );

    const link = screen.getByRole('link', { name: 'Periyodik Bakım' });

    expect(link).toHaveAttribute('href', '/bakim-ucretleri/periyodik-bakim');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('başlık seviyesi `headingLevel` ile değişir, varsayılan 3', () => {
    const { rerender } = render(<SummaryCard title="Başlık" href="/a" />);

    expect(screen.getByRole('heading', { level: 3, name: 'Başlık' })).toBeInTheDocument();

    rerender(<SummaryCard title="Başlık" href="/a" headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Başlık' })).toBeInTheDocument();
  });

  it('açıklama ve meta satırı kendi kaplarında çizilir', () => {
    const { container } = render(
      <SummaryCard
        title="Başlık"
        href="/a"
        description="Kısa özet"
        meta={<span>1.500 – 18.000 TL</span>}
      />,
    );

    expect(container.querySelector('[class*="card__description"]')).toHaveTextContent('Kısa özet');
    expect(container.querySelector('[class*="card__meta"]')).toHaveTextContent('1.500 – 18.000 TL');
  });

  it('`article` olarak çizilir; madalyon dekoratiftir (`aria-hidden`)', () => {
    const { container } = render(
      <SummaryCard title="Başlık" href="/a" media={<svg aria-hidden />} />,
    );

    expect(container.querySelector('article')).not.toBeNull();
    expect(container.querySelector('[class*="card__media"]')).toHaveAttribute('aria-hidden');
  });
});
