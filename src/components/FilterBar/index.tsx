import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  /**
   * Filtreler uygulanır. `preventDefault` bileşenin işi; çağıran yalnızca durumunu günceller
   * (sayfayı 1'e almak + aramayı uygulamak gibi).
   */
  onSubmit: () => void;
  /** Alanlar — her biri FilterBarField içinde. */
  children: ReactNode;
  /** Şeridin sağ ucundaki eylemler ("Uygula" düğmesi gibi). */
  actions?: ReactNode;
  /** Şeridin erişilebilir adı. */
  label?: string;
  className?: string;
  testId?: string;
};

/** Filtre şeridi. */
const FilterBar: FC<Props> = ({ onSubmit, children, actions, label, className, testId }) => {
  const { labels } = useHanui();

  return (
    <form
      className={cx(styles.bar, className)}
      aria-label={resolveLabel('FilterBar.label', label, labels?.filters)}
      data-testid={testId}
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}

      {/*
      Enter'ın yedeği. Görünmez ama tarayıcı için formun varsayılan gönderme
      düğmesi: `display: none` örtük gönderimi bozmaz. Görünür "Uygula" düğmesi
      `actions` ile ayrıca verilebilir; ikisi aynı submit olayına düşer.
    */}
      <button type="submit" className={styles.bar__hiddenSubmit} tabIndex={-1} aria-hidden />

      {actions && <div className={styles.bar__actions}>{actions}</div>}
    </form>
  );
};

type FieldProps = {
  children: ReactNode;
  /** Alan kalan genişliği doldurur (arama kutusu). */
  isWide?: boolean;
  className?: string;
};

/** Şerit içindeki tek alanın genişlik sözleşmesi. */
export const FilterBarField: FC<FieldProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, isWide, className }) => (
    <div className={cx(styles.field, isWide && styles['field--wide'], className)}>{children}</div>
  )),
  'FilterBarField',
);

export default /*#__PURE__*/ memo(FilterBar) as typeof FilterBar;
