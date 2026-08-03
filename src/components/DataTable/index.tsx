import { Children, type FC, type HTMLAttributes, memo, type ReactNode } from 'react';

import { ExclamationCircleFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';
import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';

import styles from './index.module.scss';

export type DataTableColumn = {
  /** Sütun kimliği (React key). */
  key: string;
  /** Başlık hücresinin içeriği. Toplu seçim kutusu gibi öğeler de girebilir. */
  label?: ReactNode;
  /**
   * Görsel başlığı olmayan sütunun erişilebilir adı (eylem sütunu gibi).
   * Boş bir `<th>` ekran okuyucuda adsız bir sütun bırakıyordu.
   *
   * <p>Metin `aria-label` OLARAK DEĞİL, görsel olarak gizlenmiş gerçek bir
   * metin düğümü olarak yazılır — gerekçe {@link DataTable} JSDoc'unda.
   */
  srLabel?: string;
  /**
   * Sıralanabilir sütunun yönü (`aria-sort`).
   *
   * <p>`onSort` ile birlikte verildiğinde başlık TIKLANABİLİR olur ve yön
   * oku çizilir. Tek başına verildiğinde yalnızca durumu bildirir —
   * sıralamayı başka bir denetim (bir `Select`) yapıyorsa doğrusu budur.
   */
  ariaSort?: 'ascending' | 'descending';
  /**
   * Sütun sıralanabilir. `DataTable.onSort` ile birlikte anlamlı; ikisinden
   * biri eksikse başlık düz metin kalır — tıklanabilir görünüp hiçbir şey
   * yapmayan bir başlık, kullanıcıya var olmayan bir yetenek vaat ediyordu.
   */
  isSortable?: boolean;
  /**
   * Sütun yatay kaydırmada YERİNDE kalır.
   *
   * <p>Yalnızca İLK sütunda anlamlı: geniş bir tabloda sağa kaydıran
   * kullanıcı hangi satıra baktığını kaybediyordu. İkinci bir yapışkan sütun
   * `left` ofsetinin elle hesaplanmasını gerektirir ve o hesap sütun
   * genişliğine bağlı — desteklenmiyor.
   */
  isSticky?: boolean;
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
  /** Satır yokken gösterilen metin. Verilmezse `labels.dataTable.empty`. */
  emptyMessage?: string;
  /** Yükleme sürerken gösterilen metin. Verilmezse `labels.dataTable.loading`. */
  loadingMessage?: string;
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
  /**
   * Sıralanabilir bir başlığa basıldığında çağrılır.
   *
   * <p>Sıralamanın KENDİSİ burada yapılmaz: veri çağıranın ve sıralama
   * neredeyse her zaman sunucuda (sayfalanmış bir listede istemcide sıralamak
   * yalnızca görünen sayfayı sıralar — kullanıcı "en ucuz" dediğinde en ucuz
   * 24 ürünü değil, o sayfadaki en ucuzu görüyordu).
   */
  onSort?: (key: string, direction: 'ascending' | 'descending') => void;
  /**
   * Satır seçildiğinde beliren TOPLU EYLEM şeridi.
   *
   * <p>Tablonun ÜSTÜNDE ve yapışkan: kullanıcı yüzlerce satır arasında
   * seçim yapıp aşağı kaydırdığında eylem şeridi ekranın dışında kalıyor ve
   * seçimin ne işe yaradığı görünmüyordu.
   */
  bulkBar?: ReactNode;
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
 *
 * <h3>Görünmez başlık `aria-label` DEĞİL, gizlenmiş METİN</h3>
 * Eylem sütununun adı önce `<th aria-label="Eylemler">` olarak yazılıyordu.
 * Eksen taraması bunu ihlal olarak bildirdi (`empty-table-header`) ve haklı:
 * `aria-label`ın hücre başlığı olarak kullanılması destek teknolojilerinde
 * tutarsız — bazı ekran okuyucular tablo gezinme kipinde sütun adını
 * hücrenin İÇERİĞİNDEN okur ve boş bir `<th>` orada adsız kalır. Görsel olarak
 * gizlenmiş gerçek bir metin düğümü hem okunur hem de sayfa çevirisine,
 * bulma-değiştirmeye ve seçime dahil olur.
 */
const DataTable: FC<Props> = ({
  columns,
  children,
  isLoading,
  error,
  emptyMessage,
  loadingMessage,
  hasViewportCap,
  onSort,
  bulkBar,
  className,
  testId,
}) => {
  /*
   * Bosluk karari satir SAYISINDAN verilir; cagiranin ayrica `isEmpty` gecmesi
   * gerekmez. Satirlar tek bir Fragment icinde verilirse sayi 1 gorunur —
   * satirlari dogrudan (ya da dizi olarak) verin.
   */
  const { labels } = useHanui();
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
      {bulkBar && <div className={styles.bulkBar}>{bulkBar}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => {
              const isSortable = Boolean(column.isSortable && onSort);
              /* Ilk tikta ARTAN; ikinci tik yonu cevirir. Sifirdan azalan
                 baslamak, "en pahali" listeyi varsayilan yapiyordu. */
              const nextDirection = column.ariaSort === 'ascending' ? 'descending' : 'ascending';

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.ariaSort}
                  className={cx(column.className, column.isSticky && styles.sticky)}
                >
                  {isSortable ? (
                    /*
                     * Siralama bir DUGME, `<th>`ye yazilan `onClick` degil.
                     * Baslik hucresi odaklanabilir degil ve klavye kullanicisi
                     * siralamaya HIC ulasamiyordu; ustelik ekran okuyucu
                     * tiklanabilir oldugunu da soylemiyordu.
                     */
                    <button
                      type="button"
                      className={styles.sort}
                      onClick={() => onSort?.(column.key, nextDirection)}
                    >
                      {column.label}
                      {column.srLabel && <span className={styles.srOnly}>{column.srLabel}</span>}

                      {/*
                        Yon oku: `aria-hidden` cunku ayni bilgi `aria-sort`ta.
                        Siralanabilir ama siralanmamis sutunda SOLUK bir cift
                        ok duruyor — sutunun siralanabildigi ancak uzerine
                        gelince anlasiliyordu.
                      */}
                      <span
                        aria-hidden
                        className={cx(
                          styles.sort__arrow,
                          column.ariaSort && styles[`sort__arrow--${column.ariaSort}`],
                        )}
                      >
                        {column.ariaSort === 'descending' ? '▾' : '▴'}
                      </span>
                    </button>
                  ) : (
                    <>
                      {column.label}
                      {column.srLabel && <span className={styles.srOnly}>{column.srLabel}</span>}
                    </>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {error
            ? renderStateRow(
                <span role="alert" className={styles.state__message}>
                  <ExclamationCircleFill aria-hidden />
                  {error}
                </span>,
                'error',
              )
            : isLoading
              ? renderStateRow(
                  resolveLabel(
                    'DataTable.loadingMessage',
                    loadingMessage,
                    labels?.dataTable?.loading,
                  ),
                )
              : rowCount === 0
                ? renderStateRow(
                    resolveLabel('DataTable.emptyMessage', emptyMessage, labels?.dataTable?.empty),
                  )
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

export const DataTableRow: FC<RowProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ isWarning, className, children, ...rest }) => (
    <tr className={cx(isWarning && styles['row--warning'], className)} {...rest}>
      {children}
    </tr>
  )),
  'DataTableRow',
);

export default /*#__PURE__*/ memo(DataTable) as typeof DataTable;
