import { fireEvent, render, screen } from '@testing-library/react';

import { ContextMenu, type MenuItem } from '@/components/Menu';

const noop = () => {};

const items = (onSelect = noop): MenuItem[] => [
  { id: 'copy', label: 'Kopyala', onSelect },
  { id: 'zoom', label: 'Yakınlaştır', onSelect: noop },
  { id: 'delete', label: 'Sil', onSelect: noop, isDanger: true },
];

type Point = { x: number; y: number } | null;

const setup = (point: Point, extra: Partial<Parameters<typeof ContextMenu>[0]> = {}) => {
  const onClose = jest.fn();
  const view = (next: Point) => (
    <ContextMenu
      point={next}
      onClose={onClose}
      label="Seçim seçenekleri"
      items={items()}
      {...extra}
    />
  );
  const utils = render(view(point));
  return { ...utils, onClose, reopen: (next: Point) => utils.rerender(view(next)) };
};

/*
 * jsdom 1024×768 ve yuzeyin olcusu 0×0: konum dogrudan noktadan okunur — sol = x, ust = y + 2
 * (imlec ucu ilk ogeyi ortmesin).
 */
describe('ContextMenu — açılış ve konum', () => {
  it('`point` yokken HİÇBİR şey çizmez', () => {
    setup(null);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('noktanın sağ altına açılır ve odağı İLK etkin öğeye taşır', () => {
    setup({ x: 100, y: 120 });

    const menu = screen.getByRole('menu', { name: 'Seçim seçenekleri' });

    expect(menu).toHaveStyle({ position: 'fixed', left: '100px', top: '122px' });
    expect(screen.getByRole('menuitem', { name: 'Kopyala' })).toHaveFocus();
  });

  it('YENİ nokta yeniden ölçülür ve odak yine ilk öğede', () => {
    const { reopen } = setup({ x: 100, y: 120 });

    screen.getByRole('menuitem', { name: 'Sil' }).focus();
    reopen({ x: 300, y: 200 });

    expect(screen.getByRole('menu')).toHaveStyle({ left: '300px', top: '202px' });
    expect(screen.getByRole('menuitem', { name: 'Kopyala' })).toHaveFocus();
  });

  it('etkin öğe yoksa açılmaz', () => {
    setup(
      { x: 10, y: 10 },
      { items: [{ id: 'a', label: 'Pasif', onSelect: noop, isDisabled: true }] },
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('ContextMenu — kapanış', () => {
  it('Escape kapatır ve olayı İŞLENDİ işaretler (`defaultPrevented`)', () => {
    const { onClose } = setup({ x: 10, y: 10 });

    /* `fireEvent` `preventDefault` cagrildiysa `false` doner. */
    expect(fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('öğe seçilince eylem çalışır, sonra menü kapanır', () => {
    const onSelect = jest.fn();
    const { onClose } = setup({ x: 10, y: 10 }, { items: items(onSelect) });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Kopyala' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('dışarı tıklama kapatır, menünün içi kapatmaz', () => {
    const { onClose } = setup({ x: 10, y: 10 });

    fireEvent.mouseDown(screen.getByRole('menuitem', { name: 'Yakınlaştır' }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('kapanınca odak AÇILIŞTAN önceki öğeye döner', () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();

    const { reopen } = setup(null);

    reopen({ x: 10, y: 10 });
    expect(screen.getByRole('menuitem', { name: 'Kopyala' })).toHaveFocus();

    reopen(null);
    expect(outside).toHaveFocus();

    outside.remove();
  });

  it('menünün içinde sağ tık tarayıcının menüsünü açmaz', () => {
    setup({ x: 10, y: 10 });

    expect(fireEvent.contextMenu(screen.getByRole('menu'))).toBe(false);
  });
});

describe('ContextMenu — başlık ve portal', () => {
  it('başlık `role="menu"`nün DIŞINDA ve menünün açıklaması', () => {
    setup({ x: 10, y: 10 }, { header: <span>Seçim #1 · 3 mum</span> });

    const menu = screen.getByRole('menu');
    const header = screen.getByText('Seçim #1 · 3 mum');

    expect(menu).not.toContainElement(header);
    expect(menu).toHaveAccessibleDescription('Seçim #1 · 3 mum');
    /* Konum basligi da tasiyan YUZEYDE, menude degil. */
    expect(menu.parentElement).toHaveStyle({ left: '10px', top: '12px' });
  });

  it('açık bir `<dialog>` içindeyse yüzey ORAYA portallanır', () => {
    render(
      <dialog open>
        <ContextMenu point={{ x: 10, y: 10 }} onClose={noop} label="Menü" items={items()} />
      </dialog>,
    );

    expect(screen.getByRole('menu').closest('dialog')).not.toBeNull();
  });
});
