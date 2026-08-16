import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileUpload, HanuiProvider } from '../../src';
import { LABELS } from '../fixtures/labels';

/**
 * FILEUPLOAD — BOYUT KAPISI VE DUYURU.
 *
 * ⚠ Bileşenin özel testi YOKTU. Faz 0'da beş sabit Türkçe dizesi
 * `resolveLabel`a taşındı ve `resolveLabel` **hiçbir varsayılan
 * taşımıyor**: sözlükte olmayan bir anahtar boş metin döndürüyor ve
 * geliştirme uyarısı basıyor. Yani bir anahtarın düşmesi burada
 * <strong>sessiz</strong> — ekran okuyucu kullanıcısı "dosya çok büyük"
 * uyarısını hiç duymaz, gören kullanıcı da boş bir satır görür.
 *
 * ⚠ Boyut kapısı bir GÖRSEL uyarı değil bir SÜZGEÇ: aşan dosya
 * `onSelect`e HİÇ ulaşmamalı. Ulaşsaydı çağıran onu sunucuya gönderir ve
 * red ağ turundan sonra gelirdi.
 */

const file = (name: string, bytes: number): File =>
  new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });

const renderUpload = (props: Partial<React.ComponentProps<typeof FileUpload>> = {}) => {
  const onSelect = jest.fn();
  const onRemove = jest.fn();

  render(
    <HanuiProvider labels={LABELS}>
      <FileUpload
        files={[]}
        onSelect={onSelect}
        onRemove={onRemove}
        label="Belgeler"
        removeLabel="Kaldır"
        dropLabel="Dosyaları buraya bırakın"
        {...props}
      />
    </HanuiProvider>,
  );

  return { onSelect, onRemove };
};

describe('FileUpload', () => {
  it('girdinin erişilebilir ADI vardır', () => {
    renderUpload();

    /*
     * ⚠ Ad `label + dropLabel + hint` BİRLEŞİMİ: sürükle-bırak alanı bir
     * `<label>` ve içindeki her metin ada katılıyor. Bu bilinçli — ekran
     * okuyucu kullanıcısı alanın hem ne olduğunu hem nasıl kullanılacağını
     * tek nefeste duyuyor. Tam eşleşme bekleyen bir iddia bu yapıyı
     * "bozuk" sanardı; ölçülen şey adın VAR olması.
     */
    expect(screen.getByLabelText(/Belgeler/)).toHaveAccessibleName(
      expect.stringContaining('Belgeler'),
    );
  });

  it('sınır ALTINDAKİ dosya çağırana ULAŞIR', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderUpload({ maxSize: 1_000 });

    await user.upload(screen.getByLabelText(/Belgeler/), file('kucuk.jpg', 100));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0][0].name).toBe('kucuk.jpg');
  });

  it('sınırı AŞAN dosya çağırana HİÇ ulaşmaz', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderUpload({ maxSize: 100 });

    await user.upload(screen.getByLabelText(/Belgeler/), file('buyuk.jpg', 5_000));

    /*
     * ⚠ Kapı bir SÜZGEÇ, görsel uyarı değil. Dosya `onSelect`e ulaşsaydı
     * çağıran onu sunucuya gönderir ve red bir ağ turundan sonra gelirdi.
     */
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('boyut hatası KULLANICIYA yazılır', async () => {
    const user = userEvent.setup();
    renderUpload({ maxSize: 100, sizeErrorText: '{name} çok büyük (en fazla {max})' });

    await user.upload(screen.getByLabelText(/Belgeler/), file('buyuk.jpg', 5_000));

    /*
     * ⚠ Yer tutucular GERÇEKTEN doldurulur. `{name}` ham hâliyle kalsaydı
     * kullanıcı hangi dosyanın reddedildiğini öğrenemezdi — birden çok
     * dosya seçildiğinde bu tek bilgi.
     */
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('buyuk.jpg');
    expect(alert).not.toHaveTextContent('{name}');
  });

  it('sınır YOKKEN her dosya geçer', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderUpload();

    await user.upload(screen.getByLabelText(/Belgeler/), file('devasa.jpg', 50_000));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('yüklenmiş dosya KALDIRILABİLİR ve düğmenin adı dosyayı söyler', async () => {
    const user = userEvent.setup();
    const { onRemove } = renderUpload({
      /*
       * ⚠ `status` ALANI YOK ve eklenmemeli. Bir dönem burada `status: 'done'`
       * duruyordu; `UploadFile` böyle bir bileşen taşımıyor, bileşen de onu
       * hiçbir yerde okumuyor — yani iddiaya hiçbir şey katmayan, yalnızca
       * `tsc`yi düşüren ölü bir alandı (`npm test` tipleri denetlemediği için
       * hata YALNIZCA CI'daki `typecheck` adımında görünüyordu).
       *
       * Dosyanın durumu zaten `progress` + `error` ile ifade ediliyor:
       * `progress` yok → başlamadı ya da bitti, `error` var → düştü. Tipe bir
       * `status` eklemek aynı gerçeğin İKİNCİ kaynağı olurdu.
       */
      files: [{ id: 'f1', name: 'fatura.pdf', size: 120 }],
    });

    /*
     * ⚠ Ad dosyayı TAŞIR: üç dosyalı bir listede üç ayrı "Kaldır" düğmesi
     * ekran okuyucuda ayırt edilemez olurdu. Sıra `{dosya} — {eylem}`:
     * ekran okuyucu listede gezerken önce HANGİ dosya olduğunu duyuyor.
     */
    await user.click(screen.getByRole('button', { name: /fatura\.pdf.*Kaldır/ }));

    expect(onRemove).toHaveBeenCalledWith('f1');
  });

  it('PASİF durumda dosya seçilemez', () => {
    renderUpload({ isDisabled: true });

    expect(screen.getByLabelText(/Belgeler/)).toBeDisabled();
  });
});
