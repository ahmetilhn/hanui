'use client';

import { type FC, memo, type ReactNode, useId, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';

import styles from './index.module.scss';

type Props = {
  /** Balonda gösterilecek açıklama. */
  content: ReactNode;
  /** Açıklamanın bağlandığı öğe — düğme, ikon, etiket. */
  children: ReactNode;
  /** Varsayılan üstte; alanı olmayan yerlerde `bottom`. */
  position?: 'top' | 'bottom';
  className?: string;
};

/**
 * İpucu balonu.
 *
 * <h3>Neden native `title` yetmiyor</h3>
 * Tarayıcının `title` özniteliği <strong>dokunmatikte hiç görünmez</strong>,
 * gecikmesi ayarlanamaz ve biçimlendirilemez. Trafiğin ağırlığı mobil olan
 * bir arayüzde "üzerine gelince açıklama çıkar" demek, kullanıcıların çoğu
 * için açıklamanın hiç olmaması demek.
 *
 * <h3>Neden yalnızca AÇIKLAMA taşır</h3>
 * Balonda <em>yalnızca</em> yardımcı metin durur — bağlantı, düğme veya
 * okunması zorunlu bir bilgi değil. İpucu klavyeyle odaklanınca ve fareyle
 * üzerine gelince açılıyor; içine bir eylem konsaydı ona erişmenin yolu
 * olmazdı (fare balona giderken tetikleyiciden çıkıyor). Kalıcı olması
 * gereken metin için `Field`ın `hint`i kullanılır.
 *
 * <h3>Erişilebilirlik</h3>
 * Tetikleyici `aria-describedby` ile balona bağlanır — ekran okuyucu öğenin
 * adını okuduktan sonra açıklamayı da okur. Balon `role="tooltip"`. `Escape`
 * kapatır: klavye kullanıcısı ipucunu kapatabilmeli.
 */
const Tooltip: FC<Props> = ({ content, children, position = 'top', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cx(styles.tooltip, className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      /*
       * Odak SARMALAYICIDA dinleniyor: tetikleyici bir `<button>` de olabilir
       * bir `<span>` de, ve `focus` baloncuklanmadigi icin `focusin`
       * kullaniliyor (React'te `onFocus` zaten baloncuklanan surumu).
       */
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onKeyDown={event => {
        if (event.key === 'Escape') setIsOpen(false);
      }}
    >
      <span aria-describedby={isOpen ? id : undefined} className={styles.tooltip__trigger}>
        {children}
      </span>

      {/*
        Balon DOM'da yalnizca acikken: kapaliyken de birakip gizlemek, ekran
        okuyucunun onu `aria-describedby` olmadan da bulup okumasina yol
        aciyordu.
      */}
      {isOpen && (
        <span id={id} role="tooltip" className={cx(styles.bubble, styles[`bubble--${position}`])}>
          {content}
        </span>
      )}
    </span>
  );
};

export default memo(Tooltip) as typeof Tooltip;
