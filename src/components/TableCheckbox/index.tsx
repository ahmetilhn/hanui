import { forwardRef, type InputHTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';

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

/**
 * Tablo hücresindeki toplu seçim kutusu.
 *
 * <h3>Neden `Checkbox` değil</h3>
 * Seçim sütununda etiket sütun başlığıdır ve `Checkbox` bileşeninin ürettiği
 * `<label>` sarmalayıcısı (yan yana kutu + metin yerleşimi) hücreyi bozar.
 * Doğru olan yalın `<input type="checkbox">` + `aria-label` — bu bileşen o
 * deseni resmileştirir ki ekranlar çıplak `<input>` yazmak zorunda kalmasın.
 *
 * <p>Renk `Checkbox` ile aynı kaynaktan: `accent-color` mavi — onay kutusu bir
 * seçimdir, bir dönüşüm değil.
 */
const TableCheckbox = forwardRef<HTMLInputElement, Props>(
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

TableCheckbox.displayName = 'TableCheckbox';

export default memo(TableCheckbox) as typeof TableCheckbox;
