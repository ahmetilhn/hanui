import { type FC, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = {
  /** BİÇİMLENMİŞ tutar: "1.299,90". Bileşen hesap yapmaz. */
  value: string;
  /** Para birimi simgesi ya da kodu. Verilmezse `labels.currency`. */
  currency?: string;
  /** Üstü çizili liste fiyatı; indirim varsa verilir (biçimlenmiş). */
  listValue?: string;
  /** İndirim oranı (tam sayı yüzde). */
  discountPercent?: number;
  /** İndirim rozetinin metnini üretir ("%20", "-20%"). */
  formatDiscount?: (percent: number) => string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  testId?: string;
};

/**
 * Tutar gösterimi.
 *
 * <h3>Bileşen HESAP YAPMAZ</h3>
 * Tutar biçimlenmiş gelir. Kuruşu istemcide çevirmek kayan nokta hatası riski
 * taşır ve biçimlendirme iki yerde ayrışır: aynı ürün listede "1.299,90",
 * detayda "1299.9" çıkıyordu. İndirim oranı da dışarıdan gelir — burada
 * `(1 - fiyat/liste)` hesaplamak için biçimlenmiş metni sayıya çevirmek
 * gerekirdi ve o kırılgan bir iş.
 *
 * <h3>Tutar NÖTR kalır</h3>
 * Güncel tutar `$text`; üstü çizili eski tutar `$text-3`; indirim yüzdesi
 * küçük bir yeşil rozet. Kırmızı fiyat ucuz durur ve kırmızıyı "olumsuz"
 * anlamından koparır.
 */
const Price: FC<Props> = ({
  value,
  currency,
  listValue,
  discountPercent,
  formatDiscount = percent => `%${percent}`,
  size = 'md',
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const symbol = resolveLabel('Price.currency', currency, labels?.currency);

  return (
    <span className={cx(styles.price, styles[`price--${size}`], className)} data-testid={testId}>
      <span className={styles.price__current}>
        {value}
        <span className={styles.price__currency}>{symbol}</span>
      </span>

      {listValue && (
        <s className={styles.price__list}>
          {listValue}
          <span className={styles.price__currency}>{symbol}</span>
        </s>
      )}

      {/* `isDefined` DEGIL acik karsilastirma: handy-utils'in koruyucusu
        `Exclude<any, …>` donuyor ve TypeScript'te daraltma uretmiyor. */}
      {discountPercent !== undefined && discountPercent > 0 && (
        <span className={styles.price__discount}>{formatDiscount(discountPercent)}</span>
      )}
    </span>
  );
};

export default memo(Price) as typeof Price;
