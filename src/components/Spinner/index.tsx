import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  /**
   * Ekran okuyucuya okunacak metin; görsel olarak gizli.
   *
   * <p>Verilmezse `labels.loading` okunur. Boş dizeye BİLİNÇLİ olarak izin
   * verilir: göstergenin <em>zaten adı olan</em> bir öğenin içinde durduğu
   * yerlerde (yükleniyor durumundaki bir düğme) duyurmak tekrar üretiyor.
   * `label=""` orada doğru olan ve config'i de bastırır.
   */
  label?: string;
  className?: string;
};

/**
 * Yükleme göstergesi.
 *
 * <p>İskelet (`Skeleton`) tercih edilir; bu bileşen yalnızca <em>şekli
 * bilinmeyen</em> bir bekleme için — düğme içi işlem veya belirsiz süreli bir
 * sorgu gibi.
 */
const Spinner: FC<Props> = ({ size = 'md', label, className }) => {
  const { labels } = useHanui();

  return (
    <span className={cx(styles.spinner, styles[`spinner--${size}`], className)} role="status">
      <span className={styles.spinner__label}>
        {label ?? resolveLabel('Spinner.label', labels?.loading)}
      </span>
    </span>
  );
};

export default /*#__PURE__*/ memo(Spinner) as typeof Spinner;
