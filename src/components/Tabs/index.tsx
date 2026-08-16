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

  /*
   * ⚠ `focusIndex` HAM OKUNMAZ — iki ayri ariza uretiyordu.
   *
   * 1. COKME: `items` kisaldiginda indeks kirpilmiyordu. Filtrelenen bir sekme
   *    seridinde 4. indekse gidip liste 3'e dusunce manuel kipteki Enter
   *    `items[4].id` okuyup `Cannot read properties of undefined` atiyor ve
   *    cevreleyen sayfayi dusuruyordu.
   * 2. BAYAT ODAK: indeks yalnizca ilk render'da tohumlaniyordu. Kontrollu
   *    `activeId` disaridan degistiginde (serit disindaki bir dugme
   *    `setTab(...)` cagirinca) donen `tabindex` eski sekmede kaliyor ve Tab
   *    kullaniciyi SECILI OLMAYAN sekmeye goturuyordu.
   */
  const safeFocusIndex =
    focusIndex >= 0 && focusIndex < items.length ? focusIndex : Math.max(activeIndex, 0);

  useEffect(() => {
    /*
     * Secim degistiginde odak da ona hizalanir. Manuel kipte bu bir kayip
     * DEGIL: kullanici ok tuslariyla gezerken `activeId` degismiyor, yani
     * effect kosmuyor; Enter'a basinca zaten iki indeks esitleniyor.
     */
    setFocusIndex(activeIndex < 0 ? 0 : activeIndex);
  }, [activeIndex]);

  /*
   * SECILI SEKME GORUNURE KAYDIRILIR — ama MOUNT'ta DEGIL.
   *
   * ⚠ Ilk kosu da kaydiriyordu ve `scrollIntoView` yalnizca serit kabini degil
   * SAYFAYI da kaydirir: serit ilk boyamada ekranin altindaysa (uzun bir
   * sayfanin dibindeki sekmeler) sayfa acilir acilmaz kendiliginden oraya
   * atliyordu. Olculdu: hanparca urun detayinda sayfa her acilista alt
   * sekmelere kayiyordu ve kullanici sayfanin basini hic gormuyordu.
   *
   * Kaydirma yalnizca SECIM DEGISTIGINDE anlamli — o an sekme zaten
   * gorunurdedir ve hareket yatay serit icinde kalir.
   */
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

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
      const focused = items[safeFocusIndex];
      if (focused) select(focused.id);
      return;
    }

    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (offset === 0) return;

    event.preventDefault();
    const next =
      ((isManualActivation ? safeFocusIndex : activeIndex) + offset + items.length) % items.length;

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
              /*
               * ⚠ YALNIZCA SECILI SEKMEDE. Panel tek tanedir ve kimligi
               * `active.id` tasir; pasif sekmelere de yazmak var OLMAYAN bir
               * kimligi isaret ederdi (axe `aria-valid-attr-value`) — iki
               * satir yukaridaki kuralin tam ihlali.
               */
              aria-controls={isActive && hasPanel ? `${baseId}-panel-${item.id}` : undefined}
              // Yalnızca seçili sekme sekme sırasında; gezinme ok tuşlarıyla.
              /* Donen `tabindex` ODAKLANANI izler: manuel kipte secili sekme
                 ile odaklanan sekme ayri ve Tab'in geri donecegi yer
                 odaklanan olmali. */
              tabIndex={
                (isManualActivation ? items[safeFocusIndex]?.id === item.id : isActive) ? 0 : -1
              }
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
