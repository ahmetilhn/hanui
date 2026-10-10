/**
 * @ahmetilhn/hanui/chat — sohbet ve uygulama bileşenleri. Dışa verilen her ad bir SÖZLEŞMEDİR.
 *
 * ⚠ Ana girişe ait HER ŞEY (bileşenler, `useHanui`, kancalar) paket adıyla alınır:
 * `import { … } from '@ahmetilhn/hanui'`. Göreli yol yalnızca durumsuz yardımcılar (`cx`,
 * `named`, metin çözümü) ve SCSS içindir. Nöbetçi `__tests__/subentry-boundary.test.ts`.
 * Stiller `@ahmetilhn/hanui/chat.css` — `styles.css`ten AYRI ve ONDAN SONRA içe aktarılır.
 */

// --- Sohbet iskeleti ---
export { default as ChatThread } from './ChatThread';
export { default as ChatMessage, type ChatMessageAuthor } from './ChatMessage';
export { default as PromptInput } from './PromptInput';
export { default as PromptSuggestions, type PromptSuggestion } from './PromptSuggestions';

// --- Yanıt içeriği ---
export { default as Prose } from './Prose';
export { default as CodeBlock } from './CodeBlock';
export { default as ReasoningBlock } from './ReasoningBlock';
export { default as ReasoningText } from './ReasoningText';
export { default as ToolCall, ToolCallSection, type ToolCallStatus } from './ToolCall';
export { default as TerminalOutput, type TerminalChunk } from './TerminalOutput';
export { default as SourceList, type SourceItem } from './SourceList';
export { default as Citation } from './Citation';
export { default as MessageActions } from './MessageActions';

// --- Uygulama ve veri görselleri ---
export { default as AppBar } from './AppBar';
export { default as ActionList, ActionListItem } from './ActionList';
export { default as SegmentBar, type SegmentBarMarker, type SegmentBarSegment } from './SegmentBar';
export { default as Legend, type LegendItem, type LegendTone } from './Legend';
export { default as DescriptionList, type DescriptionItem } from './DescriptionList';
