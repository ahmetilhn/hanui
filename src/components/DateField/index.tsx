'use client';

import { forwardRef, type InputHTMLAttributes, memo } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** `date` (varsayılan) · `datetime-local` · `month` · `time`. */
  type?: 'date' | 'datetime-local' | 'month' | 'time';
  testId?: string;
};

/**
 * Tarih alanı — <strong>yerel</strong> `<input type="date">`.
 *
 * <h3>Neden taklit bir takvim YOK</h3>
 * Bu kütüphanenin kuralı: yerel öğe korunur, taklit yazmanın tek gerekçesi
 * ölçülmüş bir kusurdur ({@link Select} bunun tek istisnası ve gerekçesi
 * orada yazılı). Tarih alanında böyle bir kusur YOK — tersine, yerel öğenin
 * taklidin veremeyeceği dört şeyi var:
 *
 * <ul>
 *   <li><b>Mobilde işletim sisteminin seçicisi.</b> iOS'ta tekerlek, Android'de
 *       takvim — kullanıcının her gün kullandığı, alışkın olduğu arayüz. Hiçbir
 *       web takvimi 360 px'lik bir ekranda ona yaklaşamıyor.</li>
 *   <li><b>Klavyeyle YAZARAK giriş.</b> Doğum tarihini bilen biri "01.01.1980"i
 *       üç saniyede yazıyor; taklit takvimde aynı iş kırk yıl geriye tıklamak
 *       demek.</li>
 *   <li><b>Yerel biçim.</b> Tarayıcı kullanıcının işletim sistemi ayarına göre
 *       gg.aa.yyyy ya da mm/dd/yyyy gösteriyor; değer her zaman ISO
 *       (`YYYY-MM-DD`) kalıyor. İki biçimi elle yönetmek, kütüphanenin
 *       kullanıcının yerel ayarını TAHMİN etmesi demekti.</li>
 *   <li><b>Ekran okuyucu.</b> Alan üç ayrı bölüm (gün/ay/yıl) olarak okunuyor
 *       ve ok tuşlarıyla artırılıyor. APG'ye uygun bir takvim ızgarası bunu
 *       ancak taklit edebilir.</li>
 * </ul>
 *
 * <p>Bedeli: takvim açılışının görünüşü tarayıcıya ait ve tema token'larını
 * izlemiyor. Kabul edildi — açılan panelin rengi, yukarıdaki dördünün
 * yanında küçük bir bedel.
 *
 * <h3>`min` / `max` KULLANIN</h3>
 * İkisi de yerel öğede var ve tarayıcı doğrulamayı kendisi yapıyor. Geçersiz
 * bir tarihi yalnızca gönderimde yakalamak, kullanıcıyı formu doldurduktan
 * sonra geri gönderiyordu.
 */
const DateField = forwardRef<HTMLInputElement, Props>(
  ({ type = 'date', className, testId, ...rest }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cx(styles.dateField, className)}
      data-testid={testId}
      {...rest}
    />
  ),
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(DateField, 'DateField')) as typeof DateField;

export type DateRangeValue = {
  /** ISO tarih (`YYYY-MM-DD`) ya da boş dize. */
  start: string;
  end: string;
};

type RangeProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Başlangıç alanının erişilebilir adı ("Başlangıç"). ZORUNLU. */
  startLabel: string;
  /** Bitiş alanının erişilebilir adı ("Bitiş"). ZORUNLU. */
  endLabel: string;
  /** İki alanın arasındaki ayraç. Varsayılan yarım tire. */
  separator?: string;
  /** Ölçeğin uçları; ikisi de yerel öğeye geçer. */
  min?: string;
  max?: string;
  /** Seçilen aralığın okunur özetini gösterir. */
  isSummaryVisible?: boolean;
  isDisabled?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Tarih aralığı — <strong>iki yerel alan</strong>, taklit takvim değil.
 *
 * <h3>Neden taklit bir aralık takvimi yazılmadı</h3>
 * Taklit bir ay ızgarasının tek gerçek üstünlüğü var: iki ucu AYNI ANDA
 * görmek. Bedeli ise {@link DateField} JSDoc'unda sayılan dört şeyin
 * tamamını kaybetmek — işletim sisteminin seçicisi, yazarak giriş, yerel
 * biçim ve ekran okuyucunun bölümlü okuması — artı APG'ye uygun bir ızgara
 * klavye modelini (`ArrowUp/Down` hafta, `PageUp/Down` ay, `Home/End` hafta
 * sınırı) sıfırdan yazmak.
 *
 * <p>Takas ölçüldüğünde iki uç arasında kalıyor ve karar <strong>henüz
 * verilmedi</strong>: bu bileşen bugün iki yerel alanı doğru şekilde
 * eşleştiriyor. Aynı ekranda ay ızgarası gerçekten gerekiyorsa (bir otel
 * rezervasyonu gibi, "boş günleri gör" ihtiyacı olan bir akış) o zaman
 * yazılır ve gerekçesi <em>o ihtiyaç</em> olur — "aralık seçimi" tek başına
 * yeterli bir gerekçe değil.
 *
 * <h3>İki uç birbirini KISITLAR</h3>
 * Başlangıç seçildiğinde bitiş alanının `min`i, bitiş seçildiğinde
 * başlangıcın `max`ı güncelleniyor: tarayıcı geçersiz aralığı en baştan
 * seçtirmiyor. Sonradan doğrulayıp hata göstermek, kullanıcıyı yaptığı bir
 * seçimden geri döndürüyordu.
 */
const DateRangeBase = ({
  value,
  onChange,
  startLabel,
  endLabel,
  separator = '–',
  min,
  max,
  isSummaryVisible,
  isDisabled,
  className,
  testId,
}: RangeProps) => {
  const { labels } = useHanui();

  /*
   * OZET `Intl` ile ve `labels.locale`den.
   *
   * Iki ISO tarih kullanici icin bir aralik degil iki sayi. Yerel ayar
   * KUTUPHANE tarafindan TAHMIN EDILMEZ; verilmediginde ozet hic cizilmez —
   * yanlis bicimde bir tarih, hic tarih olmamasindan kotu.
   */
  const summary = (() => {
    if (!isSummaryVisible || !labels?.locale || value.start === '' || value.end === '') return null;

    try {
      const format = new Intl.DateTimeFormat(labels.locale, { dateStyle: 'medium' });
      return `${format.format(new Date(value.start))} ${separator} ${format.format(new Date(value.end))}`;
    } catch {
      /* Gecersiz yerel ayar ya da tarih: ozet cizilmez, alanlar calismaya
         devam eder. Bir bicimlendirme hatasi girisi engellememeli. */
      return null;
    }
  })();

  return (
    <div className={cx(styles.range, className)} data-testid={testId}>
      <div className={styles.range__row}>
        <DateField
          className={styles.range__field}
          aria-label={startLabel}
          value={value.start}
          min={min}
          /* Baslangic bitisi GECEMEZ: tarayici gecersiz araligi en bastan
             sectirmiyor. */
          max={value.end || max}
          disabled={isDisabled}
          onChange={event => onChange({ ...value, start: event.target.value })}
        />

        <span className={styles.range__separator} aria-hidden>
          {separator}
        </span>

        <DateField
          className={styles.range__field}
          aria-label={endLabel}
          value={value.end}
          min={value.start || min}
          max={max}
          disabled={isDisabled}
          onChange={event => onChange({ ...value, end: event.target.value })}
        />
      </div>

      {summary && <span className={styles.range__summary}>{summary}</span>}
    </div>
  );
};

export const DateRange = /*#__PURE__*/ named(/*#__PURE__*/ memo(DateRangeBase), 'DateRange');
