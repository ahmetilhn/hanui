import { render, screen } from '@testing-library/react';

import DataTable, { type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Ad' },
  { key: 'actions', srLabel: 'Eylemler' },
];

const LABELS = { emptyMessage: 'Kayıt bulunamadı.', loadingMessage: 'Yükleniyor…' };

/** <strong>"Yüklenemedi" ile "boş" AYRI durumlardır.</strong> */
describe('DataTable durum öncelikleri', () => {
  it('hata varken BOŞ mesajı asla çizilmez', () => {
    render(<DataTable columns={COLUMNS} {...LABELS} error="Liste yüklenemedi." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Liste yüklenemedi.');
    expect(screen.queryByText(LABELS.emptyMessage)).not.toBeInTheDocument();
  });

  it('hata yükleme durumunu da bastırır', () => {
    render(<DataTable columns={COLUMNS} {...LABELS} isLoading error="Liste yüklenemedi." />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(LABELS.loadingMessage)).not.toBeInTheDocument();
  });

  it('yüklenirken bayat satır çizilmez', () => {
    render(
      <DataTable columns={COLUMNS} {...LABELS} isLoading>
        <tr>
          <td>ESKI-1</td>
          <td>Eski kayıt</td>
          <td />
        </tr>
      </DataTable>,
    );

    expect(screen.getByText(LABELS.loadingMessage)).toBeInTheDocument();
    expect(screen.queryByText('ESKI-1')).not.toBeInTheDocument();
  });

  it('satır yokken boş mesajı çizilir', () => {
    render(<DataTable columns={COLUMNS} {...LABELS} />);

    expect(screen.getByText(LABELS.emptyMessage)).toBeInTheDocument();
  });

  it('satır varken hiçbir durum satırı çizilmez', () => {
    render(
      <DataTable columns={COLUMNS} {...LABELS}>
        <tr>
          <td>SP-1</td>
          <td>Fren balatası</td>
          <td />
        </tr>
      </DataTable>,
    );

    expect(screen.getByText('SP-1')).toBeInTheDocument();
    expect(screen.queryByText(LABELS.emptyMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(LABELS.loadingMessage)).not.toBeInTheDocument();
  });
});

describe('DataTable sütun sözleşmesi', () => {
  /*
   * Elle yazilan `colSpan={8}` bir sutun eklenince sessizce yanlis kaliyor ve
   * durum satiri tablonun yalnizca bir kismini kapliyordu.
   */
  it('durum satırının `colSpan`ı sütun sayısından türer', () => {
    const { container } = render(<DataTable columns={COLUMNS} {...LABELS} />);

    expect(container.querySelector('tbody td')).toHaveAttribute('colspan', String(COLUMNS.length));
  });

  it('görsel başlığı olmayan sütun erişilebilir ad taşır', () => {
    render(<DataTable columns={COLUMNS} {...LABELS} />);

    expect(screen.getByRole('columnheader', { name: 'Eylemler' })).toBeInTheDocument();
  });
});
