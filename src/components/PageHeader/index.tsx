import { type FC, memo, type ReactNode } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  title: string;
  /** Başlığın üstündeki küçük bağlam etiketi ("HESABIM", "KATEGORİ"). */
  eyebrow?: string;
  /** Bir cümlelik açıklama. 68ch ile sınırlı tutulur. */
  description?: ReactNode;
  /** Sağ tarafta duran eylemler. Dar ekranda başlığın altına düşer. */
  actions?: ReactNode;
  /** Başlık satırının üstündeki kırıntı yolu. */
  breadcrumb?: ReactNode;
  /**
   * Başlığın yanındaki sayaç ("1.248 kayıt"). Açıklamanın değil BAŞLIĞIN
   * hizasında durur; kullanıcı sayıyı başlıkla birlikte okur.
   */
  meta?: ReactNode;
  /** Başlık bloğunun altında duran ek içerik (filtre şeridi, sekmeler). */
  children?: ReactNode;
  /** `h1` sayfada bir kez bulunur; iç bölümler `h2` alır. */
  as?: 'h1' | 'h2';
  className?: string;
  testId?: string;
};

/** Sayfa başlığı — her ekranın aynı giriş bloğu. */
const PageHeader: FC<Props> = ({
  title,
  eyebrow,
  description,
  actions,
  breadcrumb,
  meta,
  children,
  as: Heading = 'h1',
  className,
  testId,
}) => (
  <header className={cx(styles.header, className)} data-testid={testId}>
    {/*
      Yuva KENDI kutusunda: `header` bir dikey esnek kutu ve yuvanin cocugu
      dogrudan ona dustugunde `align-items: stretch` aliyordu. `Breadcrumb`
      zaten tam genislikte akan bir seritti, fark etmiyordu; icine bir dugme
      konunca (bir kayit formunun "Geri"si) dugme baslik genisligine yayilip
      ortalanmis metinle cikiyordu. Yuva artik icerigi kadar.
    */}
    {breadcrumb && <div className={styles.header__breadcrumb}>{breadcrumb}</div>}

    <div className={styles.header__top}>
      <div className={styles.header__text}>
        {eyebrow && <span className={styles.header__eyebrow}>{eyebrow}</span>}

        <div className={styles.header__titleRow}>
          <Heading className={styles.header__title}>{title}</Heading>
          {meta && <span className={styles.header__meta}>{meta}</span>}
        </div>

        {description && <p className={styles.header__description}>{description}</p>}
      </div>

      {actions && <div className={styles.header__actions}>{actions}</div>}
    </div>

    {children}
  </header>
);

export default /*#__PURE__*/ memo(PageHeader) as typeof PageHeader;
