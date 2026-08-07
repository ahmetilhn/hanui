import { render, screen } from '@testing-library/react';

import HanuiProvider from '@/theme/HanuiProvider';
import { resetLabelWarnings } from '@/helpers/label.helper';
import Breadcrumb from '@/components/Breadcrumb';
import CopyField from '@/components/CopyField';
import DataTable from '@/components/DataTable';
import Field from '@/components/Field';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Rating from '@/components/Rating';
import Spinner from '@/components/Spinner';
import type { HanuiLabels } from '@/types/theme.type';

const LABELS: HanuiLabels = {
  close: 'Kapat',
  loading: 'Yükleniyor',
  required: '(zorunlu)',
  breadcrumb: 'Konum',
  dataTable: { empty: 'Kayıt bulunamadı.', loading: 'Yükleniyor…' },
  copyField: {
    copy: value => `${value} kopyala`,
    copied: value => `${value} kopyalandı`,
    announcement: 'Panoya kopyalandı',
  },
  rating: { srLabel: (value, count) => `5 üzerinden ${value}${count ? `, ${count} oy` : ''}` },
};

const withProvider = (ui: React.ReactNode) => <HanuiProvider labels={LABELS}>{ui}</HanuiProvider>;

beforeEach(resetLabelWarnings);

describe('metin çözümlemesi', () => {
  it('config verilmişse bileşen prop olmadan çalışır', () => {
    render(withProvider(<Spinner />));

    expect(screen.getByRole('status')).toHaveTextContent('Yükleniyor');
  });

  it('PROP config’i EZER', () => {
    render(withProvider(<Spinner label="Fiyatlar getiriliyor" />));

    expect(screen.getByRole('status')).toHaveTextContent('Fiyatlar getiriliyor');
  });

  it('boş dize bilinçli bir seçim: config’i bastırır', () => {
    render(withProvider(<Spinner label="" />));

    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('sağlayıcı YOKSA prop hâlâ çalışır', () => {
    render(<Spinner label="Yükleniyor" />);

    expect(screen.getByRole('status')).toHaveTextContent('Yükleniyor');
  });

  it('ne prop ne config varsa geliştirme kipinde uyarır', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Spinner />);

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Spinner.label'));
    spy.mockRestore();
  });

  it('aynı eksik metin için yalnızca BİR kez uyarır', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <>
        <Spinner />
        <Spinner />
        <Spinner />
      </>,
    );

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe('config’in eriştiği bileşenler', () => {
  it('Modal kapatma düğmesi', () => {
    render(withProvider(<Modal isOpen onClose={jest.fn()} title="Adres ekle" />));

    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument();
  });

  it('Field zorunluluk metni', () => {
    render(
      withProvider(
        <Field label="Ad" isRequired>
          {props => <Input {...props} defaultValue="" />}
        </Field>,
      ),
    );

    expect(screen.getByText('(zorunlu)')).toBeInTheDocument();
  });

  it('Breadcrumb gezinme bölgesi adı', () => {
    render(withProvider(<Breadcrumb items={[{ label: 'Ana sayfa', href: '/' }]} />));

    expect(screen.getByRole('navigation', { name: 'Konum' })).toBeInTheDocument();
  });

  it('DataTable boş mesajı', () => {
    render(withProvider(<DataTable columns={[{ key: 'a', label: 'A' }]} />));

    expect(screen.getByText('Kayıt bulunamadı.')).toBeInTheDocument();
  });

  it('CopyField biçimlendiricisi değeri metne katar', () => {
    render(withProvider(<CopyField value="SP-2026-000123" />));

    expect(screen.getByRole('button', { name: 'SP-2026-000123 kopyala' })).toBeInTheDocument();
  });

  it('Rating biçimlendiricisi puanı ve oy sayısını okur', () => {
    render(withProvider(<Rating value={4.5} count={12} />));

    expect(screen.getByText('5 üzerinden 4.5, 12 oy')).toBeInTheDocument();
  });
});
