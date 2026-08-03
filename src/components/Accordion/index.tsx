'use client';

import { type FC, memo, type ReactNode, useCallback, useId, useState } from 'react';

import { CaretRightFill } from 'react-bootstrap-icons';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

export type AccordionItem = {
  id: string;
  /** Başlık satırı — tıklanabilir olan bu. */
  title: ReactNode;
  /** Başlığın sağında duran ikincil bilgi (sayaç, rozet). */
  meta?: ReactNode;
  content: ReactNode;
  isDisabled?: boolean;
};

type Props = {
  items: AccordionItem[];
  /**
   * Aynı anda YALNIZCA BİR bölüm açık kalır.
   *
   * <p>Varsayılan çoklu: bir SSS listesinde iki soruyu yan yana okumak
   * yaygın bir ihtiyaç ve tek-açık kip, kullanıcının az önce açtığı bölümü
   * habersizce kapatıyordu. Tek-açık yalnızca bölümler UZUN olduğunda
   * (mobil filtre paneli) doğru.
   */
  isSingle?: boolean;
  /** Kontrolsüz kullanımda açılışta açık olan bölümler. */
  defaultOpenIds?: string[];
  /** Kontrollü kullanım; `onChange` ile birlikte verilir. */
  openIds?: string[];
  onChange?: (openIds: string[]) => void;
  className?: string;
  testId?: string;
};

/**
 * Akordeon — katlanabilir bölümler.
 *
 * <h3>Yerel `<details>` / `<summary>` üzerine</h3>
 * Açık/kapalı durumu, klavye desteği (`Enter` ve `Space`), ekran okuyucu
 * duyurusu ("genişletildi/daraltıldı") ve <strong>sayfa içi bulma</strong>
 * tarayıcıdan gelir. Sonuncusu taklit bir uygulamada imkânsız: Ctrl+F ile
 * aranan bir metin kapalı bir `<details>`in içindeyse tarayıcı bölümü kendisi
 * açıyor; `display: none` ile gizlenmiş bir `<div>`de o metin hiç yok.
 *
 * <p>Bedeli, tek-açık kipin elle kurulması: `<details name="…">` bunu yerel
 * olarak veriyor ama Safari 17.2 öncesinde yok ve orada TÜM bölümler
 * birbirinden bağımsız açılıyordu — sessiz bir davranış farkı. Karar burada
 * veriliyor, tarayıcıya bırakılmıyor.
 *
 * <h3>Yükseklik geçişi</h3>
 * `interpolate-size: allow-keywords` + `height` geçişi ile `auto`ya
 * canlandırılıyor. Desteklemeyen tarayıcıda geçiş düşer ve bölüm ANINDA
 * açılır — eski davranış. Sabit bir piksel yüksekliği vermek ya da
 * `max-height` numarası kullanmak yanlış: ilki içeriği kırpıyor, ikincisi
 * kısa bölümlerde gözle görülür bir gecikme bırakıyordu.
 *
 * <h3>Klavye (yerel)</h3>
 * <table>
 *   <tr><td>`Enter` / `Space`</td><td>bölümü açar/kapatır</td></tr>
 *   <tr><td>`Tab`</td><td>başlıklar arasında gezinir</td></tr>
 * </table>
 * Ok tuşu YOKTUR ve olmamalı: akordeon bir liste değil, her başlık bağımsız
 * bir düğme (WAI-ARIA APG accordion deseni ok tuşlarını isteğe bağlı bırakıyor
 * ve yerel öğe onları getirmiyor).
 */
const Accordion: FC<Props> = ({
  items,
  isSingle,
  defaultOpenIds,
  openIds: controlledIds,
  onChange,
  className,
  testId,
}) => {
  const baseId = useId();
  const [uncontrolledIds, setUncontrolledIds] = useState<string[]>(defaultOpenIds ?? []);

  const isControlled = controlledIds !== undefined;
  const openIds = isControlled ? controlledIds : uncontrolledIds;

  const toggle = useCallback(
    (id: string, willOpen: boolean) => {
      const next = willOpen
        ? isSingle
          ? [id]
          : [...openIds.filter(current => current !== id), id]
        : openIds.filter(current => current !== id);

      if (!isControlled) setUncontrolledIds(next);
      onChange?.(next);
    },
    [isControlled, isSingle, onChange, openIds],
  );

  return (
    <div className={cx(styles.accordion, className)} data-testid={testId}>
      {items.map(item => {
        const isOpen = openIds.includes(item.id);

        return (
          <details
            key={item.id}
            className={cx(
              styles.accordion__item,
              item.isDisabled && styles['accordion__item--disabled'],
            )}
            open={isOpen}
            /*
             * `onToggle` YEREL olaydir ve tarayici durumu DEGISTIRDIKTEN sonra
             * dusuyor. `onClick` ile yakalamak yetmiyordu: klavyeyle acilan
             * bolum (Enter/Space) tiklama uretmiyor ve durum React tarafinda
             * guncellenmiyordu.
             */
            onToggle={event => {
              const next = (event.currentTarget as HTMLDetailsElement).open;
              if (next !== isOpen) toggle(item.id, next);
            }}
          >
            <summary
              id={`${baseId}-${item.id}`}
              className={styles.accordion__summary}
              /*
               * Pasif bolum: `<summary>`nin `disabled` hali YOK. Isaretci
               * olaylari kesilir ve `tabindex="-1"` ile sekme sirasindan
               * cikarilir; `aria-disabled` durumu duyurur.
               */
              aria-disabled={item.isDisabled}
              tabIndex={item.isDisabled ? -1 : undefined}
              onClick={event => item.isDisabled && event.preventDefault()}
            >
              <CaretRightFill aria-hidden className={styles.accordion__marker} />

              <span className={styles.accordion__title}>{item.title}</span>
              {item.meta && <span className={styles.accordion__meta}>{item.meta}</span>}
            </summary>

            {/*
              Ic sarmalayici ZORUNLU: yukseklik gecisi `<details>`in KENDISINE
              verilemez (isaretcinin yuksekligi de gecise girip basligi
              titretiyordu). Gecis bu kutuda.
            */}
            <div className={styles.accordion__panel}>
              <div className={styles.accordion__content}>{item.content}</div>
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Accordion, 'Accordion')) as typeof Accordion;
