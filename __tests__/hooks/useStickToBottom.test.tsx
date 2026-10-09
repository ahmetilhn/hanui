import { act, render, screen, waitFor } from '@testing-library/react';
import { type FC, useRef, useState } from 'react';

import useStickToBottom from '@/hooks/useStickToBottom';

/* jsdom yerleşim hesaplamaz: kutunun ölçüleri öğe üzerinde taklit edilir. */
const fakeScrollBox = (node: HTMLElement, heights: { content: number; viewport: number }) => {
  let top = 0;

  Object.defineProperties(node, {
    scrollHeight: { configurable: true, get: () => heights.content },
    clientHeight: { configurable: true, get: () => heights.viewport },
    scrollTop: {
      configurable: true,
      get: () => top,
      set: (value: number) => {
        top = Math.max(0, Math.min(value, heights.content - heights.viewport));
      },
    },
  });
  node.scrollTo = jest.fn(({ top: next }: ScrollToOptions) => {
    node.scrollTop = next ?? 0;
  }) as unknown as typeof node.scrollTo;
};

const heights = { content: 1000, viewport: 200 };

const Harness: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState(['ilk satır']);
  const { isAtEnd, scrollToEnd } = useStickToBottom(ref);

  return (
    <>
      <div
        ref={node => {
          if (node && !('scrollTo' in node && jest.isMockFunction(node.scrollTo)))
            fakeScrollBox(node, heights);
          ref.current = node;
        }}
        data-testid="box"
      >
        {lines.map(line => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <span data-testid="state">{isAtEnd ? 'sonda' : 'yukarıda'}</span>
      <button
        type="button"
        onClick={() => setLines(previous => [...previous, `satır ${previous.length}`])}
      >
        ekle
      </button>
      <button type="button" onClick={scrollToEnd}>
        en yeniye in
      </button>
    </>
  );
};

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }),
  });
});

describe('useStickToBottom', () => {
  beforeEach(() => {
    heights.content = 1000;
  });

  it('açılışta sona iner', () => {
    render(<Harness />);

    expect(screen.getByTestId('box').scrollTop).toBe(800);
  });

  it('içerik büyüdükçe sonda kalır', async () => {
    render(<Harness />);
    const box = screen.getByTestId('box');

    heights.content = 1400;
    act(() => screen.getByText('ekle').click());

    await waitFor(() => expect(box.scrollTop).toBe(1200));
  });

  it('kullanıcı yukarı kaydırınca BIRAKIR, içerik büyüse de yerinde kalır', async () => {
    render(<Harness />);
    const box = screen.getByTestId('box');

    act(() => {
      box.scrollTop = 100;
      box.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByTestId('state')).toHaveTextContent('yukarıda');

    heights.content = 1400;
    act(() => screen.getByText('ekle').click());

    await waitFor(() => expect(screen.getAllByRole('paragraph', { hidden: true }).length).toBe(2));
    expect(box.scrollTop).toBe(100);
  });

  it('"en yeniye in" yeniden yapıştırır', () => {
    render(<Harness />);
    const box = screen.getByTestId('box');

    act(() => {
      box.scrollTop = 100;
      box.dispatchEvent(new Event('scroll'));
    });
    act(() => screen.getByText('en yeniye in').click());

    expect(box.scrollTo).toHaveBeenCalled();
    expect(screen.getByTestId('state')).toHaveTextContent('sonda');
  });
});
