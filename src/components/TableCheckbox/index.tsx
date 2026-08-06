import { forwardRef, type InputHTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'aria-label'> & {
  /**
   * Erişilebilir ad — ZORUNLU. Hücrede görünür etiket yok (etiket sütun
   * başlığında); adsız kutu ekran okuyucuda yalnızca "onay kutusu" diye
   * okunur. Satır kutusunda kaydın kimliğini söyleyin ("SP-2026-000123 seç").
   */
  label: string;
  testId?: string;
};

/** Tablo hücresindeki toplu seçim kutusu. */
const TableCheckbox = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ label, className, testId, ...rest }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      className={cx(styles.checkbox, className)}
      data-testid={testId}
      {...rest}
    />
  ),
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(TableCheckbox, 'TableCheckbox'),
) as typeof TableCheckbox;
