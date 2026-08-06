import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tooltip from '../Tooltip';

/** İPUCU — konum, gecikme ve kapanma yolları. */

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

    /* Gecikme dolmadan balon YOK: arac cubugunun uzerinden gecen fare art
       arda bes balon aciyordu. */
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(LABEL);
  });

  /*
   * Gecikme FARE icin var; Tab ile gelen kullanici zaten bilincli olarak orada
   * duruyor.
   */
  it('klavye odağında GECİKMESİZ açılır', async () => {
    renderTooltip({ openDelay: 5_000 });

    await userEvent.tab();

    /* Fare gecikmesi 5 sn olmasina ragmen aciliyor: odak yolu onu
       kullanmiyor. `findByRole` 1 sn bekliyor. */
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  /*
   * Balon GOVDEYE tasiniyor: tetikleyicinin icinde `position: absolute` ile
   * dururken `overflow: hidden` tasiyan her kapsayicida kirpiliyordu.
   */
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

  /*
   * Imlec tetikleyiciden cikar cikmaz kapatmak, balonun kendisine ulasmayi
   * imkansiz kiliyordu: metin secilemiyordu.
   */
  it('imleç ayrılınca TOLERANSLA kapanır', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    await userEvent.unhover(trigger());
    /* Tolerans suresi boyunca hala ekranda. */
    expect(bubble).toBeInTheDocument();

    await waitForElementToBeRemoved(bubble);
  });

  it('imleç BALONA girerse kapanış iptal olur', async () => {
    renderTooltip({ openDelay: 0 });

    await userEvent.hover(trigger());
    const bubble = await screen.findByRole('tooltip');

    await userEvent.unhover(trigger());
    await userEvent.hover(bubble);

    /* Tolerans suresinin iki katindan sonra da acik: imlec balonun ustunde. */
    await new Promise(resolve => {
      setTimeout(resolve, 300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  /*
   * Escape BELGE duzeyinde dinleniyor: balon acikken odak tetikleyicide
   * OLMAYABILIR (fareyle acilmis bir ipucu) ve o durumda tus olayi hic
   * sarmalayiciya ulasmiyor, ipucu ekranda asili kaliyordu.
   */
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

    /* Kapaliyken de birakip gizlemek, ekran okuyucunun onu
       `aria-describedby` olmadan da bulup okumasina yol aciyordu. */
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
  });
});
