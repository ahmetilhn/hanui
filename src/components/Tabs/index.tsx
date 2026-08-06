'use client';

import {
  type FC,
  type KeyboardEvent,
  memo,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { isDefined } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';
import { scrollIntoViewIfPossible } from '../../helpers/scroll.helper';

import styles from './index.module.scss';

export type TabItem = {
  id: string;
  label: string;
  /** Etiketin yanında gösterilen sayı. */
  count?: number;
  /** Sekmenin paneli. */
  content?: ReactNode;
};

type Props = {
  items: TabItem[];
  /** Kontrolsüz kullanımda açılışta seçili sekme. */
  defaultTabId?: string;
  /** Kontrollü kullanım: seçili sekme çağıranın durumunda. */
  activeId?: string;
  onChange?: (id: string) => void;
  /** Sekme çubuğunun erişilebilir adı. */
  ariaLabel?: string;
  /** Ok tuşu yalnızca ODAĞI taşır; seçim `Enter`/`Space` ile yapılır. */
  isManualActivation?: boolean;
  className?: string;
  testId?: string;
};

/** Sekmeler. */
const Tabs: FC<Props> = ({
  items,
  defaultTabId,
  activeId: controlledId,
  onChange,
  ariaLabel,
  isManualActivation,
  className,
  testId,
}) => {
  const baseId = useId();
  const [uncontrolledId, setUncontrolledId] = useState(defaultTabId ?? items[0]?.id);

  const isControlled = isDefined(controlledId);
  const activeId = isControlled ? controlledId : uncontrolledId;

  const activeIndex = items.findIndex(item => item.id === activeId);
  /* Manuel kipte ODAKLANAN sekme ile SECILI sekme ayrisir. */
  const [focusIndex, setFocusIndex] = useState(activeIndex < 0 ? 0 : activeIndex);
  const listRef = useRef<HTMLDivElement>(null);
  const active = items[activeIndex] ?? items[0];

  /* SECILI SEKME GORUNURE KAYDIRILIR. */
  useEffect(() => {
    scrollIntoViewIfPossible(listRef.current?.querySelector(`[aria-selected="true"]`), {
      block: 'nearest',
      inline: 'nearest',
    });
  }, [activeId]);

  const select = (id: string) => {
    if (!isControlled) setUncontrolledId(id);
    onChange?.(id);
  };

  /** Ok tuşlarıyla gezinme; başta/sonda döner. */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isManualActivation && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      select(items[focusIndex].id);
      return;
    }

    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next = ((isManualActivation ? focusIndex : activeIndex) + offset + items.length) % items.length;

    setFocusIndex(next);
    if (!isManualActivation) select(items[next].id);

    /* Odak HER IKI kipte de tasinir: manuel kipte seciliyle odaklanan sekme
       ayrisiyor ve `tabindex` odaklanani izlemek zorunda. */
    document.getElementById(`${baseId}-tab-${items[next].id}`)?.focus();
  };

  if (items.length === 0) return null;

  /*
   * Panelsiz kullanimda `aria-controls` VERILMEZ: var olmayan bir kimligi
   * isaret etmek ekran okuyucuda kirik bir bag uretir.
   */
  const hasPanel = isDefined(active?.content);

  return (
    <div className={cx(styles.tabs, className)} data-testid={testId}>
      <div
        ref={listRef}
        className={styles.tabs__list}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {items.map(item => {
          const isActive = item.id === active.id;

          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={hasPanel ? `${baseId}-panel-${item.id}` : undefined}
              // Yalnızca seçili sekme sekme sırasında; gezinme ok tuşlarıyla.
              /* Donen `tabindex` ODAKLANANI izler: manuel kipte secili sekme
                 ile odaklanan sekme ayri ve Tab'in geri donecegi yer
                 odaklanan olmali. */
              tabIndex={(isManualActivation ? items[focusIndex]?.id === item.id : isActive) ? 0 : -1}
              className={cx(styles.tabs__tab, isActive && styles['tabs__tab--active'])}
              onClick={() => select(item.id)}
            >
              {item.label}
              {isDefined(item.count) && <span className={styles.tabs__count}>{item.count}</span>}
            </button>
          );
        })}
      </div>

      {hasPanel && (
        <div
          id={`${baseId}-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active.id}`}
          className={styles.tabs__panel}
          tabIndex={0}
        >
          {active.content}
        </div>
      )}
    </div>
  );
};

export default /*#__PURE__*/ memo(Tabs) as typeof Tabs;
