import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LABELS } from '../fixtures/labels';

import CodeBadge from '@/components/CodeBadge';
import UiProvider from '@/theme/UiProvider';

const renderBadge = (ui: React.ReactElement) =>
  render(<UiProvider labels={LABELS}>{ui}</UiProvider>);

describe('CodeBadge', () => {
  it('kodu çizer; `isCopyable` verilmeden kopyalama düğmesi YOKTUR', () => {
    renderBadge(<CodeBadge code="P0101" />);

    expect(screen.getByText('P0101')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('`isCopyable` düğme ekler; tıklama kodu panoya yazar ve durumu duyurur', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderBadge(<CodeBadge code="P0101" isCopyable />);

    fireEvent.click(screen.getByRole('button', { name: /kopyala/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('P0101'));
    expect(await screen.findByRole('button', { name: /kopyaland/i })).toBeInTheDocument();
  });

  it('boy değiştiricisi uygulanır, varsayılan `md`', () => {
    const { container, rerender } = renderBadge(<CodeBadge code="P0101" />);

    expect(container.querySelector('[class*="badge--md"]')).not.toBeNull();

    rerender(
      <UiProvider labels={LABELS}>
        <CodeBadge code="P0101" size="lg" />
      </UiProvider>,
    );

    expect(container.querySelector('[class*="badge--lg"]')).not.toBeNull();
  });
});
