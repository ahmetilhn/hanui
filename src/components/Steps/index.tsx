'use client';

import { type FC, memo, type ReactNode } from 'react';

import { CheckLg } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';

import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

export type StepItem = {
  id: string;
  label: string;
  /** Etiketin altındaki bir cümlelik açıklama. */
  description?: ReactNode;
};

type Props = {
  steps: StepItem[];
  /**
   * Bulunulan adımın DİZİNİ (0 tabanlı). Öncesi tamamlanmış sayılır.
   * VERİLMEZSE liste ilerleme değil SIRALI TALİMAT olarak çizilir: durum
   * metni yok, tik yok, `aria-current` yok — yalnızca numaralı adımlar
   * ("olası nedenler — kontrol sırasıyla" gibi teşhis listeleri).
   */
  currentIndex?: number;
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

/*
 * ⚠ DURUM METNI SR-ONLY ve SAGLAYICIDAN gelir; gorsel isaret (tik, dolu
 * daire) ekran okuyucuya hicbir sey soylemiyor.
 */
const STATUS_KEY: Record<'done' | 'current' | 'upcoming', 'completed' | 'current' | 'upcoming'> = {
  done: 'completed',
  current: 'current',
  upcoming: 'upcoming',
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
}) => {
  const { labels } = useHanui();

  return (
    <ol
      className={cx(
        styles.steps,
        styles[`steps--${orientation}`],
        currentIndex === undefined && styles['steps--static'],
        className,
      )}
      aria-label={label}
      data-testid={testId}
    >
      {steps.map((step, index) => {
        /* Statik listede durum kavrami YOK — hicbir adim "bulunulan" degil. */
        const status = currentIndex === undefined ? undefined : statusOf(index, currentIndex);
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
            {status && (
              <span className={styles.steps__status}>
                {resolveLabel(`Steps.${STATUS_KEY[status]}`, labels?.steps?.[STATUS_KEY[status]])}
              </span>
            )}
          </>
        );

        return (
          <li
            key={step.id}
            className={cx(styles.steps__item, status && styles[`steps__item--${status}`])}
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
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Steps, 'Steps')) as typeof Steps;
