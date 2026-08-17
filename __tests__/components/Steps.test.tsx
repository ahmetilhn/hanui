import { render, screen } from '@testing-library/react';

import { LABELS } from '../fixtures/labels';

import Steps from '@/components/Steps';
import HanuiProvider from '@/theme/HanuiProvider';

const STEPS = [
  { id: 'a', label: 'Hava filtresi', description: 'En düşük maliyetli ihtimal' },
  { id: 'b', label: 'Sensör değişimi' },
];

describe('Steps — statik talimat modu', () => {
  it('`currentIndex` yokken durum semantiği YOKTUR: aria-current yok, tüm işaretler numara', () => {
    const { container } = render(
      <HanuiProvider labels={LABELS}>
        <Steps label="Kontrol sırası" orientation="vertical" steps={STEPS} />
      </HanuiProvider>,
    );

    expect(container.querySelector('[aria-current]')).toBeNull();
    expect(container.querySelector('[class*="steps__item--"]')).toBeNull();
    expect(container.querySelector('[class*="steps--static"]')).not.toBeNull();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('`currentIndex` verildiğinde ilerleme semantiği aynen durur', () => {
    const { container } = render(
      <HanuiProvider labels={LABELS}>
        <Steps label="Ödeme adımları" currentIndex={1} steps={STEPS} />
      </HanuiProvider>,
    );

    expect(container.querySelector('[aria-current="step"]')).not.toBeNull();
    expect(container.querySelector('[class*="steps__item--done"]')).not.toBeNull();
    expect(container.querySelector('[class*="steps--static"]')).toBeNull();
  });
});
