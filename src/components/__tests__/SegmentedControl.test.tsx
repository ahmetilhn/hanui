import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SegmentedControl from '../SegmentedControl';

/**
 * BÖLMELİ DENETİM — `ChipGroup`tan ayıran davranış.
 *
 * <p>İkisi de `radiogroup` ve tek seçim; ayrım seçili öğeye ikinci kez
 * basıldığında ne olduğunda. `ChipGroup` seçimi KALDIRIR (filtre: "hiçbiri"
 * geçerli bir durum), bölmeli denetim HİÇBİR ŞEY yapmaz (görünüm anahtarı:
 * ekranda bir şey çizilmek zorunda). Bu testler o farkı kilitliyor.
 */

const OPTIONS = [
  { value: 'list', label: 'Liste' },
  { value: 'grid', label: 'Izgara' },
  { value: 'map', label: 'Harita' },
];

const setup = (value = 'list') => {
  const onChange = jest.fn();
  render(<SegmentedControl label="Görünüm" value={value} onChange={onChange} options={OPTIONS} />);
  return { onChange };
};

describe('SegmentedControl', () => {
  it('radyo grubu olarak duyurulur ve seçili olan işaretlidir', () => {
    setup('grid');

    expect(screen.getByRole('radiogroup', { name: 'Görünüm' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Izgara' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Liste' })).not.toBeChecked();
  });

  it('başka bir bölmeye basmak seçimi taşır', async () => {
    const { onChange } = setup();

    await userEvent.click(screen.getByRole('radio', { name: 'Harita' }));

    expect(onChange).toHaveBeenCalledWith('map');
  });

  /*
   * ASIL AYRIM. `ChipGroup`ta ayni hareket secimi kaldiriyor; burada
   * "hicbiri" diye bir hal yok cunku ekranda bir sey cizilmek zorunda.
   */
  it('SEÇİLİ bölmeye basmak hiçbir şey yapmaz', async () => {
    const { onChange } = setup('list');

    await userEvent.click(screen.getByRole('radio', { name: 'Liste' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('ok tuşu seçimi taşır ve uçlarda DÖNER', async () => {
    const { onChange } = setup('map');

    screen.getByRole('radio', { name: 'Harita' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('list');
  });

  /*
   * Donen `tabindex`: grup Tab sirasinda TEK durak. Dort segmentin her biri
   * durak olsaydi klavye kullanicisi icerige ulasmak icin dort kez Tab'liyordu.
   */
  it('yalnızca SEÇİLİ bölme sekme sırasında', () => {
    setup('grid');

    expect(screen.getByRole('radio', { name: 'Izgara' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Liste' })).toHaveAttribute('tabindex', '-1');
  });

  it('pasif bölme ok gezinmesinde ATLANIR', async () => {
    const onChange = jest.fn();
    render(
      <SegmentedControl
        label="Görünüm"
        value="list"
        onChange={onChange}
        options={[
          { value: 'list', label: 'Liste' },
          { value: 'grid', label: 'Izgara', isDisabled: true },
          { value: 'map', label: 'Harita' },
        ]}
      />,
    );

    screen.getByRole('radio', { name: 'Liste' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('map');
  });

  it('yalnızca ikon kipinde etiket erişilebilir ad olarak KALIR', () => {
    render(
      <SegmentedControl
        label="Görünüm"
        value="list"
        onChange={jest.fn()}
        isIconOnly
        options={[
          { value: 'list', label: 'Liste', icon: <span /> },
          { value: 'grid', label: 'Izgara', icon: <span /> },
        ]}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Izgara' })).toBeInTheDocument();
  });
});
