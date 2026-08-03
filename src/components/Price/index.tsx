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
  /**
   * Değeri `Intl.NumberFormat` ile biçimlendirir.
   *
   * <p>`value` bu kipte de bir DİZE olarak kalıyor ve sayıya çevriliyor —
   * bileşen hâlâ HESAP YAPMIYOR, yalnızca ayırıcıları ve para birimi
   * konumunu yerel ayardan alıyor. Yerel ayar `labels.locale`den; verilmezse
   * biçimlendirme YAPILMAZ ve değer olduğu gibi yazılır. Yanlış yerel ayarda
   * biçimlendirilmiş bir tutar, biçimlendirilmemiş olandan kötü: "1,250" bir
   * yerde bin iki yüz elli, başka bir yerde bir tam iki yüz elli.
   *
   * <p>Para birimi simgesinin ÖN/ARKA konumu da yerel ayara bağlı ve şu anda
   * her zaman arkada — `Intl` açıldığında doğru konumu o veriyor.
   */
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
  isFormatted,
  size = 'md',
  className,
  testId,
}) => {
  const { labels } = useHanui();
  const symbol = resolveLabel('Price.currency', currency, labels?.currency);

  /*
   * BICIMLENDIRME OPSIYONEL ve yerel ayara BAGLI.
   *
   * Yerel ayar verilmediginde deger olduğu gibi yaziliyor: yanlis yerel ayarda
   * bicimlendirilmis bir tutar, bicimlendirilmemis olandan kotu — "1,250" bir
   * yerde bin iki yuz elli, baska bir yerde bir tam iki yuz elli.
   *
   * Cevrilemeyen bir deger de oldugu gibi kalir. Bir bicimlendirme hatasi
   * FIYATI gizleyemez; ekranda bir sey olmamasindan iyisi ham degerdir.
   */
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
