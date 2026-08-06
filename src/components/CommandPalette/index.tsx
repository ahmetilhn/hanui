'use client';

import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Search } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { scrollIntoViewIfPossible } from '../../helpers/scroll.helper';
import { named } from '../../helpers/component.helper';
import { captureFocus, isTopModal, pushModal } from '../../helpers/focus.helper';
import { matchesSearch } from '../../helpers/text.helper';
import useScrollLock from '../../hooks/useScrollLock';

import styles from './index.module.scss';

export type CommandItem = {
  id: string;
  label: string;
  /** Ayırt edici ikincil satır — bir komutun nereye götürdüğü. */
  description?: string;
  /** Gruplama başlığı ("Gezinme", "Eylemler"). Aynı grup ardışık çizilir. */
  group?: string;
  icon?: ReactNode;
  /** Kısayol ipucu ("⌘K"). Yalnızca GÖSTERİLİR; tuşu çağıran bağlar. */
  shortcut?: string;
  onSelect: () => void;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  /** Pencerenin erişilebilir adı ("Komut paleti"). ZORUNLU. */
  label: string;
  /** Arama kutusunun yer tutucusu ve erişilebilir adı. ZORUNLU. */
  searchPlaceholder: string;
  /** Sonuç yokken yazılan metin. ZORUNLU. */
  emptyMessage: string;
  className?: string;
  testId?: string;
};

/** Komut paleti — klavyeyle her şeye ulaşma. */
const CommandPalette = ({
  isOpen,
  onClose,
  items,
  label,
  searchPlaceholder,
  emptyMessage,
  className,
  testId,
}: Props) => {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<symbol | null>(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const visible = useMemo(() => {
    if (query.trim() === '') return items;

    const needle = query.trim();
    return items.filter(
      item =>
        matchesSearch(item.label, needle) ||
        (item.description ? matchesSearch(item.description, needle) : false),
    );
  }, [items, query]);

  useScrollLock(isOpen);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    const restoreFocus = captureFocus();
    if (!dialog.open) dialog.showModal();

    /* Arama kutusu ACILIR ACILMAZ odaklanir: paletin tek amaci yazmak.
       `preventScroll` — odaklanan kutu ust katmanda ve iOS sayfayi
       kaydirmaya calisiyordu. */
    inputRef.current?.focus({ preventScroll: true });
    setQuery('');
    setActiveIndex(0);

    const { token, pop } = pushModal();
    tokenRef.current = token;

    return () => {
      pop();
      tokenRef.current = null;
      restoreFocus();
    };
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (tokenRef.current && !isTopModal(tokenRef.current)) return;
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  /* Etkin komut gorunur alanin disina cikmamali. */
  useEffect(() => {
    scrollIntoViewIfPossible(dialogRef.current?.querySelector(`[data-index="${activeIndex}"]`), {
      block: 'nearest',
    });
  }, [activeIndex]);

  const run = (item: CommandItem) => {
    item.onSelect();
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const lastIndex = visible.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(current => (current >= lastIndex ? 0 : current + 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(current => (current <= 0 ? lastIndex : current - 1));
        break;

      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;

      case 'Enter': {
        event.preventDefault();
        const item = visible[activeIndex];
        if (item) run(item);
        break;
      }

      default:
        break;
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={cx(styles.palette, className)}
      aria-label={label}
      data-testid={testId}
      onClick={event => event.target === dialogRef.current && onClose()}
    >
      <div className={styles.palette__search}>
        <Search aria-hidden className={styles.palette__searchIcon} />

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className={styles.palette__input}
          value={query}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded
          aria-controls={listboxId}
          aria-activedescendant={
            visible[activeIndex] ? `${baseId}-option-${activeIndex}` : undefined
          }
          onChange={event => {
            setQuery(event.target.value);
            /* Yazmak etkin komutu BASA ceker: eski satir suzulmus listede
               kalmiyordu. */
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      <ul id={listboxId} role="listbox" aria-label={label} className={styles.palette__list}>
        {visible.map((item, index) => {
          /* Grup basligi yalnizca DEGISTIGINDE cizilir: her satirin ustune
             baslik koymak listeyi iki katina cikariyordu. */
          const isNewGroup = item.group !== undefined && item.group !== visible[index - 1]?.group;

          return (
            <li key={item.id}>
              {isNewGroup && (
                /* `aria-hidden`: baslik bir SECENEK degil; listbox'in cocugu
                   olarak okunsaydi ekran okuyucu sayimi bozuluyordu. */
                <span className={styles.palette__group} aria-hidden>
                  {item.group}
                </span>
              )}

              <div
                id={`${baseId}-option-${index}`}
                role="option"
                data-index={index}
                aria-selected={index === activeIndex}
                className={cx(
                  styles.palette__item,
                  index === activeIndex && styles['palette__item--active'],
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => run(item)}
              >
                {item.icon && (
                  <span className={styles.palette__icon} aria-hidden>
                    {item.icon}
                  </span>
                )}

                <span className={styles.palette__text}>
                  <span className={styles.palette__label}>{item.label}</span>
                  {item.description && (
                    <span className={styles.palette__description}>{item.description}</span>
                  )}
                </span>

                {item.shortcut && (
                  <kbd className={styles.palette__shortcut} aria-hidden>
                    {item.shortcut}
                  </kbd>
                )}
              </div>
            </li>
          );
        })}

        {visible.length === 0 && <li className={styles.palette__empty}>{emptyMessage}</li>}
      </ul>
    </dialog>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(CommandPalette, 'CommandPalette'),
) as typeof CommandPalette;
