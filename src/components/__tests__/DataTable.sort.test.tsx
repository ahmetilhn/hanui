import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DataTable, { DataTableRow, type DataTableColumn } from '../DataTable';

/** SIRALAMA VE TOPLU EYLEM. */

const row = (
  <DataTableRow>
    <td>SP-1</td>
    <td />
  </DataTableRow>
);

const columns = (overrides?: Partial<DataTableColumn>): DataTableColumn[] => [
  { key: 'code', label: 'Kod', isSortable: true, ...overrides },
  { key: 'actions', srLabel: 'Eylemler' },
];

describe('DataTable sıralama', () => {
  /*
   * Baslik hucresine `onClick` yazmak yetmiyordu: `<th>` odaklanabilir degil,
   * klavye kullanicisi siralamaya HIC ulasamiyordu.
   */
  it('sıralanabilir başlık bir DÜĞMEDİR', () => {
    render(
      <DataTable columns={columns()} onSort={jest.fn()}>
        {row}
      </DataTable>,
    );

    expect(screen.getByRole('button', { name: 'Kod' })).toBeInTheDocument();
  });

  it('`onSort` YOKSA başlık düz metin kalır', () => {
    render(<DataTable columns={columns()}>{row}</DataTable>);

    /* Tiklanabilir gorunup hicbir sey yapmayan bir baslik, kullaniciya var
       olmayan bir yetenek vaat ediyordu. */
    expect(screen.queryByRole('button', { name: 'Kod' })).not.toBeInTheDocument();
    expect(screen.getByText('Kod')).toBeInTheDocument();
  });

  it('ilk tık ARTAN sıralar', async () => {
    const onSort = jest.fn();
    render(
      <DataTable columns={columns()} onSort={onSort}>
        {row}
      </DataTable>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Kod' }));

    /* Sifirdan azalan baslamak "en pahali" listeyi varsayilan yapiyordu. */
    expect(onSort).toHaveBeenCalledWith('code', 'ascending');
  });

  it('artan sıralıyken tık AZALANA çevirir', async () => {
    const onSort = jest.fn();
    render(
      <DataTable columns={columns({ ariaSort: 'ascending' })} onSort={onSort}>
        {row}
      </DataTable>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Kod' }));

    expect(onSort).toHaveBeenCalledWith('code', 'descending');
  });

  it('yön `aria-sort` ile BAŞLIK HÜCRESİNDE bildirilir', () => {
    render(
      <DataTable columns={columns({ ariaSort: 'descending' })} onSort={jest.fn()}>
        {row}
      </DataTable>,
    );

    expect(screen.getByRole('columnheader', { name: 'Kod' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  /*
   * Kullanici yuzlerce satir arasinda secim yapip asagi kaydirdiginda eylem
   * seridi ekranin disinda kaliyor ve secimin ne ise yaradigi gorunmuyordu.
   */
  it('toplu eylem şeridi tablonun ÜSTÜNDE çizilir', () => {
    const { container } = render(
      <DataTable columns={columns()} bulkBar={<span>2 satır seçildi</span>}>
        {row}
      </DataTable>,
    );

    const bar = screen.getByText('2 satır seçildi');
    const table = container.querySelector('table');

    expect(bar).toBeInTheDocument();
    /* DOM sirasi: serit once, tablo sonra. */
    expect(bar.compareDocumentPosition(table!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('şerit verilmediğinde HİÇ çizilmez', () => {
    const { container } = render(<DataTable columns={columns()}>{row}</DataTable>);

    expect(container.querySelector('[class*="bulkBar"]')).toBeNull();
  });
});
