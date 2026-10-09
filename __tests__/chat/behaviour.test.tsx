import { LABELS } from '../fixtures/labels';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, type ReactNode, useState } from 'react';

import {
  ActionList,
  ActionListItem,
  AppBar,
  ChatThread,
  Citation,
  CodeBlock,
  MessageActions,
  PromptInput,
  ReasoningBlock,
  SegmentBar,
  SourceList,
  TerminalOutput,
} from '@/chat';
import { pushModal, resetModalStack } from '@/helpers/focus.helper';
import { HanuiProvider } from '@/index';

const wrap = (node: ReactNode) => render(<HanuiProvider labels={LABELS}>{node}</HanuiProvider>);

describe('PromptInput — klavye', () => {
  const setup = (props: Partial<Parameters<typeof PromptInput>[0]> = {}) => {
    const onSubmit = jest.fn();
    const onStop = jest.fn();
    const Harness = () => {
      const [value, setValue] = useState(props.value ?? 'merhaba');
      return (
        <PromptInput
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          onStop={onStop}
          placeholder="Mesaj yazın"
          {...props}
        />
      );
    };
    wrap(<Harness />);
    return { onSubmit, onStop, field: screen.getByRole('textbox', { name: 'Mesaj yazın' }) };
  };

  beforeEach(() => resetModalStack());

  it('Enter gönderir, Shift+Enter göndermez', () => {
    const { onSubmit, field } = setup();

    fireEvent.keyDown(field, { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('IME yazımı sürerken Enter GÖNDERMEZ — harf seçimini onaylıyor', () => {
    const { onSubmit, field } = setup();

    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('boş metin gönderilmez ve gönder düğmesi pasif', () => {
    const { onSubmit, field } = setup({ value: '   ' });

    fireEvent.keyDown(field, { key: 'Enter' });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Gönder' })).toBeDisabled();
  });

  it('gönderim kapalıyken yazılabilir ama gönderilemez', () => {
    const { onSubmit, field } = setup({ isSubmitDisabled: true });

    expect(field).not.toBeDisabled();
    fireEvent.keyDown(field, { key: 'Enter' });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Gönder' })).toBeDisabled();
  });

  it('`ref` metin alanına ulaşır — odağı geri vermek için', () => {
    const ref = createRef<HTMLTextAreaElement>();
    wrap(
      <PromptInput ref={ref} value="" onChange={() => {}} onSubmit={() => {}} placeholder="Yaz" />,
    );

    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Yaz' }));
  });

  it('akış sürerken Escape durdurur', () => {
    const { onStop } = setup({ isBusy: true });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onStop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Durdur' })).toBeInTheDocument();
  });

  it('açık bir yüzey varken Escape akışa DOKUNMAZ', () => {
    const { onStop } = setup({ isBusy: true });
    const { pop } = pushModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onStop).not.toHaveBeenCalled();
    pop();
  });
});

describe('ChatThread', () => {
  it('akış BİTİNCE bir kez "yanıt hazır" duyurur, ilk render`da duyurmaz', () => {
    jest.useFakeTimers();
    const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 0;
    });

    const { rerender } = wrap(<ChatThread isStreaming>mesaj</ChatThread>);
    const region = () => document.querySelector('[aria-live="polite"]');
    expect(region()?.textContent ?? '').toBe('');

    rerender(
      <HanuiProvider labels={LABELS}>
        <ChatThread isStreaming={false}>mesaj</ChatThread>
      </HanuiProvider>,
    );

    expect(region()?.textContent).toBe('Yanıt hazır');
    raf.mockRestore();
    jest.useRealTimers();
  });

  it('akış bölgesi canlı bölge DEĞİL — belirteçler okunmaz', () => {
    wrap(<ChatThread isStreaming>mesaj</ChatThread>);
    const region = screen.getByRole('region', { name: 'Sohbet' });

    expect(region).not.toHaveAttribute('aria-live');
    expect(region).not.toHaveAttribute('role', 'log');
  });
});

describe('ReasoningBlock', () => {
  const details = () => document.querySelector('details') as HTMLDetailsElement;

  it('tur sürerken açık, bitince kapanır', () => {
    const { rerender } = wrap(
      <ReasoningBlock summary="Düşünüyor" isRunning>
        gövde
      </ReasoningBlock>,
    );
    expect(details().open).toBe(true);

    rerender(
      <HanuiProvider labels={LABELS}>
        <ReasoningBlock summary="Düşündü">gövde</ReasoningBlock>
      </HanuiProvider>,
    );
    expect(details().open).toBe(false);
  });

  it('kullanıcı elle açtıysa tur bitince KAPATILMAZ', () => {
    const { rerender } = wrap(<ReasoningBlock summary="Düşündü">gövde</ReasoningBlock>);

    act(() => {
      details().open = true;
      fireEvent(details(), new Event('toggle'));
    });

    rerender(
      <HanuiProvider labels={LABELS}>
        <ReasoningBlock summary="Düşündü · 2 araç">gövde</ReasoningBlock>
      </HanuiProvider>,
    );
    expect(details().open).toBe(true);
  });
});

describe('MessageActions — araç çubuğu klavyesi', () => {
  it('ok tuşları, Home ve End eylemler arasında gezer', () => {
    wrap(
      <MessageActions>
        <button type="button">Kopyala</button>
        <button type="button">Yeniden dene</button>
        <button type="button">Ayrıntı</button>
      </MessageActions>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Mesaj eylemleri' });
    const [first, second, third] = screen.getAllByRole('button');

    first.focus();
    fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
    expect(second).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: 'End' });
    expect(third).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
    expect(first).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
    expect(third).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: 'Home' });
    expect(first).toHaveFocus();
  });
});

describe('ActionList', () => {
  it('seçim satırı `aria-pressed` taşır, eylem satırı taşımaz', () => {
    wrap(
      <ActionList label="Liste">
        <ActionListItem isSelected onClick={() => {}}>
          Seçili
        </ActionListItem>
        <ActionListItem onClick={() => {}}>Eylem</ActionListItem>
      </ActionList>,
    );

    expect(screen.getByRole('button', { name: 'Seçili' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Eylem' })).not.toHaveAttribute('aria-pressed');
  });

  it('sanal liste yalnızca görünen satırları çizer ve gerçek konumu söyler', () => {
    wrap(
      <ActionList label="Olaylar" rowHeight={40} maxHeight={200}>
        {Array.from({ length: 500 }, (_, index) => (
          <ActionListItem key={index} onClick={() => {}}>{`Olay ${index}`}</ActionListItem>
        ))}
      </ActionList>,
    );

    const rows = screen.getAllByRole('listitem');
    expect(rows.length).toBeLessThan(30);
    expect(rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(rows[0]).toHaveAttribute('aria-setsize', '500');
  });
});

describe('içerik', () => {
  it('TerminalOutput stderr satırı renkten başka GİZLİ bir önek taşır', () => {
    wrap(<TerminalOutput label="Çıktı" chunks={[{ stream: 'stderr', text: 'izin yok' }]} />);

    expect(screen.getByRole('region', { name: 'Çıktı' })).toHaveTextContent(
      'hata çıktısı: izin yok',
    );
  });

  it('Citation okunan adı metin sözleşmesinden gelir', () => {
    wrap(<Citation index={3} href="#k3" />);

    expect(screen.getByRole('link', { name: 'Kaynak 3' })).toHaveTextContent('3');
  });

  it('SourceList dış kaynağı yeni sekmede ve `noopener` ile açar', () => {
    wrap(<SourceList items={[{ id: '1', title: 'Belge', url: 'https://example.com' }]} />);
    const link = screen.getByRole('link', { name: 'Belge' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(screen.getByRole('list', { name: 'Kaynaklar' })).toBeInTheDocument();
  });

  it('CodeBlock kodu kopyalar ve duyurur', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    wrap(<CodeBlock code="const a = 1;" language="ts" />);
    await act(async () => {
      screen.getByRole('button', { name: 'ts kodunu kopyala' }).click();
    });

    expect(writeText).toHaveBeenCalledWith('const a = 1;');
  });

  it('SegmentBar adı grafiğin adı + parçalar + işaretler', () => {
    wrap(
      <SegmentBar
        label="Bileşim"
        max={100}
        segments={[{ id: 'a', label: 'Önek 40', tone: 'cat-1', value: 40 }]}
        markers={[{ id: 'm', at: 80, label: 'Bütçe 80' }]}
      />,
    );

    expect(screen.getByRole('img', { name: 'Bileşim: Önek 40, Bütçe 80' })).toBeInTheDocument();
  });
});

describe('AppBar', () => {
  it('kendi yüksekliğini `--hanui-header-height`e yazar ve sökülünce siler', () => {
    const original = globalThis.ResizeObserver;
    class Stub {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              borderBoxSize: [{ blockSize: 64, inlineSize: 800 }],
            } as unknown as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver,
        );
      }
      disconnect() {}
    }
    globalThis.ResizeObserver = Stub as unknown as typeof ResizeObserver;

    const { unmount } = wrap(<AppBar brand="Hanration" />);
    expect(document.documentElement.style.getPropertyValue('--hanui-header-height')).toBe('64px');

    unmount();
    expect(document.documentElement.style.getPropertyValue('--hanui-header-height')).toBe('');
    globalThis.ResizeObserver = original;
  });
});
