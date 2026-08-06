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
 * @example
 * <Panel title="Profil bilgileri" description="Fatura bu bilgilerle kesilir">
 * <PanelForm>…alanlar…</PanelForm>
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

    {/*
      Dip şeridi İKİ kutu: dış bant ile iç sütun.

      Bant panelin tamamını kaplamak zorunda — kendi zemini ve üst çizgisi
      var, daraltıldığında panelin dibinde yarım bir şerit kalır. Ama şeridin
      İÇERİĞİ, panelde bir {@link PanelForm} varsa onun sütununda bitmeli;
      genişlik kararını taşıyan tek kutu iç olan. Ölçüldü: form 97-662 px
      arasında dururken "Sorgula" düğmesi 1238 px'te, yani gönderdiği formdan
      576 px uzakta çiziliyordu.
    */}
    {footer && (
      <div className={styles.panel__footer}>
        <div className={styles.panel__footerInner}>{footer}</div>
      </div>
    )}
  </Tag>
);

type PanelFormProps = {
  children: ReactNode;
  /** Sütun sayısı. `2` dar ekranda kendiliğinden tek sütuna düşer. */
  columns?: 1 | 2;
  className?: string;
};

/** Panel içindeki form ızgarası. */
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

/** İki alanı yan yana koyan satır. Dar ekranda alt alta düşer. */
export const PanelRow: FC<PanelRowProps> = /*#__PURE__*/ named(
  /*#__PURE__*/ memo(({ children, className }) => (
    <div className={cx(styles.row, className)}>{children}</div>
  )),
  'PanelRow',
);

export default /*#__PURE__*/ memo(Panel) as typeof Panel;
