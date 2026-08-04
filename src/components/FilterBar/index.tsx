import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  /**
   * Filtreler uygulanır. `preventDefault` bileşenin işi; çağıran yalnızca
   * durumunu günceller (sayfayı 1'e almak + aramayı uygulamak gibi).
   */
  onSubmit: () => void;
  /** Alanlar — her biri {@link FilterBarField} içinde. */
  children: ReactNode;
  /** Şeridin sağ ucundaki eylemler ("Uygula" düğmesi gibi). */
  actions?: ReactNode;
  /** Şeridin erişilebilir adı. Verilmezse `labels.filters`. */
  label?: string;
  className?: string;
  testId?: string;
};

/**
 * Filtre şeridi.
 *
 * <h3>Her zaman `<form onSubmit>`</h3>
 * Beş ekran şeridi elle kuruyordu ve yalnızca üçü `<form>` kullanıyordu: arama
 * kutusunda Enter üç ekranda filtreyi uyguluyor, ikisinde hiçbir şey
 * yapmıyordu. Şerit artık her zaman bir formdur ve görünür bir gönderme düğmesi
 * olmasa bile Enter çalışsın diye gizli bir yedek gönderme düğmesi taşır
 * (birden çok alanı olan formda tarayıcının örtük gönderimi ancak bir gönderme
 * düğmesi varsa çalışır).
 *
 * <h3>Denetimler tek hizada</h3>
 * Şerit alanları alt kenardan hizalar; etiketli ve etiketsiz alanın yan yana
 * durması bunu bozmaz. Bozan şey denetimin <strong>altına</strong> yazılan
 * yardım/hata metniydi: alanın alt kenarı artık denetimin değil metnin kenarı
 * oluyor ve denetim komşularından yukarı kaçıyordu (ölçüldü: bir ekranda 24 px
 * kaçık iki girdi). Şeridin içindeki `Field` mesajı denetimin
 * <em>üstüne</em> alır — etiket, ipucu, denetim. DOM sırası değişmez, yani
 * ekran okuyucu yine "etiket, denetim, hata, ipucu" duyar.
 *
 * <h3>320px'te taşma yok</h3>
 * Alanlar `min-width: 240–280px` taşıyordu ve en dar ekranda şerit sayfayı yana
 * kaydırıyordu. Genişlik artık `flex-basis` ile istenir, `min-width: 0` ile
 * daraltılabilir kalır: alan tercihen 220px'tir ama sığmadığı yerde küçülür,
 * taşmaz.
 */
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
  /**
   * Alan kalan genişliği doldurur (arama kutusu). Diğer alanlar tercih
   * ettikleri genişlikte kalır ve şerit sağa doğru boşluk bırakır.
   */
  isWide?: boolean;
  className?: string;
};

/**
 * Şerit içindeki tek alanın genişlik sözleşmesi. İçine `Field` + girdi ya da
 * yalın `Input` konur; genişlik kararı alanın kendisine yazılmaz.
 */
export const FilterBarField: FC<FieldProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, isWide, className }) => (
    <div className={cx(styles.field, isWide && styles['field--wide'], className)}>{children}</div>
  )),
  'FilterBarField',
);

export default /*#__PURE__*/ memo(FilterBar) as typeof FilterBar;
