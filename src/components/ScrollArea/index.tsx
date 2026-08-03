'use client';

import { type FC, type ReactNode, memo, useEffect, useRef, useState } from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = {
  children: ReactNode;
  /**
   * Kaydırılabilir bölgenin erişilebilir adı. ZORUNLU.
   *
   * <p>Bölge klavyeyle odaklanabilir olduğunda ekran okuyucu onu duyuruyor;
   * adsız bir bölge "bölge" diye okunuyor ve kullanıcı neyin içinde olduğunu
   * bilmiyordu.
   */
  label: string;
  /** Kaydırma yönü. `both` iki eksende de kaydırır. */
  axis?: 'vertical' | 'horizontal' | 'both';
  /** En fazla yükseklik — dikey kaydırmada zorunlu, yoksa kutu uzar gider. */
  maxHeight?: number | string;
  /** Kenarlarda içeriğin devam ettiğini gösteren solma. */
  hasFade?: boolean;
  className?: string;
  testId?: string;
};

/**
 * Kaydırma kutusu — <strong>klavyeyle erişilebilir</strong> kaydırma bölgesi.
 *
 * <h3>Neden bir bileşen: `overflow: auto` TEK BAŞINA yetmiyor</h3>
 * Kaydırılabilir bir bölge klavyeyle ulaşılabilir olmak zorunda (WCAG 2.1.1).
 * İçinde odaklanabilir öğe olmayan bir kutu — uzun bir metin, bir tablo, bir
 * kod bloğu — `tabindex` verilmediğinde klavye kullanıcısı için
 * <strong>ulaşılamaz</strong>: `Tab` onu atlıyor ve ok tuşları sayfayı
 * kaydırıyor, kutuyu değil. Firefox bunu kendiliğinden yapıyor, Chrome ve
 * Safari yapmıyor.
 *
 * <p>Ama `tabindex="0"` KOŞULSUZ verilemez: içerik sığdığında kutu
 * kaydırılamaz olur ve gereksiz bir `Tab` durağına dönüşür. Bileşen taşmayı
 * ÖLÇÜYOR ve `tabindex`i yalnızca gerçekten kaydırılabilirken yazıyor.
 *
 * <h3>Kaydırma çubuğu temalı</h3>
 * İşletim sisteminin açık çubuğu koyu temada kutunun kenarında parlak bir
 * şerit bırakıyordu.
 *
 * <h3>Klavye</h3>
 * <table>
 *   <tr><td>`Tab`</td><td>kaydırılabilir bölgeye odaklanır (yalnızca taşma varsa)</td></tr>
 *   <tr><td>ok tuşları · `PageUp`/`PageDown` · `Home`/`End`</td><td>kaydırır</td></tr>
 * </table>
 * Tuşların hepsi TARAYICIDAN geliyor; bileşenin işi yalnızca bölgeyi
 * odaklanabilir kılmak.
 */
const ScrollArea: FC<Props> = ({
  children,
  label,
  axis = 'vertical',
  maxHeight,
  hasFade,
  className,
  testId,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  /*
   * TASMA OLCULUR, varsayilmaz.
   *
   * `tabindex="0"` kosulsuz verilseydi icerigi sigan her kutu gereksiz bir
   * Tab duragina donusuyordu: sekiz kutulu bir sayfada klavye kullanicisi
   * hicbir sey yapmayan sekiz durak geciyordu.
   */
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const vertical = node.scrollHeight > node.clientHeight;
      const horizontal = node.scrollWidth > node.clientWidth;
      setIsScrollable(
        axis === 'horizontal'
          ? horizontal
          : axis === 'vertical'
            ? vertical
            : vertical || horizontal,
      );
    };

    measure();

    /* Icerik DE kutu DA degisebiliyor: ikisi de izleniyor. */
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    for (const child of node.children) observer.observe(child);

    return () => observer.disconnect();
  }, [axis, children]);

  return (
    <div
      ref={ref}
      className={cx(
        styles.scrollArea,
        styles[`scrollArea--${axis}`],
        hasFade && styles['scrollArea--fade'],
        className,
      )}
      style={maxHeight === undefined ? undefined : { maxBlockSize: maxHeight }}
      /*
       * Bolge YALNIZCA kaydirilabilirken odaklanabilir ve yalnizca o zaman bir
       * ROL tasiyor: sigmayan bir kutu bir "bolge" degil, siradan bir
       * sarmalayici.
       */
      tabIndex={isScrollable ? 0 : undefined}
      role={isScrollable ? 'region' : undefined}
      aria-label={isScrollable ? label : undefined}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(ScrollArea, 'ScrollArea'),
) as typeof ScrollArea;
