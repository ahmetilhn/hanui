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
  /** Başlık hücresinin içeriği. */
  label?: ReactNode;
  /** Görsel başlığı olmayan sütunun erişilebilir adı (eylem sütunu gibi). */
  srLabel?: string;
  /** Sıralanabilir sütunun yönü (`aria-sort`). */
  ariaSort?: 'ascending' | 'descending';
  /**
   * Sütun sıralanabilir. `DataTable.onSort` ile birlikte anlamlı; ikisinden biri eksikse başlık düz
   * metin kalır
   */
  isSortable?: boolean;
  /** Sütun yatay kaydırmada YERİNDE kalır. */
  isSticky?: boolean;
  className?: string;
};

type Props = {
  columns: DataTableColumn[];
  /**
   * Tablonun erişilebilir adı ("Bekleyen siparişler").
   * ⚠ ADSIZ TABLO EKRAN OKUYUCUDA YALNIZCA "tablo" DİYE OKUNUR.
   */
  label?: string;
  /**
   * Gövde satırları (` `). Ekranların özel hücreleri, bağlantıları ve satır tintleri burada yaşar;
   * tablo yalnızca kabuğu ve durum satırlarını üstlenir.
   */
  children?: ReactNode;
  /** Satır yokken gösterilen metin. */
  emptyMessage?: string;
  /** Yükleme sürerken gösterilen metin. */
  loadingMessage?: string;
  isLoading?: boolean;
  /**
   * Liste ÇEKİLEMEDİ. "Yüklenemedi" ile "boş" ayrı durumlardır: hata verilmişken boş mesajı asla
   * çizilmez
   */
  error?: string | null;
  /** Gövde `100dvh - <bant>` ile sınırlanır ve başlık satırı kendi kaydırma alanına yapışır. */
  hasViewportCap?: boolean;
  /** Sıralanabilir bir başlığa basıldığında çağrılır. */
  onSort?: (key: string, direction: 'ascending' | 'descending') => void;
  /** Satır seçildiğinde beliren TOPLU EYLEM şeridi. */
  bulkBar?: ReactNode;
  className?: string;
  testId?: string;
};

/** Operasyon veri tablosu — durum satırlı tablo sözleşmesi. */
const DataTable: FC<Props> = ({
  columns,
  label,
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
  /* Bosluk karari satir SAYISINDAN verilir; cagiranin ayrica `isEmpty` gecmesi gerekmez. */
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

      <table className={styles.table} aria-label={label}>
        <thead>
          <tr>
            {columns.map(column => {
              const isSortable = Boolean(column.isSortable && onSort);
              /* Ilk tikta ARTAN; ikinci tik yonu cevirir. */
              const nextDirection = column.ariaSort === 'ascending' ? 'descending' : 'ascending';

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.ariaSort}
                  className={cx(column.className, column.isSticky && styles.sticky)}
                >
                  {isSortable ? (
                    /* Siralama bir DUGME, ` `ye yazilan `onClick` degil. */
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
  /** Satır dikkat bekleyen iş taşıyor (kritik stok, karar bekleyen talep). */
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
