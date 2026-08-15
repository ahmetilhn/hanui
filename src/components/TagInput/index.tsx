'use client';

import { type KeyboardEvent, memo, useEffect, useId, useRef, useState } from 'react';

import { XLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import useAnnounce from '../../hooks/useAnnounce';

import styles from './index.module.scss';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  /** Alanın erişilebilir adı. ZORUNLU. */
  label: string;
  placeholder?: string;
  /** Her etiketin kaldırma düğmesinin ad öneki ("Kaldır"). ZORUNLU. */
  removeLabel: string;
  /** Etiketi bitiren tuşlar. Varsayılan `Enter` ve virgül. */
  separators?: string[];
  /** En fazla kaç etiket. Dolduğunda girdi PASİF olur, gizlenmez. */
  maxTags?: number;
  isDisabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
  testId?: string;
};

/** Etiket girdisi — yazılan metni kaldırılabilir çiplere çevirir. */
const TagInput = ({
  values,
  onChange,
  label,
  placeholder,
  removeLabel,
  separators = ['Enter', ','],
  maxTags,
  isDisabled,
  id,
  className,
  testId,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
}: Props) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * ⚠ Yinelenen etiket uyarısının zamanlayıcısı REF'te tutulur ve unmount'ta
   * temizlenir. Eskiden `window.setTimeout(...)` çıplak çağrılıyordu: bileşen
   * 1 sn dolmadan sökülürse zamanlayıcı ateşleniyor ve sökülmüş bir ağaçta
   * `setDuplicate` çağırıyordu.
   */
  const duplicateTimerRef = useRef(0);

  useEffect(
    () => () => {
      if (duplicateTimerRef.current) window.clearTimeout(duplicateTimerRef.current);
    },
    [],
  );
  const announce = useAnnounce();

  const [draft, setDraft] = useState('');
  /* Yinelenen deger: var olan cip bir kare vurgulanir. */
  const [duplicate, setDuplicate] = useState<string | null>(null);

  const isFull = maxTags !== undefined && values.length >= maxTags;

  const commit = (raw: string) => {
    const value = raw.trim();
    if (value === '') return;

    if (values.includes(value)) {
      /* Sessizce yutmak yerine GOSTER: kullanici "yazdim, kayboldu" diyordu. */
      setDuplicate(value);
      if (duplicateTimerRef.current) window.clearTimeout(duplicateTimerRef.current);
      duplicateTimerRef.current = window.setTimeout(() => setDuplicate(null), 1_000);
      announce(`${value} zaten ekli`, 'assertive');
      setDraft('');
      return;
    }

    if (isFull) return;

    onChange([...values, value]);
    setDraft('');
    announce(`${value} eklendi`);
  };

  const remove = (value: string) => {
    onChange(values.filter(item => item !== value));
    announce(`${value} kaldırıldı`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (separators.includes(event.key)) {
      event.preventDefault();
      commit(draft);
      return;
    }

    /*
     * BOS girdide Backspace SON etiketi kaldirir — metin varken kaldirmaz.
     * Kosulsuz yazildiginda kullanici bir harf silmek isterken etiketi
     * siliyordu.
     */
    if (event.key === 'Backspace' && draft === '') {
      const lastValue = values.at(-1);
      if (lastValue !== undefined) remove(lastValue);
    }
  };

  return (
    <div
      className={cx(
        styles.tagInput,
        isDisabled && styles['tagInput--disabled'],
        isInvalid && styles['tagInput--invalid'],
        className,
      )}
      data-testid={testId}
      /* Kutunun herhangi bir yerine tiklamak girdiyi odaklar: cipler arasindaki
         bosluga tiklayan kullanici hicbir sey olmadigini saniyordu. */
      onClick={() => inputRef.current?.focus()}
    >
      {values.map(value => (
        <span
          key={value}
          className={cx(
            styles.tagInput__tag,
            duplicate === value && styles['tagInput__tag--duplicate'],
          )}
        >
          {value}

          <button
            type="button"
            className={styles.tagInput__remove}
            /* Ad degeri ICERIR: on bes cipin hepsi "Kaldir" diye okundugunda
               hangisi oldugu belli olmuyordu. */
            aria-label={`${value} — ${removeLabel}`}
            disabled={isDisabled}
            onClick={event => {
              event.stopPropagation();
              remove(value);
            }}
          >
            <XLg aria-hidden />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        className={styles.tagInput__field}
        value={draft}
        placeholder={values.length === 0 ? placeholder : undefined}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        disabled={isDisabled || isFull}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        /* Alan terk edildiginde yazilan metin ETIKETE DONER: yarim kalmis bir
           metin kayboluyor ve kullanici bunu ancak gonderdikten sonra fark
           ediyordu. */
        onBlur={() => commit(draft)}
      />
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(TagInput, 'TagInput')) as typeof TagInput;
