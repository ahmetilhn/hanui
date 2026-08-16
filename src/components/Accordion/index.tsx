'use client';

import {
  type FC,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

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
  /** Aynı anda YALNIZCA BİR bölüm açık kalır. */
  isSingle?: boolean;
  /** Kontrolsüz kullanımda açılışta açık olan bölümler. */
  defaultOpenIds?: string[];
  /** Kontrollü kullanım; `onChange` ile birlikte verilir. */
  openIds?: string[];
  onChange?: (openIds: string[]) => void;
  className?: string;
  testId?: string;
};

/** Akordeon — katlanabilir bölümler. */
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

  /*
   * ⚠ `open` PROP'U TEK BASINA YETMEZ — kontrollu kipte kalici desenkronizasyon
   * uretiyordu.
   *
   * `<details>` YERLI bir aciliyor/kapaniyor ogesi: kullanici tikladiginda DOM
   * ozelligini TARAYICI degistirir. Ebeveyn `openIds`i degistirmezse React ayni
   * `open` degeriyle yeniden render eder, fark gormedigi icin DOM yazimini
   * ATLAR ve oge kullanicinin biraktigi halde kalir. Sonrasinda `onToggle`in
   * `next !== isOpen` korumasi BAYAT React degerini okur ve sonraki tiklamalar
   * `onChange` bile uretmez: bolum kilitlenir, cagiranin durumu onu bir daha
   * suremez.
   *
   * Cozum DOM'u her render'dan sonra niyetle hizalamak. Bagimlilik dizisi YOK
   * ve bu bilincli: hizalanmasi gereken sey React'in gordugu degisiklik degil,
   * TARAYICININ arkamizdan yaptigi degisiklik.
   */
  const detailsRefs = useRef(new Map<string, HTMLDetailsElement>());

  useEffect(() => {
    items.forEach(item => {
      const node = detailsRefs.current.get(item.id);
      if (node) node.open = openIds.includes(item.id);
    });
  });

  return (
    <div className={cx(styles.accordion, className)} data-testid={testId}>
      {items.map(item => {
        const isOpen = openIds.includes(item.id);

        return (
          <details
            key={item.id}
            ref={node => {
              if (node) detailsRefs.current.set(item.id, node);
              else detailsRefs.current.delete(item.id);
            }}
            className={cx(
              styles.accordion__item,
              item.isDisabled && styles['accordion__item--disabled'],
            )}
            /* Ilk boyama ve SSR icin; surekliligi yukaridaki effect tutuyor. */
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
