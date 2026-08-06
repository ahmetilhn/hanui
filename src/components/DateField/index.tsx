'use client';

import { forwardRef, type InputHTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** `date` (varsayılan) · `datetime-local` · `month` · `time`. */
  type?: 'date' | 'datetime-local' | 'month' | 'time';
  testId?: string;
};

/** Tarih alanı — <strong>yerel</strong> `<input type="date">`. */
const DateField = forwardRef<HTMLInputElement, Props>(
  ({ type = 'date', className, testId, ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cx(styles.dateField, className)}
      data-testid={testId}
      {...rest}
    />
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(DateField, 'DateField')) as typeof DateField;

export type DateRangeValue = {
  /** ISO tarih (`YYYY-MM-DD`) ya da boş dize. */
  start: string;
  end: string;
};

type RangeProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Başlangıç alanının erişilebilir adı ("Başlangıç"). ZORUNLU. */
  startLabel: string;
  /** Bitiş alanının erişilebilir adı ("Bitiş"). ZORUNLU. */
  endLabel: string;
  /** İki alanın arasındaki ayraç. Varsayılan yarım tire. */
  separator?: string;
  /** Ölçeğin uçları; ikisi de yerel öğeye geçer. */
  min?: string;
  max?: string;
  /** Seçilen aralığın okunur özetini gösterir. */
  isSummaryVisible?: boolean;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
};

/** Tarih aralığı — <strong>iki yerel alan</strong>, taklit takvim değil. */
const DateRangeBase = ({
  value,
  onChange,
  startLabel,
  endLabel,
  separator = '–',
  min,
  max,
  isSummaryVisible,
  isDisabled,
  className,
  testId,
}: RangeProps) => {
  const { labels } = useHanui();

  /* OZET `Intl` ile ve `labels.locale`den. */
  const summary = (() => {
    if (!isSummaryVisible || !labels?.locale || value.start === '' || value.end === '') return null;

    try {
      const format = new Intl.DateTimeFormat(labels.locale, { dateStyle: 'medium' });
      return `${format.format(new Date(value.start))} ${separator} ${format.format(new Date(value.end))}`;
    } catch {
      /* Gecersiz yerel ayar ya da tarih: ozet cizilmez, alanlar calismaya
         devam eder. Bir bicimlendirme hatasi girisi engellememeli. */
      return null;
    }
  })();

  return (
    <div className={cx(styles.range, className)} data-testid={testId}>
      <div className={styles.range__row}>
        <DateField
          className={styles.range__field}
          aria-label={startLabel}
          value={value.start}
          min={min}
          /* Baslangic bitisi GECEMEZ: tarayici gecersiz araligi en bastan
             sectirmiyor. */
          max={value.end || max}
          disabled={isDisabled}
          onChange={event => onChange({ ...value, start: event.target.value })}
        />

        <span className={styles.range__separator} aria-hidden>
          {separator}
        </span>

        <DateField
          className={styles.range__field}
          aria-label={endLabel}
          value={value.end}
          min={value.start || min}
          max={max}
          disabled={isDisabled}
          onChange={event => onChange({ ...value, end: event.target.value })}
        />
      </div>

      {summary && <span className={styles.range__summary}>{summary}</span>}
    </div>
  );
};

export const DateRange = /*#__PURE__*/ named(/*#__PURE__*/ memo(DateRangeBase), 'DateRange');
