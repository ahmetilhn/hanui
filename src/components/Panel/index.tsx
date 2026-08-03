import { type ElementType, type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  children: ReactNode;
  /** Panel başlığı. Verilmezse başlık şeridi hiç çizilmez. */
  title?: string;
  /** Başlık altındaki tek satırlık açıklama. */
  description?: ReactNode;
  /** Başlık şeridinin sağında duran eylemler. */
  actions?: ReactNode;
  /** Başlık şeridindeki ikon; başlığın solunda. */
  icon?: ReactNode;
  /** Gövde dolgusunu kaldırır: tablo ve tam genişlikte listeler için. */
  isFlush?: boolean;
  /** Gövde içindeki dikey aralık. */
  gap?: 'sm' | 'md' | 'lg';
  /** Dipte duran eylem şeridi (form kaydet, toplam). */
  footer?: ReactNode;
  as?: ElementType;
  className?: string;
  bodyClassName?: string;
  testId?: string;
};

/**
 * Panel — başlığı olan içerik kutusu.
 *
 * <h3>Neden bu bileşen var</h3>
 * Bir uygulamanın on bir ayarlar sayfası, on bir farklı kart kuruyordu:
 * birinde dolgu 16 px diğerinde 24 px, birinde başlık kartın içinde diğerinde
 * dışında, birinde `max-width: 560px` diğerinde tam genişlik. Aynı disiplinde
 * görünmeleri için kararların tek yerde verilmesi gerekiyordu.
 *
 * <h3>Genişlik paneli DEĞİL içeriği sınırlar</h3>
 * Panel her zaman kapsayıcısını doldurur. Form alanlarının okunabilir satır
 * uzunluğunu aşmaması gerekiyorsa {@link PanelForm} kullanılır — o iç ızgarayı
 * sınırlar, panelin kendisini daraltmaz. Önceden bir "profil düzenle" paneli
 * sayfanın üçte biri kadar kalıp yanındaki boşluğa bakıyordu; sorun formun
 * değil PANELİN daraltılmasıydı.
 *
 * @example
 * <Panel title="Profil bilgileri" description="Fatura bu bilgilerle kesilir">
 *   <PanelForm>…alanlar…</PanelForm>
 * </Panel>
 */
const Panel: FC<Props> = ({
  children,
  title,
  description,
  actions,
  icon,
  isFlush,
  gap = 'md',
  footer,
  as: Tag = 'section',
  className,
  bodyClassName,
  testId,
}) => (
  <Tag className={cx(styles.panel, className)} data-testid={testId}>
    {(title || actions) && (
      <div className={styles.panel__header}>
        <div className={styles.panel__heading}>
          {icon && <span className={styles.panel__icon}>{icon}</span>}

          <div className={styles.panel__headingText}>
            {title && <h2 className={styles.panel__title}>{title}</h2>}
            {description && <p className={styles.panel__description}>{description}</p>}
          </div>
        </div>

        {actions && <div className={styles.panel__actions}>{actions}</div>}
      </div>
    )}

    <div
      className={cx(
        styles.panel__body,
        styles[`panel__body--${gap}`],
        isFlush && styles['panel__body--flush'],
        bodyClassName,
      )}
    >
      {children}
    </div>

    {footer && <div className={styles.panel__footer}>{footer}</div>}
  </Tag>
);

type PanelFormProps = {
  children: ReactNode;
  /** Sütun sayısı. `2` dar ekranda kendiliğinden tek sütuna düşer. */
  columns?: 1 | 2;
  className?: string;
};

/**
 * Panel içindeki form ızgarası.
 *
 * <p>Genişliği SINIRLI (`$measure-narrow`): girdi alanları okunabilir satır
 * uzunluğunun ötesine uzamamalı — 900 px genişliğinde bir metin kutusu
 * doldurulması zor görünür. Ama bu sınır PANELE değil ızgaraya uygulanır;
 * panel tam genişlikte kalır ve sayfa düzeni bozulmaz.
 */
export const PanelForm: FC<PanelFormProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, columns = 1, className }) => (
    <div className={cx(styles.form, styles[`form--${columns}`], className)}>{children}</div>
  )),
  'PanelForm',
);

type PanelRowProps = {
  children: ReactNode;
  className?: string;
};

/**
 * İki alanı yan yana koyan satır. Dar ekranda alt alta düşer.
 *
 * <p>`PanelForm columns={2}` tüm ızgarayı ikiye böler; bu yalnızca TEK bir
 * satırı böler (ad + soyad gibi).
 */
export const PanelRow: FC<PanelRowProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, className }) => (
    <div className={cx(styles.row, className)}>{children}</div>
  )),
  'PanelRow',
);

export default /*#__PURE__*/ memo(Panel) as typeof Panel;
