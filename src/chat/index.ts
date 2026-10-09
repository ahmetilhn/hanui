/**
 * @ahmetilhn/hanui/chat — sohbet ve uygulama bileşenleri. Dışa verilen her ad bir SÖZLEŞMEDİR.
 *
 * ⚠ Ana girişe ait HER ŞEY (bileşenler, `useHanui`, kancalar) paket adıyla alınır:
 * `import { … } from '@ahmetilhn/hanui'`. Göreli yol yalnızca durumsuz yardımcılar (`cx`,
 * `named`, metin çözümü) ve SCSS içindir. Nöbetçi `__tests__/chat/boundary.test.ts`.
 * Stiller `@ahmetilhn/hanui/chat.css` — `styles.css`ten AYRI.
 */

export { default as Legend, type LegendItem, type LegendTone } from './Legend';
