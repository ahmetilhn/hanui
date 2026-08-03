import { Children, type FC, type HTMLAttributes, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { ExclamationCircleIcon } from '../../icons';

import styles from './index.module.scss';

export type DataTableColumn = {
  /** Sütun kimliği (React key). */
  key: string;
  /** Başlık hücresinin içeriği. Toplu seçim kutusu gibi öğeler de girebilir. */
  label?: ReactNode;
  /**
   * Görsel başlığı olmayan sütunun erişilebilir adı (eylem sütunu gibi).
   * Boş bir `<th>` ekran okuyucuda adsız bir sütun bırakıyordu.
   */
  srLabel?: string;
  /**
   * Sıralanabilir sütunun yönü (`aria-sort`). Sıralama düğmesi `label` içinde
   * yaşar; yön bilgisi ekran okuyucu için başlık hücresine yazılır.
   */
  ariaSort?: 'ascending' | 'descending';
  className?: string;
};

type Props = {
  columns: DataTableColumn[];
  /**
   * Gövde satırları (`<tr>`). Ekranların özel hücreleri, bağlantıları ve satır
   * tintleri burada yaşar; tablo yalnızca kabuğu ve durum satırlarını
   * üstlenir. Uyarı tinti için {@link DataTableRow}.
   */
  children?: ReactNode;
  /** Satır yokken gösterilen metin. */
  emptyMessage: string;
  /** Yükleme sürerken satırların yerine gösterilen metin. */
  loadingMessage: string;
  isLoading?: boolean;
  /**
   * Liste ÇEKİLEMEDİ. <strong>"Yüklenemedi" ile "boş" ayrı durumlardır</strong>:
   * hata verilmişken boş mesajı asla çizilmez — ağ hatasını "kayıt kalmamış"
   * diye okutmak kullanıcıya yanlış karar verdirir. Hatayı tablonun dışında
   * (`Alert`) gösteren ekran bu prop'u geçmez.
   */
  error?: string | null;
  /**
   * Gövde `100dvh - <bant>` ile sınırlanır ve başlık satırı kendi kaydırma
   * alanına yapışır. Sınırsız yükseklikte `position: sticky` HİÇ çalışmıyordu:
   * `overflow` alanı ekrandan uzun olunca başlık sayfayla birlikte yukarı çıkıp
   * gidiyordu.
   */
  hasViewportCap?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Operasyon veri tablosu — durum satırlı tablo sözleşmesi.
 *
 * <h3>Neden bir bileşen</h3>
 * On iki ekranda on bir ham tablo ve altı kaydırma sarmalayıcısı kopyası
 * vardı; üçü farklı davranıyordu (kimi dikey kaymıyor, kiminin başlığı
 * yapışmıyor). Kabuk (yüzey + hairline + `overflow: auto`), tablo görünümü ve
 * üç durum satırı (yükleniyor / hata / boş) artık tek yerde; `colSpan` sütun
 * sayısından kendiliğinden hesaplanır — elle yazılan `colSpan={8}` bir sütun
 * eklenince sessizce yanlış kalıyordu.
 *
 * <h3>Durum öncelik sırası</h3>
 * `error` &gt; `isLoading` &gt; boş &gt; satırlar. Hata varken yükleme veya boş
 * mesajı gösterilmez; yüklenirken bayat satır çizilmez.
 */
const DataTable: FC<Props> = ({
  columns,
  children,
  isLoading,
  error,
  emptyMessage,
  loadingMessage,
  hasViewportCap,
  className,
  testId,
}) => {
  /*
   * Bosluk karari satir SAYISINDAN verilir; cagiranin ayrica `isEmpty` gecmesi
   * gerekmez. Satirlar tek bir Fragment icinde verilirse sayi 1 gorunur —
   * satirlari dogrudan (ya da dizi olarak) verin.
   */
  const rowCount = Children.count(children);

  const renderStateRow = (content: ReactNode, modifier?: 'error') => (
    <tr>
      <td
        colSpan={columns.length}
        className={cx(styles.state, modifier && styles[`state--${modifier}`])}
      >
        {content}
      </td>
    </tr>
  );

  return (
    <div
      className={cx(styles.wrapper, hasViewportCap && styles['wrapper--capped'], className)}
      data-testid={testId}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                aria-label={column.srLabel}
                aria-sort={column.ariaSort}
                className={column.className}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {error
            ? renderStateRow(
                <span role="alert" className={styles.state__message}>
                  <ExclamationCircleIcon />
                  {error}
                </span>,
                'error',
              )
            : isLoading
              ? renderStateRow(loadingMessage)
              : rowCount === 0
                ? renderStateRow(emptyMessage)
                : children}
        </tbody>
      </table>
    </div>
  );
};

type RowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
  /**
   * Satır dikkat bekleyen iş taşıyor (kritik stok, karar bekleyen talep).
   *
   * <p>TEK desen: tint zemin + ilk hücrede sol kenar işareti. Önceden iki
   * uygulama vardı — yalnız düz uyarı zemini ve zemin + sol iç gölge. Zemin
   * tek başına yetmiyordu: hover vurgusu tinti ezince satırın "iş bekliyor"
   * bilgisi kayboluyordu ve renk tek başına zaten anlam taşıyamaz (WCAG
   * 1.4.1) — sol işaret hover'da da yerinde kalır.
   */
  isWarning?: boolean;
};

export const DataTableRow: FC<RowProps> = memo(({ isWarning, className, children, ...rest }) => (
  <tr className={cx(isWarning && styles['row--warning'], className)} {...rest}>
    {children}
  </tr>
));

DataTableRow.displayName = 'DataTableRow';

export default memo(DataTable) as typeof DataTable;
