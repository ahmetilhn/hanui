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

  /* Sinirdaki ok BAGLANTI degil devre disi DUGME: bir `<a>` devre disi
     birakilamaz. */
  it('oklar sınırlarda devre dışı kalır', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={5} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(screen.getByRole('button', { name: LABELS.previousLabel })).toBeDisabled();
    expect(screen.getByRole('link', { name: LABELS.nextLabel })).toBeInTheDocument();

    rerender(
      <Pagination page={5} totalPages={5} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(screen.getByRole('link', { name: LABELS.previousLabel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: LABELS.nextLabel })).toBeDisabled();
  });

  it('düğme kipinde oklar sınırlarda devre dışı kalır', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={5} {...LABELS} onPageChange={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: LABELS.previousLabel })).toBeDisabled();
    expect(screen.getByRole('button', { name: LABELS.nextLabel })).toBeEnabled();

    rerender(<Pagination page={5} totalPages={5} {...LABELS} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: LABELS.previousLabel })).toBeEnabled();
    expect(screen.getByRole('button', { name: LABELS.nextLabel })).toBeDisabled();
  });

  it('tek sayfada hiç çizilmez', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} {...LABELS} buildHref={page => `?sayfa=${page}`} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('bağlantı kipinde OKLAR da bağlantıdır', async () => {
    render(<Pagination page={2} totalPages={5} {...LABELS} buildHref={page => `#sayfa=${page}`} />);

    expect(screen.getByRole('link', { name: LABELS.previousLabel })).toHaveAttribute(
      'href',
      '#sayfa=1',
    );
    expect(screen.getByRole('link', { name: LABELS.nextLabel })).toHaveAttribute(
      'href',
      '#sayfa=3',
    );
  });

  describe('`scrollTo="top"`', () => {
    let scrollTo: jest.SpyInstance;

    beforeEach(() => {
      scrollTo = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    afterEach(() => scrollTo.mockRestore());

    it('düğme kipinde sayfa değişince pencereyi başa alır', async () => {
      render(
        <Pagination page={1} totalPages={5} {...LABELS} onPageChange={jest.fn()} scrollTo="top" />,
      );

      await userEvent.click(screen.getByRole('button', { name: '3' }));

      expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    });

    it('bağlantı kipinde de başa alır', async () => {
      render(
        <Pagination
          page={1}
          totalPages={5}
          {...LABELS}
          buildHref={page => `#sayfa=${page}`}
          scrollTo="top"
        />,
      );

      await userEvent.click(screen.getByRole('link', { name: '3' }));

      expect(scrollTo).toHaveBeenCalledTimes(1);
    });

    it('ETKİN sayfaya basıldığında kaydırmaz', async () => {
      render(
        <Pagination page={3} totalPages={5} {...LABELS} onPageChange={jest.fn()} scrollTo="top" />,
      );

      await userEvent.click(screen.getByRole('button', { name: '3' }));

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('yeni sekmede açan tıklamada MEVCUT sayfa yerinde kalır', async () => {
      render(
        <Pagination
          page={1}
          totalPages={5}
          {...LABELS}
          buildHref={page => `#sayfa=${page}`}
          scrollTo="top"
        />,
      );

      const user = userEvent.setup();

      await user.keyboard('{Meta>}');
      await user.click(screen.getByRole('link', { name: '3' }));
      await user.keyboard('{/Meta}');

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('verilmezse kaydırma YOK', async () => {
      render(<Pagination page={1} totalPages={5} {...LABELS} onPageChange={jest.fn()} />);

      await userEvent.click(screen.getByRole('button', { name: '3' }));

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('`linkProps.onClick` DÜŞMEZ', async () => {
      const onClick = jest.fn();

      render(
        <Pagination
          page={1}
          totalPages={5}
          {...LABELS}
          buildHref={page => `#sayfa=${page}`}
          linkProps={{ onClick }}
          scrollTo="top"
        />,
      );

      await userEvent.click(screen.getByRole('link', { name: '3' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledTimes(1);
    });
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
