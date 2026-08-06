import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tooltip from '@/components/Tooltip';

const LABEL = 'Kısa bir açıklama';

const renderTooltip = (props?: { openDelay?: number }) =>
  render(
    <div>
      <Tooltip content={LABEL} {...props}>
        <button type="button">Öğe</button>
      </Tooltip>
    </div>,
  );

const trigger = () => screen.getByRole('button', { name: 'Öğe' });

describe('Tooltip', () => {
  it('fare üzerine gelince GECİKMEYLE açılır', async () => {
    renderTooltip({ openDelay: 200 });

    await userEvent.hover(trigger());

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(LABEL);
  });

  it('klavye odağında GECİKMESİZ açılır', async () => {
    renderTooltip({ openDelay: 5_000 });

    await userEvent.tab();

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('balon PORTAL ile gövdeye çizilir', async () => {
    const { container } = renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    expect(bubble.parentElement).toBe(document.body);
    expect(container).not.toContainElement(bubble);
  });

  it('tetikleyici `aria-describedby` ile balona bağlanır', async () => {
    renderTooltip({ openDelay: 0 });
    const wrapper = trigger().parentElement;

    expect(wrapper).not.toHaveAttribute('aria-describedby');

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    expect(wrapper?.getAttribute('aria-describedby')).toBe(bubble.id);
  });

  it('imleç ayrılınca TOLERANSLA kapanır', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    await userEvent.unhover(trigger());
    expect(bubble).toBeInTheDocument();

    await waitForElementToBeRemoved(bubble);
  });

  it('imleç BALONA girerse kapanış iptal olur', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    await userEvent.unhover(trigger());
    await userEvent.hover(bubble);

    await new Promise(resolve => {
      setTimeout(resolve, 300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('`Escape` fareyle açılmış balonu da kapatır', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    await screen.findByRole('tooltip');

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('odak ayrılınca kapanır', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.tab();
    await screen.findByRole('tooltip');

    await userEvent.tab();

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('kapalıyken balon DOM`da hiç yoktur', () => {
    renderTooltip();

    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
  });
});
