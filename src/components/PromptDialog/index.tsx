'use client';

import { type FC, memo, type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import Button from '../Button';
import Field, { type FieldChildProps } from '../Field';
import Input from '../Input';
import Modal from '../Modal';
import Textarea from '../Textarea';

import styles from './index.module.scss';

type BaseProps = {
  isOpen: boolean;
  /** Vazgeçme ve perde/Escape kapanışı. Başarı kapanışını bileşen kendisi yapar. */
  onClose: () => void;
  /**
   * Girilen değerle çalışır (değer kırpılmış gönderilir). Reddederse pencere
   * AÇIK kalır ve metin korunur; hata bildirimi çağıranın işi — bildirimi
   * gösterip hatayı yeniden fırlatın ya da hiç yakalamayın.
   */
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  /** Girdi alanının etiketi. */
  label: string;
  /** Verilmezse `labels.submit`. */
  submitLabel?: string;
  /** Verilmezse `labels.cancel`. */
  cancelLabel?: string;
  /** Kapatma düğmesinin erişilebilir adı. Verilmezse `labels.close`. */
  closeLabel?: string;
  /** Başlığın altındaki bir cümlelik bağlam. */
  description?: ReactNode;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  /**
   * `text` tek satır, `multiline` gerekçe gibi uzun metin, `number` adet/fark
   * gibi sayılar. Değer her durumda dize döner; ayrıştırmak çağıranın işi
   * (bir stok farkı `-5` gibi işaretli olabiliyor).
   */
  inputMode?: 'text' | 'multiline' | 'number';
  maxLength?: number;
  rows?: number;
};

type Props = BaseProps & {
  /** Boş (yalnızca boşluk dahil) değer gönderilemez. */
  isRequired?: boolean;
  /** Zorunluluk yıldızının ekran okuyucu karşılığı ("(zorunlu)"). */
  requiredLabel?: string;
};

/** Metin isteyen pencere — `window.prompt()` yerine. */
const PromptDialog: FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  submitLabel,
  cancelLabel,
  closeLabel,
  description,
  hint,
  placeholder,
  defaultValue = '',
  isRequired,
  requiredLabel,
  inputMode = 'text',
  maxLength,
  rows = 4,
}) => {
  const { labels } = useHanui();
  const formId = useId();
  const [value, setValue] = useState(defaultValue);
  const [isBusy, setIsBusy] = useState(false);

  /*
   * Deger yalnizca ACILIS kenarinda tazelenir. `isOpen`'a bagli duz bir etki,
   * pencere acikken gelen her ust render'da yazilani ezebilirdi; hatada acik
   * kalan penceredeki metin de korunmali.
   */
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) setValue(defaultValue);
    wasOpenRef.current = isOpen;
  }, [isOpen, defaultValue]);

  const trimmed = value.trim();
  const isSubmitDisabled = Boolean(isRequired) && trimmed === '';

  /** Girdi, `Field`in urettigi erisilebilirlik baglariyla cizilir. */
  const renderControl = (props: FieldChildProps) =>
    inputMode === 'multiline' ? (
      <Textarea
        {...props}
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
      />
    ) : (
      <Input
        {...props}
        type={inputMode === 'number' ? 'number' : 'text'}
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    );

  const handleSubmit = async () => {
    if (isSubmitDisabled || isBusy) return;

    setIsBusy(true);
    try {
      await onSubmit(trimmed);
      // Yalnizca basarida: hata durumunda pencere acik, metin yerinde kalir.
      onClose();
    } catch {
      // Bildirim cagiranin isi; burada yalnizca pencere acik tutulur.
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      closeLabel={closeLabel ?? labels?.close}
      description={description}
      size="sm"
      // Istek surerken kapanmaz: kapanis "islem iptal oldu" gibi gorunuyordu.
      isDismissable={!isBusy}
      footer={
        <>
          <Button
            variant={UIVariant.SECONDARY}
            size={UISize.MEDIUM}
            onClick={onClose}
            disabled={isBusy}
          >
            {resolveLabel('PromptDialog.cancelLabel', cancelLabel, labels?.cancel)}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant={UIVariant.PRIMARY}
            size={UISize.MEDIUM}
            disabled={isSubmitDisabled}
            isLoading={isBusy}
          >
            {resolveLabel('PromptDialog.submitLabel', submitLabel, labels?.submit)}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className={styles.form}
        onSubmit={event => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Field label={label} hint={hint} isRequired={isRequired} requiredLabel={requiredLabel}>
          {renderControl}
        </Field>
      </form>
    </Modal>
  );
};

export default /*#__PURE__*/ memo(PromptDialog) as typeof PromptDialog;
