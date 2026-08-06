'use client';

import { type FC, memo, type ReactNode } from 'react';

import { CheckLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type StepItem = {
  id: string;
  label: string;
  /** Etiketin altındaki bir cümlelik açıklama. */
  description?: ReactNode;
};

type Props = {
  steps: StepItem[];
  /** Bulunulan adımın DİZİNİ (0 tabanlı). Öncesi tamamlanmış sayılır. */
  currentIndex: number;
  /**
   * Bir adıma dönülebiliyorsa verilir. Verilmediğinde adımlar düğme DEĞİL
   * düz metin olur — tıklanabilir görünüp hiçbir şey yapmayan bir adım,
   * kullanıcıya var olmayan bir yol vaat ediyordu.
   */
  onStepClick?: (index: number) => void;
  /** Akışın erişilebilir adı ("Ödeme adımları"). ZORUNLU. */
  label: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  testId?: string;
};

/** Bir adımın durumu — üçü de görsel olarak AYRI çizilir. */
const statusOf = (index: number, currentIndex: number): 'done' | 'current' | 'upcoming' => {
  if (index < currentIndex) return 'done';
  if (index === currentIndex) return 'current';
  return 'upcoming';
};

/** Durumun ekran okuyucuya okunan karşılığı. */
const STATUS_TEXT: Record<'done' | 'current' | 'upcoming', string> = {
  done: 'tamamlandı',
  current: 'şu anki adım',
  upcoming: 'sıradaki',
};

/** Adım göstergesi (stepper) — çok adımlı akışta NEREDE olunduğu. */
const Steps: FC<Props> = ({
  steps,
  currentIndex,
  onStepClick,
  label,
  orientation = 'horizontal',
  className,
  testId,
}) => (
  <ol
    className={cx(styles.steps, styles[`steps--${orientation}`], className)}
    aria-label={label}
    data-testid={testId}
  >
    {steps.map((step, index) => {
      const status = statusOf(index, currentIndex);
      /* Ileri atlamak YOK: atlanan adimin verisi toplanmadan devam edilemez. */
      const isClickable = Boolean(onStepClick) && status === 'done';

      const body = (
        <>
          <span className={styles.steps__marker} aria-hidden>
            {status === 'done' ? <CheckLg /> : index + 1}
          </span>

          <span className={styles.steps__text}>
            <span className={styles.steps__label}>{step.label}</span>
            {step.description && (
              <span className={styles.steps__description}>{step.description}</span>
            )}
          </span>

          {/* Durum METIN olarak da okunur: gorsel isaret ekran okuyucuya
              gecmiyor ve `aria-current` yalnizca bulunulan adimi soyluyor. */}
          <span className={styles.steps__status}>{STATUS_TEXT[status]}</span>
        </>
      );

      return (
        <li
          key={step.id}
          className={cx(styles.steps__item, styles[`steps__item--${status}`])}
          aria-current={status === 'current' ? 'step' : undefined}
        >
          {isClickable ? (
            <button
              type="button"
              className={styles.steps__button}
              onClick={() => onStepClick?.(index)}
            >
              {body}
            </button>
          ) : (
            <span className={styles.steps__button}>{body}</span>
          )}
        </li>
      );
    })}
  </ol>
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Steps, 'Steps')) as typeof Steps;
