import {
  forwardRef,
  type InputHTMLAttributes,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { cx } from '../../helpers/class-name.helper';
import { named } from '../../helpers/component.helper';

import styles from './index.module.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'aria-label'> & {
  /**
   * Erişilebilir ad — ZORUNLU. Hücrede görünür etiket yok (etiket sütun
   * başlığında); adsız kutu ekran okuyucuda yalnızca "onay kutusu" diye
   * okunur. Satır kutusunda kaydın kimliğini söyleyin ("SP-2026-000123 seç").
   */
  label: string;
  /**
   * "Bazı satırlar seçili" — başlık kutusunun üçüncü durumu.
   *
   * ⚠ Bu prop OLMADAN o durum İFADE EDİLEMİYORDU. `indeterminate` bir HTML
   * niteliği değil, yalnızca DOM ÖZELLİĞİ; JSX ile yazılamaz, `ref` üzerinden
   * atanması gerekir. Sonuç: başlık kutusu ya "hiçbiri" ya "hepsi" diyordu,
   * kısmi seçimde ise sessizce YANLIŞ bilgi veriyordu — operatör "hepsi
   * seçili" sanıp toplu işlem yapıyordu.
   */
  isIndeterminate?: boolean;
  testId?: string;
};

/** Tablo hücresindeki toplu seçim kutusu. */
const TableCheckbox = /*#__PURE__*/ forwardRef<HTMLInputElement, Props>(
  ({ label, isIndeterminate = false, className, testId, ...rest }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);

    /*
     * Dışarıdan gelen `ref` ile içteki `ref` birleştirilir: bileşen kendi
     * düğümüne erişmek ZORUNDA (`indeterminate` yalnızca özellik olarak
     * yazılabiliyor) ama çağıranın `ref`i de çalışmaya devam etmeli.
     */
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = isIndeterminate;
    }, [isIndeterminate]);

    return (
      <input
        ref={innerRef}
        type="checkbox"
        aria-label={label}
        /*
         * ⚠ `aria-checked="mixed"` AYRICA yazılır. `indeterminate` DOM
         * özelliği görsel durumu değiştirir ama erişilebilirlik ağacına
         * bazı tarayıcı/ekran okuyucu birleşimlerinde yansımaz.
         */
        aria-checked={isIndeterminate ? 'mixed' : undefined}
        className={cx(styles.checkbox, className)}
        data-testid={testId}
        {...rest}
      />
    );
  },
);

export default /*#__PURE__*/ memo(
  /*#__PURE__*/ named(TableCheckbox, 'TableCheckbox'),
) as typeof TableCheckbox;
