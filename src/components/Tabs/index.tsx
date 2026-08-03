'use client';

import { type FC, type KeyboardEvent, memo, type ReactNode, useId, useState } from 'react';

import { isDefined } from '@ahmetilhn/handy-utils';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

export type TabItem = {
  id: string;
  label: string;
  /** Etiketin yanında gösterilen sayı. */
  count?: number;
  /**
   * Sekmenin paneli.
   *
   * <p>Verilmezse bileşen yalnızca <strong>sekme çubuğu</strong> çizer ve
   * içeriği çağıran taraf yönetir. Bir formun üç kipi tek bir panelin içinde
   * yaşıyorsa üç ayrı panel yazmak aynı alanları üç kez tanımlamak olurdu.
   */
  content?: ReactNode;
};

type Props = {
  items: TabItem[];
  /** Kontrolsüz kullanımda açılışta seçili sekme. */
  defaultTabId?: string;
  /**
   * Kontrollü kullanım: seçili sekme çağıranın durumunda.
   *
   * <p>`onChange` ile birlikte verilir. Kontrolsüz sürüm (yalnızca
   * `defaultTabId`) korunur — kendi durumunu tutması yeterli olan sekmelerin
   * dışarıdan yönetilmesi gereksiz.
   */
  activeId?: string;
  onChange?: (id: string) => void;
  /** Sekme çubuğunun erişilebilir adı. */
  ariaLabel?: string;
  className?: string;
  testId?: string;
};

/**
 * Sekmeler.
 *
 * <p>ARIA sekme kalıbı tam uygulanır: `role="tablist"`, `aria-selected`,
 * `aria-controls` ve ok tuşlarıyla gezinme. Yalnızca görsel olarak sekme gibi
 * duran düğmeler, klavye kullanıcısı için gezinilemez bir yapı olurdu.
 *
 * <p>Seçili olmayan panel DOM'dan çıkarılır: gizli panellerdeki bağlantılar ve
 * girdiler sekme sırasına girmemeli.
 *
 * <h3>İki kullanım</h3>
 * <ul>
 *   <li><b>Kontrolsüz + panelli</b> — `items[].content` verilir, bileşen
 *       seçimi kendisi tutar.</li>
 *   <li><b>Kontrollü + panelsiz</b> — `activeId` + `onChange` verilir,
 *       `content` verilmez; bileşen yalnızca çubuğu çizer.</li>
 * </ul>
 */
const Tabs: FC<Props> = ({
  items,
  defaultTabId,
  activeId: controlledId,
  onChange,
  ariaLabel,
  className,
  testId,
}) => {
  const baseId = useId();
  const [uncontrolledId, setUncontrolledId] = useState(defaultTabId ?? items[0]?.id);

  const isControlled = isDefined(controlledId);
  const activeId = isControlled ? controlledId : uncontrolledId;

  const activeIndex = items.findIndex(item => item.id === activeId);
  const active = items[activeIndex] ?? items[0];

  const select = (id: string) => {
    if (!isControlled) setUncontrolledId(id);
    onChange?.(id);
  };

  /** Ok tuşlarıyla sekme değiştirme; başta/sonda döner. */
  const handleKeyDown = (event: KeyboardEvent) => {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next = (activeIndex + offset + items.length) % items.length;
    select(items[next].id);
    document.getElementById(`${baseId}-tab-${items[next].id}`)?.focus();
  };

  if (items.length === 0) return null;

  /*
   * Panelsiz kullanimda `aria-controls` VERILMEZ: var olmayan bir kimligi
   * isaret etmek ekran okuyucuda kirik bir bag uretir.
   *
   * Kontrol VARLIK uzerinden: `content` bir dize ya da sayi da olabilir ve
   * `undefined`/`null` disindaki her sey bir panel demek.
   */
  const hasPanel = isDefined(active?.content);

  return (
    <div className={cx(styles.tabs, className)} data-testid={testId}>
      <div
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
              tabIndex={isActive ? 0 : -1}
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

export default memo(Tabs) as typeof Tabs;
