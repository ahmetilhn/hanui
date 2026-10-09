'use client';

import { type FC, memo, type ReactNode, useEffect, useRef } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  /** Sol baştaki marka (logo + ad). */
  brand: ReactNode;
  /** Markanın yanında, esneyen orta bölge (model, bağlantı durumu). */
  start?: ReactNode;
  /** Sağdaki eylem kümesi. */
  end?: ReactNode;
  className?: string;
  testId?: string;
};

/** Belgeye yazılan değişken — yapışkan bileşenler (`DirectoryGroup`, kapaklı `DataTable`) bunu okur. */
const HEIGHT_VARIABLE = '--hanui-header-height';

/**
 * Uygulamanın üst bandı — sayfaya yapışık, sayfanın devamı (bant sayfayı ÖRTMEZ: `nav-*`).
 *
 * Kendi yüksekliğini ölçüp `--hanui-header-height`e yazar. README bu `ResizeObserver` kodunu her
 * tüketiciye elle yazdırıyordu; sabit bir sayı yazan da vardı ve bant mobilde iki satıra düştüğünde
 * yapışkan başlıklar altında kalıyordu.
 */
const AppBar: FC<Props> = ({ brand, start, end, className, testId }) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const root = document.documentElement;
    const observer = new ResizeObserver(([entry]) =>
      root.style.setProperty(
        HEIGHT_VARIABLE,
        `${Math.round(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight)}px`,
      ),
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      root.style.removeProperty(HEIGHT_VARIABLE);
    };
  }, []);

  return (
    <header ref={ref} className={cx(styles.bar, className)} data-testid={testId}>
      <div className={styles.bar__brand}>{brand}</div>
      {start !== undefined && <div className={styles.bar__start}>{start}</div>}
      {end !== undefined && <div className={styles.bar__end}>{end}</div>}
    </header>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(AppBar, 'AppBar')) as typeof AppBar;
