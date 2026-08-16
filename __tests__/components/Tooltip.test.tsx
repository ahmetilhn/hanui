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

  /*
   * ⚠ DAVRANIS DEGISTI: balon artik ISARETCI ALMAZ.
   *
   * Onceki surum balona `onPointerEnter={clearTimer}` / `onPointerLeave`
   * bagliyordu ve buradaki test onu olcuyordu ("imlec balona girerse kapanis
   * iptal olur"). Ama bu, `CLAUDE.md`in ve bilesenin KENDI yorumunun iki ayri
   * yerde ilan ettigi sozlesmeyle celisiyordu: *Tooltip bir aciklamadir, eylem
   * degil — `pointer-events: none`.* Dokunmatikteki kapatma yolu (ekranin
   * herhangi bir yerine dokunmak) da balonun tiklanamaz olmasina dayaniyor.
   *
   * Olculen bedel celiskinin bulundugu taraftaydi: `side="bottom"` bir ipucu
   * altindaki dugmenin (orn. "Sepete ekle") ustune biniyor, imlec tetikleyiciden
   * cikinca kapanis basliyor ama balonun uzerinden gecmek onu IPTAL ediyor ve
   * balon orada kalip kullanicinin tiklamasini yutuyordu.
   *
   * Sozlesme artik CSS'te uygulaniyor; test de onu olcuyor.
   */
  it('balon işaretçi almaz — altındaki öğenin tıklaması yutulmaz', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    /* Tetikleyiciden cikilinca balonun uzerinden gecmek kapanisi IPTAL ETMEZ. */
    await userEvent.unhover(trigger());
    await userEvent.hover(bubble);

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
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
