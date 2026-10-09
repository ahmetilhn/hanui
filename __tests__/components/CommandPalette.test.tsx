import { act, fireEvent, render, screen } from '@testing-library/react';
import { type FC, useState } from 'react';

import CommandPalette, { type CommandItem } from '@/components/CommandPalette';
import { resetModalStack, pushModal } from '@/helpers/focus.helper';

const Harness: FC<{ onSelect: () => void; log: string[] }> = ({ onSelect, log }) => {
  const [isOpen, setIsOpen] = useState(false);
  const items: CommandItem[] = [{ id: 'theme', label: 'Temayı değiştir', onSelect }];

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        aç
      </button>
      <CommandPalette
        isOpen={isOpen}
        onClose={() => {
          log.push('close');
          setIsOpen(false);
        }}
        onOpen={() => setIsOpen(true)}
        hotkey="mod+k"
        items={items}
        label="Komut paleti"
        searchPlaceholder="Komut ara"
        emptyMessage="Sonuç yok"
      />
    </>
  );
};

const pressMod = (key: string) =>
  fireEvent.keyDown(document, { key, ctrlKey: true, metaKey: true });

describe('CommandPalette', () => {
  beforeEach(() => resetModalStack());

  it('komut palet KAPANDIKTAN ve odak geri verildikten SONRA çalışır', () => {
    const log: string[] = [];
    const onSelect = jest.fn(() =>
      log.push(`select (odak: ${document.activeElement?.textContent})`),
    );
    render(<Harness onSelect={onSelect} log={log} />);

    const trigger = screen.getByText('aç');
    trigger.focus();
    act(() => trigger.click());

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

    expect(log).toEqual(['close', 'select (odak: aç)']);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('kısayol kapalıyken açar, açıkken kapatır', () => {
    render(<Harness onSelect={jest.fn()} log={[]} />);
    const dialog = () => document.querySelector('dialog') as HTMLDialogElement;

    act(() => pressMod('k'));
    expect(dialog().open).toBe(true);

    act(() => pressMod('k'));
    expect(dialog().open).toBe(false);
  });

  it('başka bir kipsel yüzey açıkken kısayol yok sayılır', () => {
    render(<Harness onSelect={jest.fn()} log={[]} />);
    const { pop } = pushModal();

    act(() => pressMod('k'));
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(false);

    pop();
  });

  it('değiştirici tuşu olmayan basış kısayol sayılmaz', () => {
    render(<Harness onSelect={jest.fn()} log={[]} />);

    act(() => fireEvent.keyDown(document, { key: 'k' }));
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(false);
  });
});
