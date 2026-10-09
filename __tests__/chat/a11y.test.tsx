import { LABELS } from '../fixtures/labels';
import { type ReactElement } from 'react';

import { render } from '@testing-library/react';

import { axe } from '@tests/support/axe';
import * as chat from '@/chat';
import { HanuiProvider } from '@/index';

const { Legend } = chat;

/*
 * SOHBET GİRİŞİNİN EKSEN TARAMASI — ana girişin taramasıyla aynı sözleşme: dışa verilen her bileşen,
 * her anlamlı durumunda. Deftere girmeyen yeni bir sohbet bileşeni testi kırar.
 */
const SCENARIOS: Record<string, Record<string, ReactElement>> = {
  Legend: {
    default: (
      <Legend
        items={[
          { id: 'prefix', label: 'Önek', tone: 'cat-1' },
          { id: 'map', label: 'Harita', tone: 'cat-2' },
          { id: 'wait', label: 'Bekleme', tone: 'muted' },
        ]}
      />
    ),
  },
};

const cases = Object.entries(SCENARIOS).flatMap(([component, states]) =>
  Object.entries(states).map(([state, element]) => [component, state, element] as const),
);

describe('sohbet eksen taraması', () => {
  it.each(cases)('%s — %s', async (_component, _state, element) => {
    render(<HanuiProvider labels={LABELS}>{element}</HanuiProvider>);

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('sohbet senaryo defteri `chat/index.ts` ile eşleşir', () => {
  const isComponent = (value: unknown): boolean =>
    (typeof value === 'function' && /^[A-Z]/.test((value as { name?: string }).name ?? '')) ||
    (typeof value === 'object' && value !== null && '$$typeof' in value);

  const exported = Object.entries(chat)
    .filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value))
    .map(([name]) => name);

  it('dışa verilen her bileşenin en az bir senaryosu var', () => {
    expect(exported.filter(name => !SCENARIOS[name])).toEqual([]);
  });

  it('defterde dışa verilmeyen bir ad yok', () => {
    expect(Object.keys(SCENARIOS).filter(name => !exported.includes(name))).toEqual([]);
  });
});
