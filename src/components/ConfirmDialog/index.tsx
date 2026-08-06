'use client';

import { type FC, memo, type ReactNode, useState } from 'react';

import { ExclamationTriangleFill, QuestionCircleFill, TrashFill } from 'react-bootstrap-icons';

import { resolveLabel } from '../../helpers/label.helper';
import { useHanui } from '../../theme/context';
import UISize from '../../enums/ui-size.enum';
import UIVariant from '../../enums/ui-variant.enum';
import Button from '../Button';
import Modal, { type ModalTone } from '../Modal';

export type ConfirmKind = 'destructive' | 'warning' | 'neutral';

/** Üçü de DOLU sürüm: madalyonun tint zemininde kontur kaybolur. */
const KIND_ICON: Record<ConfirmKind, ReactNode> = {
  destructive: <TrashFill aria-hidden />,
  warning: <ExclamationTriangleFill aria-hidden />,
  neutral: <QuestionCircleFill aria-hidden />,
};

const KIND_TONE: Record<ConfirmKind, ModalTone> = {
  destructive: 'danger',
  warning: 'warning',
  neutral: 'info',
};

const KIND_VARIANT: Record<ConfirmKind, UIVariant> = {
  destructive: UIVariant.DANGER,
  warning: UIVariant.PRIMARY,
  neutral: UIVariant.PRIMARY,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Onaylandığında çalışır. `Promise` dönerse düğme beklerken yükleme
   * durumuna geçer ve pencere <strong>kapanmaz</strong>.
   */
  onConfirm: () => void | Promise<void>;
  /** Soru cümlesi. Eylem odaklı yazılır: "…silinsin mi?". */
  title: string;
  /** Sonucu açıklar: neyin geri alınamaz olduğu burada yazılır. */
  description?: ReactNode;
  /** Onay düğmesinin etiketi — ZORUNLU, config'ten okunmaz. */
  confirmLabel: string;
  /** Verilmezse `labels.cancel`. */
  cancelLabel?: string;
  /** Verilmezse `labels.close`. */
  closeLabel?: string;
  /** Onayın türü — ikon, ton ve onay düğmesinin varyantını birlikte belirler. */
  variant?: ConfirmKind;
  /** @deprecated `variant` kullanın. Bir sonraki büyük sürümde kalkacak. */
  kind?: ConfirmKind;
  /** Ek bağlam: silinecek kaydın özeti, uyarı kutusu. */
  children?: ReactNode;
};

/**
 * Onay penceresi.
 *
 * @example
 * const [target, setTarget] = useState<Address | null>(null);
 */
const ConfirmDialog: FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  closeLabel,
  variant,
  kind,
  children,
}) => {
  const { labels } = useHanui();
  const [isRunning, setIsRunning] = useState(false);

  /* Eski prop bir surum boyunca calisir; `variant` verilmisse o kazanir. */
  const resolvedVariant: ConfirmKind = variant ?? kind ?? 'neutral';

  const handleConfirm = async () => {
    setIsRunning(true);
    try {
      await onConfirm();
    } finally {
      /*
       * `finally`: istek hata verse de yukleme durumu birakilir. Aksi halde
       * dugme sonsuza kadar donuyor ve kullanici tekrar deneyemiyordu.
       * Pencereyi KAPATMAK cagirana ait — hata varsa acik kalmali.
       */
      setIsRunning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      closeLabel={closeLabel ?? labels?.close}
      description={description}
      icon={KIND_ICON[resolvedVariant]}
      tone={KIND_TONE[resolvedVariant]}
      size="sm"
      // Islem surerken kapanmaz: kapanma, islem iptal edilmis gibi gorunuyordu.
      isDismissable={!isRunning}
      footer={
        <>
          {/*
            "Vazgec" JSX'te ONCE: klavyeyle sekme sirasi soldan saga mantikli
            olmali. Ekranda mobilde `column-reverse` ile alta duser.
          */}
          <Button
            variant={UIVariant.SECONDARY}
            size={UISize.MEDIUM}
            onClick={onClose}
            disabled={isRunning}
          >
            {resolveLabel('ConfirmDialog.cancelLabel', cancelLabel, labels?.cancel)}
          </Button>
          <Button
            variant={KIND_VARIANT[resolvedVariant]}
            size={UISize.MEDIUM}
            onClick={handleConfirm}
            isLoading={isRunning}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
};

export default /*#__PURE__*/ memo(ConfirmDialog) as typeof ConfirmDialog;
