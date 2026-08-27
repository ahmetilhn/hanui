import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from '@/components/Button';
import Menu, { type MenuItem } from '@/components/Menu';

const noop = () => {};

const ITEMS: MenuItem[] = [
  { id: 'copy', label: 'Kopyala', onSelect: noop },
  { id: 'export', label: 'Dışa aktar', onSelect: noop },
  { id: 'archive', label: 'Arşivle', onSelect: noop, isDisabled: true },
  { id: 'delete', label: 'Sil', onSelect: noop, isDanger: true },
];

const setup = (items: MenuItem[] = ITEMS) => {
  const utils = render(
    <Menu label="Satır eylemleri" trigger={<Button>Eylemler</Button>} items={items} />,
  );
  return { ...utils, trigger: screen.getByRole('button', { name: 'Eylemler' }) };
};

const openMenu = async (): Promise<HTMLElement> => {
  await userEvent.click(screen.getByRole('button', { name: 'Eylemler' }));
  return screen.getByRole('menu', { name: 'Satır eylemleri' });
};

describe('Menu — açılış ve odak', () => {
  it('tıklamayla açılır ve odağı İLK etkin öğeye taşır', async () => {
    setup();
    await openMenu();

    expect(screen.getByRole('menuitem', { name: 'Kopyala' })).toHaveFocus();
  });

  it('ArrowUp ile açıldığında odak SON etkin öğede olur', async () => {
    setup();
    const trigger = screen.getByRole('button', { name: 'Eylemler' });

    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    expect(screen.getByRole('menuitem', { name: 'Sil' })).toHaveFocus();
  });

  it('Escape kapatır ve odağı TETİKLEYİCİYE geri verir', async () => {
    const { trigger } = setup();
    const menu = await openMenu();

    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('Menu — klavye gezinmesi', () => {
  it('ArrowDown pasif öğeyi ATLAR', async () => {
    setup();
    const menu = await openMenu();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Dışa aktar' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Sil' })).toHaveFocus();
  });

  it('ArrowDown sondan BAŞA sarar', async () => {
    setup();
    const menu = await openMenu();

    fireEvent.keyDown(menu, { key: 'End' });
    expect(screen.getByRole('menuitem', { name: 'Sil' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Kopyala' })).toHaveFocus();
  });

  it('Home ve End uçlara gider', async () => {
    setup();
    const menu = await openMenu();

    fireEvent.keyDown(menu, { key: 'End' });
    expect(screen.getByRole('menuitem', { name: 'Sil' })).toHaveFocus();

    fireEvent.keyDown(menu, { key: 'Home' });
    expect(screen.getByRole('menuitem', { name: 'Kopyala' })).toHaveFocus();
  });

  it('harfe atlama Türkçe harfleri doğru katlar', async () => {
    setup();
    const menu = await openMenu();

    fireEvent.keyDown(menu, { key: 'd' });
    expect(screen.getByRole('menuitem', { name: 'Dışa aktar' })).toHaveFocus();
  });

  it('Tab menüyü kapatır ama gezinmeyi engellemez', async () => {
    setup();
    const menu = await openMenu();

    const event = fireEvent.keyDown(menu, { key: 'Tab' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(event).toBe(true);
  });
});

describe('Menu — fare ve klavye ayrımı', () => {
  it('fare bir öğenin üzerine geldiğinde odak TAŞINMAZ', async () => {
    setup();
    await openMenu();

    const first = screen.getByRole('menuitem', { name: 'Kopyala' });
    const last = screen.getByRole('menuitem', { name: 'Sil' });
    expect(first).toHaveFocus();

    fireEvent.mouseEnter(last);
    fireEvent.mouseOver(last);

    expect(first).toHaveFocus();
    expect(last).not.toHaveFocus();
  });

  it('pasif öğe tıklanamaz ve seçim tetiklenmez', async () => {
    const onSelect = jest.fn();
    setup([{ id: 'archive', label: 'Arşivle', onSelect, isDisabled: true }]);

    await userEvent.click(screen.getByRole('button', { name: 'Eylemler' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Menu — seçim', () => {
  it('tıklama `onSelect` çağırır ve menüyü kapatır', async () => {
    const onSelect = jest.fn();
    setup([{ id: 'copy', label: 'Kopyala', onSelect }]);

    await openMenu();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Kopyala' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('tetikleyici `aria-expanded` ve `aria-controls` taşır', async () => {
    const { trigger } = setup();

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');

    const menu = await openMenu();

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', menu.id);
  });

  it('DÖNEN tabindex: menü Tab sırasında tek durak', async () => {
    setup();
    await openMenu();

    const items = screen.getAllByRole('menuitem');
    const tabbable = items.filter(item => item.getAttribute('tabindex') === '0');

    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName('Kopyala');
  });
});
