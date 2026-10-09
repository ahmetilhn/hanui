import { LABELS } from '../fixtures/labels';
import { type ReactElement } from 'react';

import { render } from '@testing-library/react';

import { axe } from '@tests/support/axe';
import * as chat from '@/chat';
import * as hanui from '@/index';

const {
  ActionList,
  ActionListItem,
  AppBar,
  ChatMessage,
  ChatThread,
  Citation,
  CodeBlock,
  DescriptionList,
  Legend,
  MessageActions,
  PromptInput,
  PromptSuggestions,
  Prose,
  ReasoningBlock,
  ReasoningText,
  SegmentBar,
  SourceList,
  TerminalOutput,
  ToolCall,
  ToolCallSection,
} = chat;

const noop = () => {};

/*
 * SOHBET GİRİŞİNİN EKSEN TARAMASI — ana girişin taramasıyla aynı sözleşme: dışa verilen her bileşen,
 * her anlamlı durumunda. Deftere girmeyen yeni bir sohbet bileşeni testi kırar.
 */
const SCENARIOS: Record<string, Record<string, ReactElement>> = {
  ChatThread: {
    default: (
      <ChatThread
        dock={<PromptInput value="" onChange={noop} onSubmit={noop} placeholder="Mesaj yazın" />}
      >
        <ChatMessage author="user">Merhaba</ChatMessage>
        <ChatMessage author="assistant">Selam</ChatMessage>
      </ChatThread>
    ),
  },
  ChatMessage: {
    user: <ChatMessage author="user">Bir soru</ChatMessage>,
    assistant: (
      <ChatMessage
        author="assistant"
        avatar={<hanui.Avatar name="Asistan" tone="brand" shape="rounded" size="sm" />}
        actions={
          <MessageActions meta="2,4 sn">
            <hanui.IconButton icon={<span>c</span>} label="Kopyala" size="sm" />
          </MessageActions>
        }
      >
        Yanıt
      </ChatMessage>
    ),
    streaming: (
      <ChatMessage author="assistant" isStreaming>
        Yazıyor
      </ChatMessage>
    ),
  },
  PromptInput: {
    empty: <PromptInput value="" onChange={noop} onSubmit={noop} placeholder="Mesaj yazın" />,
    busy: (
      <PromptInput
        value=""
        onChange={noop}
        onSubmit={noop}
        onStop={noop}
        isBusy
        placeholder="Mesaj yazın"
      />
    ),
    disabled: (
      <PromptInput value="x" onChange={noop} onSubmit={noop} isDisabled placeholder="Mesaj yazın" />
    ),
  },
  PromptSuggestions: {
    default: (
      <PromptSuggestions
        label="Örnek istemler"
        items={[{ id: 'a', label: 'Bir özet çıkar', description: 'Uzun bir metni kısalt' }]}
        onPick={noop}
      />
    ),
  },
  Prose: {
    default: (
      <Prose>
        <h2>Başlık</h2>
        <p>
          Metin ve <a href="/x">bağlantı</a>.
        </p>
      </Prose>
    ),
  },
  CodeBlock: {
    plain: <CodeBlock code="const a = 1;" language="ts" />,
    highlighted: <CodeBlock code="a" language="ts" html="<pre><code><span>a</span></code></pre>" />,
  },
  ReasoningBlock: {
    running: (
      <ReasoningBlock summary="Düşünüyor" isRunning>
        Gövde
      </ReasoningBlock>
    ),
    done: <ReasoningBlock summary="Düşündü · 2 araç">Gövde</ReasoningBlock>,
  },
  ReasoningText: { default: <ReasoningText text="Önce haritayı okuyorum." label="Akıl yürütme" /> },
  ToolCall: {
    running: <ToolCall name="bash" summary="ls -la" status="running" meta="1 sn" />,
    expanded: (
      <ToolCall name="araştır" summary="hanui" status="ok" isDefaultOpen>
        <ToolCallSection label="Çıktı">3 kaynak</ToolCallSection>
      </ToolCall>
    ),
    error: <ToolCall name="bash" status="error" />,
  },
  ToolCallSection: {
    default: (
      <ToolCall name="bash" status="ok" isDefaultOpen>
        <ToolCallSection label="Girdi">ls</ToolCallSection>
      </ToolCall>
    ),
  },
  TerminalOutput: {
    default: (
      <TerminalOutput
        label="Komut çıktısı"
        command="ls"
        chunks={[
          { stream: 'stdout', text: 'a.txt\n' },
          { stream: 'stderr', text: 'izin yok\n' },
        ]}
      />
    ),
  },
  SourceList: {
    default: (
      <SourceList
        items={[
          { id: '1', title: 'Hanui', url: 'https://example.com', domain: 'example.com' },
          { id: '2', title: 'Yerel belge', onSelect: noop },
        ]}
      />
    ),
  },
  Citation: {
    link: (
      <p>
        Metin <Citation index={1} href="#k1" />
      </p>
    ),
    button: (
      <p>
        Metin <Citation index={2} onClick={noop} />
      </p>
    ),
    static: (
      <p>
        Metin <Citation index={3} />
      </p>
    ),
  },
  MessageActions: {
    default: (
      <MessageActions meta="412 belirteç">
        <hanui.IconButton icon={<span>c</span>} label="Kopyala" size="sm" />
        <hanui.IconButton icon={<span>r</span>} label="Yeniden dene" size="sm" />
      </MessageActions>
    ),
  },
  AppBar: {
    default: (
      <AppBar
        brand="Hanration"
        start={<hanui.StatusDot tone="success" label="Bağlı" />}
        end={<hanui.IconButton icon={<span>t</span>} label="Tema" />}
      />
    ),
  },
  ActionList: {
    actions: (
      <ActionList label="Bağlam haritası">
        <ActionListItem start="A1" end="3" onClick={noop}>
          Önek
        </ActionListItem>
        <ActionListItem start="A2" isMuted onClick={noop}>
          Gizli girdi
        </ActionListItem>
      </ActionList>
    ),
    selection: (
      <ActionList label="Olaylar" rowHeight={44}>
        <ActionListItem isSelected onClick={noop}>
          İstek
        </ActionListItem>
        <ActionListItem isSelected={false} onClick={noop}>
          Yanıt
        </ActionListItem>
      </ActionList>
    ),
  },
  ActionListItem: {
    link: (
      <ActionList label="Bağlantılar">
        <ActionListItem href="/a">Belge</ActionListItem>
      </ActionList>
    ),
  },
  SegmentBar: {
    stacked: (
      <SegmentBar
        label="Bağlam bileşimi"
        max={100}
        segments={[
          { id: 'a', label: 'Önek · 40', tone: 'cat-1', value: 40 },
          { id: 'b', label: 'Harita · 20', tone: 'cat-2', value: 20 },
        ]}
        markers={[{ id: 'budget', at: 80, label: 'Bütçe 80', tone: 'danger' }]}
      />
    ),
    ranges: (
      <SegmentBar
        label="Zaman çizelgesi"
        max={10}
        segments={[
          { id: 'w', label: 'Bekleme 0-2 sn', tone: 'muted', from: 0, to: 2 },
          { id: 's', label: 'Akış 2-6 sn', tone: 'series-1', from: 2, to: 6 },
        ]}
      />
    ),
  },
  DescriptionList: {
    default: (
      <DescriptionList
        items={[
          { term: 'Kimlik', description: 'A3', isTechnical: true },
          { term: 'Tür', description: 'harita' },
        ]}
      />
    ),
  },
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
    render(<hanui.HanuiProvider labels={LABELS}>{element}</hanui.HanuiProvider>);

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
