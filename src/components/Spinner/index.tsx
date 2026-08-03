import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  /**
   * Ekran okuyucuya okunacak metin; görsel olarak gizli.
   *
   * <p>ZORUNLU ve boş dizeye izin verilir. Bekleme durumunun duyurulması
   * gerekiyor ("Yükleniyor"), ama göstergenin <em>zaten adı olan</em> bir
   * öğenin içinde durduğu yerlerde (yükleniyor durumundaki bir düğme)
   * duyurmak tekrar üretiyor. O zaman `label=""` geçilir; karar çağıranın
   * ve bilinçli olmak zorunda.
   */
  label: string;
  className?: string;
};

/**
 * Yükleme göstergesi.
 *
 * <p>İskelet (`Skeleton`) tercih edilir; bu bileşen yalnızca <em>şekli
 * bilinmeyen</em> bir bekleme için — düğme içi işlem veya belirsiz süreli bir
 * sorgu gibi.
 */
const Spinner: FC<Props> = ({ size = 'md', label, className }) => (
  <span className={cx(styles.spinner, styles[`spinner--${size}`], className)} role="status">
    <span className={styles.spinner__label}>{label}</span>
  </span>
);

export default memo(Spinner) as typeof Spinner;
