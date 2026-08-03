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
  /**
   * Ok tuşu yalnızca ODAĞI taşır; seçim `Enter`/`Space` ile yapılır.
   *
   * <p>Varsayılan OTOMATİK etkinleştirme (ok tuşu odakla birlikte seçimi de
   * taşır) ve APG panel içeriği hazır olduğu sürece onu öneriyor. Ama panel
   * PAHALIYSA — her sekme bir istek atıyorsa — otomatik etkinleştirme,
   * kullanıcı beşinci sekmeye giderken dört istek atıyor. Manuel kipte
   * kullanıcı hedefine varıp `Enter`a basıyor: tek istek.
   */
  isManualActivation?: boolean;
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
 *
 * <h3>Klavye (APG: tabs, OTOMATİK etkinleştirme)</h3>
 * <table>
 *   <tr><td>`ArrowRight` / `ArrowLeft`</td><td>sonraki / önceki sekme; uçlarda DÖNER</td></tr>
 *   <tr><td>`Tab`</td><td>çubuktan panele çıkar — çubuk TEK durak</td></tr>
 * </table>
 * Ok tuşu odakla birlikte seçimi de taşır (otomatik etkinleştirme). Panel
 * içeriği hazır ve ucuz olduğu sürece APG'nin önerdiği budur; her sekmesi bir
 * istek atan pahalı bir panelde `isManualActivation` verilir — orada otomatik
 * etkinleştirme, kullanıcı beşinci sekmeye giderken dört istek atıyordu.
 * Nöbetçi: `components/__tests__/keyboard.test.tsx`.
 */
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
   * SECILI SEKME GORUNURE KAYDIRILIR.
   *
   * Cubuk tasabiliyor (`scroll-row`) ve secim adres cubugundan ya da baska bir
   * denetimden de gelebiliyor: on sekmeli bir cubukta yedinci sekme secili
   * gelen bir sayfa, kullaniciya hicbir sekme secili degilmis gibi
   * gorunuyordu.
   *
   * `block: 'nearest'` — dikey kaydirma YOK: cubuk sayfanin ortasindayken
   * `scrollIntoView` bütün sayfayi zipliyordu.
   */
  useEffect(() => {
    listRef.current
      ?.querySelector(`[aria-selected="true"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  const select = (id: string) => {
    if (!isControlled) setUncontrolledId(id);
    onChange?.(id);
  };

  /**
   * Ok tuşlarıyla gezinme; başta/sonda döner.
   *
   * <p>Otomatik kipte ok tuşu odakla birlikte SEÇİMİ de taşır; manuel kipte
   * yalnızca odağı taşır ve seçim `Enter`/`Space` ile yapılır. İkisi de APG
   * içinde geçerli — ayrım panelin pahalı olup olmadığında.
   */
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
   *
   * Kontrol VARLIK uzerinden: `content` bir dize ya da sayi da olabilir ve
   * `undefined`/`null` disindaki her sey bir panel demek.
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
