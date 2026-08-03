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
   *
   * <p>İşlem başarılıysa pencereyi kapatmak çağıranın işi: hata durumunda
   * pencerenin açık kalması gerekiyor ki kullanıcı tekrar deneyebilsin.
   */
  onConfirm: () => void | Promise<void>;
  /** Soru cümlesi. Eylem odaklı yazılır: "…silinsin mi?". */
  title: string;
  /** Sonucu açıklar: neyin geri alınamaz olduğu burada yazılır. */
  description?: ReactNode;
  /**
   * Onay düğmesinin etiketi — ZORUNLU, config'ten okunmaz.
   *
   * <p>Eylemi TEKRARLAR: "Sil", "İptal et". Her pencerede farklı olduğu için
   * uygulama düzeyinde bir varsayılanı olamaz; "Tamam" gibi bir varsayılan
   * kullanıcıya neyi onayladığını söylemez ve `window.confirm()`ten kaçmamızın
   * sebeplerinden biri tam olarak buydu.
   */
  confirmLabel: string;
  /** Verilmezse `labels.cancel`. */
  cancelLabel?: string;
  /** Verilmezse `labels.close`. */
  closeLabel?: string;
  kind?: ConfirmKind;
  /** Ek bağlam: silinecek kaydın özeti, uyarı kutusu. */
  children?: ReactNode;
};

/**
 * Onay penceresi.
 *
 * <h3>Neden `window.confirm()` yerine bu</h3>
 * Yerel `confirm()`in dört sorunu var:
 * <ul>
 *   <li>Görünümü işletim sisteminin — sitenin diliyle hiç ilgisi yok, üstünde
 *       tarayıcının alan adı yazıyor.</li>
 *   <li><strong>Ana iş parçacığını kilitler.</strong></li>
 *   <li>Yıkıcı eylemi vurgulayamaz: "Tamam" ile "İptal" aynı ağırlıkta ve
 *       hangisinin sildiğini yalnızca metinden anlıyorsun.</li>
 *   <li>İstek sürerken geri bildirim veremez; kullanıcı silme düğmesine ikinci
 *       kez basıyordu.</li>
 * </ul>
 *
 * <h3>Yükleme durumu pencerede kalır</h3>
 * Onaya basıldığında pencere hemen kapanmaz: düğme yükleniyor durumuna geçer
 * ve pencere kapanmaz hâle gelir (`isDismissable={false}`). İstek bittiğinde
 * kapatma kararı çağırana ait — hata varsa pencere açık kalmalı ki kullanıcı
 * tekrar deneyebilsin.
 *
 * @example
 * const [target, setTarget] = useState<Address | null>(null);
 *
 * <ConfirmDialog
 *   isOpen={target !== null}
 *   onClose={() => setTarget(null)}
 *   kind="destructive"
 *   title="Adres silinsin mi?"
 *   description="Bu işlem geri alınamaz."
 *   confirmLabel="Sil"
 *   cancelLabel="Vazgeç"
 *   closeLabel="Kapat"
 *   onConfirm={async () => {
 *     await remove(target!.id);
 *     setTarget(null);
 *   }}
 * />
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
  kind = 'neutral',
  children,
}) => {
  const { labels } = useHanui();
  const [isRunning, setIsRunning] = useState(false);

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
      icon={KIND_ICON[kind]}
      tone={KIND_TONE[kind]}
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
            variant={KIND_VARIANT[kind]}
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

export default memo(ConfirmDialog) as typeof ConfirmDialog;
