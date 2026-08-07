'use client';

import {
  forwardRef,
  memo,
  type TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Alan içeriğiyle birlikte BÜYÜR — kaydırma çubuğu yerine yükseklik. */
  isAutoSize?: boolean;
  /** Otomatik büyümenin tavanı (satır). */
  maxRows?: number;
  /** Kalan karakter sayacını gösterir. `maxLength` ile birlikte anlamlı. */
  hasCounter?: boolean;
  testId?: string;
};

/** Çok satırlı metin girdisi. */
const Textarea = /*#__PURE__*/ forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      className,
      rows = 4,
      isAutoSize,
      maxRows = 12,
      hasCounter,
      maxLength,
      value,
      defaultValue,
      onChange,
      testId,
      ...rest
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    /* KONTROLLU kipte uzunluk `value`dan OKUNUR, ic durumdan degil. */
    const [innerLength, setLength] = useState(String(defaultValue ?? '').length);
    const length = value === undefined ? innerLength : String(value).length;

    /* Cagiranin `ref`i ile ic olcum referansini birlikte tut: `useImperativeHandle`
       yalnizca bir nesne dondurur ve DOM dugumunun kendisini gizlerdi. */
    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    /*
     * OLCUM BOYAMADAN ONCE: `useEffect` ile alan bir kare boyunca eski
     * yuksekligiyle cizilip sonra ziplyordu.
     */
    useLayoutEffect(() => {
      const node = innerRef.current;
      if (!isAutoSize || !node) return;

      node.style.height = 'auto';

      const lineHeight = Number.parseFloat(getComputedStyle(node).lineHeight) || 20;
      const max = lineHeight * maxRows;

      node.style.height = `${Math.min(node.scrollHeight, max)}px`;
      node.style.overflowY = node.scrollHeight > max ? 'auto' : 'hidden';
    }, [isAutoSize, maxRows, value, length]);

    const isNearLimit = maxLength !== undefined && length >= maxLength * 0.9;

    return (
      <div className={cx(styles.wrapper, className)} data-testid={testId}>
        <textarea
          ref={setRefs}
          rows={rows}
          className={cx(styles.textarea, isAutoSize && styles['textarea--autoSize'])}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={event => {
            setLength(event.target.value.length);
            onChange?.(event);
          }}
          {...rest}
        />

        {hasCounter && maxLength !== undefined && (
          /* `aria-hidden`: ayni bilgi her tusta duyurulsaydi yazma kesintiye
             ugrardi. Sinir zaten `maxLength` ile taniniyor. */
          <span className={cx(styles.counter, isNearLimit && styles['counter--near'])} aria-hidden>
            {length} / {maxLength}
          </span>
        )}
      </div>
    );
  },
);

export default /*#__PURE__*/ memo(/*#__PURE__*/ named(Textarea, 'Textarea')) as typeof Textarea;
