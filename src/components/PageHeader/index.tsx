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

/**
 * Sayfa başlığı — her ekranın aynı giriş bloğu.
 *
 * <h3>Neden ortak bir bileşen</h3>
 * Önceden her container kendi başlığını kuruyordu: bir sayfada punto 29 px,
 * diğerinde 23 px; birinde açıklama başlığın altında, birinde yanında;
 * boşluklar 8 px ile 24 px arasında dolaşıyordu. Sayfalar arası geçiş "başka
 * bir siteye geçtim" hissi veriyordu. Bu bileşen o kararları tek yerde verir.
 *
 * <h3>Açıklama genişliği sınırlı</h3>
 * Başlık tam genişlikte akabilir ama açıklama 68ch'de durur: 1360 px
 * genişlikte akan bir açıklama satırında göz satır sonunda yerini kaybediyor.
 *
 * <h3>Eylemler `flex-end`</h3>
 * Düğmeler başlık bloğunun ALT kenarına hizalanır. `baseline` verildiğinde iki
 * satırlık başlıklarda düğme ilk satıra çekiliyordu.
 */
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
    {breadcrumb}

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
