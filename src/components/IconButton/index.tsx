import { type ButtonHTMLAttributes, forwardRef, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

export type IconButtonVariant = 'ghost' | 'outline' | 'solid' | 'cart' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  /** Görsel etiketi olmayan düğmenin erişilebilir adı — ZORUNLU. */
  label: string;
  /**
   * `cart` <strong>yalnızca dönüşüm eyleminde</strong> kullanılır — ekranda
   * görünen tek doygun turuncu odur. Nötr dolgu için `solid`.
   */
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  testId?: string;
};

/**
 * Yalnızca ikon taşıyan düğme.
 *
 * <p>`label` <strong>zorunlu</strong>: görsel etiketi olmayan bir düğme
 * `aria-label` olmadan ekran okuyucuda "düğme" diye okunur. Zorunlu tutmak,
 * unutulmasını derleme zamanında engeller.
 *
 * <p>Dokunma hedefi 44×44 px'ten küçük olamaz (WCAG 2.5.8) — görsel kutu
 * daha küçük olsa bile tıklanabilir alan korunur.
 */
const IconButton = forwardRef<HTMLButtonElement, Props>(
  (
    { icon, label, variant = 'ghost', size = 'md', className, type = 'button', testId, ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.iconButton,
        styles[`iconButton--${variant}`],
        styles[`iconButton--${size}`],
        className,
      )}
      aria-label={label}
      title={label}
      data-testid={testId}
      {...rest}
    >
      {icon}
    </button>
  ),
);

IconButton.displayName = 'IconButton';

export default memo(IconButton) as typeof IconButton;
