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
  /** Değeri `Intl.NumberFormat` ile biçimlendirir. */
  isFormatted?: boolean;
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

/** Tutar gösterimi. */
const Price: FC<Props> = ({
  value,
  currency,
  listValue,
  discountPercent,
  formatDiscount = percent => `%${percent}`,
  isFormatted,
  size = 'md',
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const symbol = resolveLabel('Price.currency', currency, labels?.currency);

  /* BICIMLENDIRME OPSIYONEL ve yerel ayara BAGLI. */
  const format = (raw: string): string => {
    if (!isFormatted || !labels?.locale) return raw;

    /*
     * RAKAM ICERMEYEN deger biciMLENDIRILMEZ. Soyma adimi "Fiyat sorunuz"u
     * bos dizeye indiriyor, `Number('')` ise 0: ekranda tutar yerine "0"
     * yaziyordu — yani fiyat alani dolu gorunup icerigi YANLIS oluyordu.
     * Bicimlendirilemeyen deger oldugu gibi yazilir.
     */
    if (!/\d/.test(raw)) return raw;

    const numeric = Number(
      raw
        .replace(/[^\d.,-]/g, '')
        .replace(/\.(?=\d{3}\b)/g, '')
        .replace(',', '.'),
    );
    if (!Number.isFinite(numeric)) return raw;

    try {
      return new Intl.NumberFormat(labels.locale).format(numeric);
    } catch {
      return raw;
    }
  };

  return (
    <span className={cx(styles.price, styles[`price--${size}`], className)} data-testid={testId}>
      <span className={styles.price__current}>
        {format(value)}
        <span className={styles.price__currency}>{symbol}</span>
      </span>

      {listValue && (
        <s className={styles.price__list}>
          {format(listValue)}
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

export default /*#__PURE__*/ memo(Price) as typeof Price;
