import { type ReactElement } from 'react';

import { render } from '@testing-library/react';
import { HeartFill, HouseFill } from 'react-bootstrap-icons';

import { axe } from '@tests/support/axe';
import * as hanui from '@/index';

const {
  Alert,
  Avatar,
  Badge,
  BottomSheet,
  Breadcrumb,
  Button,
  Card,
  Carousel,
  CardBody,
  CardFooter,
  CardMedia,
  CardOverlay,
  Checkbox,
  Accordion,
  Chip,
  ChipGroup,
  Combobox,
  ConfirmDialog,
  CommandPalette,
  CopyField,
  DataTable,
  DateField,
  DateRange,
  DataTableRow,
  Directory,
  DirectoryGroup,
  DirectoryJump,
  DirectoryRow,
  Divider,
  Drawer,
  EmptyState,
  Field,
  FileUpload,
  FilterBar,
  FilterBarField,
  HanuiProvider,
  IconButton,
  Input,
  Menu,
  Modal,
  PageHeader,
  Pagination,
  Panel,
  PanelForm,
  PanelRow,
  Popover,
  Price,
  Progress,
  ProgressCircle,
  PromptDialog,
  QuantityStepper,
  Radio,
  RadioCard,
  RangeSlider,
  Rating,
  RatingInput,
  ScrollArea,
  SectionHeader,
  SegmentedControl,
  Select,
  Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonTable,
  Spinner,
  Stat,
  Steps,
  Switch,
  Table,
  TableCheckbox,
  TableScroller,
  TagInput,
  Tabs,
  Textarea,
  ToastHub,
  TextLink,
  Tile,
  Timeline,
  Tooltip,
} = hanui;

const LABELS: hanui.HanuiLabels = {
  close: 'Kapat',
  cancel: 'Vazgeç',
  submit: 'Kaydet',
  loading: 'Yükleniyor',
  required: 'zorunlu',
  filters: 'Filtreler',
  breadcrumb: 'Yol',
  directoryJump: 'Harfe atla',
  selectPlaceholder: 'Seçin',
  locale: 'tr-TR',
  currency: 'TL',
  combobox: {
    searchPlaceholder: 'Ara',
    emptyMessage: 'Sonuç yok',
    loadingMessage: 'Aranıyor',
    clearLabel: 'Temizle',
  },
  pagination: { label: 'Sayfalar', previous: 'Önceki', next: 'Sonraki' },
  quantity: { label: 'Adet', decrease: 'Azalt', increase: 'Artır' },
  range: { min: 'En az', max: 'En çok' },
  dataTable: { empty: 'Kayıt yok', loading: 'Yükleniyor' },
  copyField: {
    copy: value => `${value} kopyala`,
    copied: value => `${value} kopyalandı`,
    announcement: 'Kopyalandı',
  },
  rating: {
    srLabel: (value, count) => `5 üzerinden ${value}${count ? ` — ${count} oy` : ''}`,
    starCount: star => `${star} yıldız`,
    scale: { 1: 'Çok kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Çok iyi' },
  },
};

const OPTIONS = [
  { value: 'a', label: 'Birinci' },
  { value: 'b', label: 'İkinci', description: 'İkincil satır' },
];

const COLUMNS: hanui.DataTableColumn[] = [
  { key: 'name', label: 'Ad' },
  { key: 'actions', srLabel: 'Eylemler' },
];

const SCENARIOS: Record<string, Record<string, ReactElement>> = {
  HanuiProvider: { default: <HanuiProvider>içerik</HanuiProvider> },

  Button: {
    default: <Button>Kaydet</Button>,
    loading: <Button isLoading>Kaydet</Button>,
    disabled: <Button disabled>Kaydet</Button>,
    link: <Button href="/x">Git</Button>,
  },
  IconButton: {
    default: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" />,
    disabled: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" disabled />,
  },
  TextLink: { default: <TextLink href="/x">Ayrıntı</TextLink> },
  Tooltip: {
    default: (
      <Tooltip content="Açıklama">
        <button type="button">Öğe</button>
      </Tooltip>
    ),
  },

  Chip: { default: <Chip>Etiket</Chip>, selected: <Chip isSelected>Etiket</Chip> },
  ChipGroup: {
    single: <ChipGroup label="Süzgeç" options={OPTIONS} value="a" onChange={() => {}} />,
    multiple: (
      <ChipGroup isMultiple label="Süzgeç" options={OPTIONS} value={['a']} onChange={() => {}} />
    ),
  },
  Combobox: {
    default: (
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={() => {}}
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    selected: (
      <Combobox
        options={OPTIONS}
        value="a"
        onChange={() => {}}
        isClearable
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
  },
  Select: {
    default: <Select options={OPTIONS} value="a" onChange={() => {}} label="Sıralama" />,
    disabled: (
      <Select options={OPTIONS} value="a" onChange={() => {}} label="Sıralama" isDisabled />
    ),
  },
  Checkbox: {
    default: <Checkbox label="Kabul ediyorum" />,
    hint: <Checkbox label="Kabul ediyorum" hint="Sözleşme metni" />,
  },
  Radio: { default: <Radio name="grup" label="Birinci" /> },
  RadioCard: {
    default: (
      <RadioCard name="grup" value="a" isSelected onChange={() => {}}>
        Kart gövdesi
      </RadioCard>
    ),
  },
  RangeSlider: {
    default: (
      <RangeSlider min={0} max={100} value={[10, 90]} onChange={() => {}} label="Fiyat aralığı" />
    ),
  },
  RatingInput: {
    default: <RatingInput value={4} onChange={() => {}} label="Ürün puanı" />,
    empty: <RatingInput value={null} onChange={() => {}} label="Ürün puanı" />,
  },
  QuantityStepper: { default: <QuantityStepper value={1} onChange={() => {}} /> },
  TableCheckbox: {
    default: (
      <table>
        <tbody>
          <tr>
            <td>
              <TableCheckbox label="Satırı seç" />
            </td>
          </tr>
        </tbody>
      </table>
    ),
  },

  Input: { default: <Input aria-label="Ad" />, invalid: <Input aria-label="Ad" aria-invalid /> },
  Textarea: { default: <Textarea aria-label="Not" /> },
  Field: {
    default: <Field label="Ad">{props => <Input {...props} />}</Field>,
    error: (
      <Field label="Ad" error="Bu alan zorunlu" isRequired>
        {props => <Input {...props} />}
      </Field>
    ),
    hint: (
      <Field label="Ad" hint="Kimlikteki hâli">
        {props => <Input {...props} />}
      </Field>
    ),
  },

  Alert: {
    default: <Alert>Bilgi</Alert>,
    danger: (
      <Alert tone="danger" title="Hata">
        İşlem tamamlanamadı
      </Alert>
    ),
  },
  Avatar: { default: <Avatar name="Ahmet İlhan" />, image: <Avatar name="A" imageUrl="/a.png" /> },
  Badge: { default: <Badge>Yeni</Badge>, solid: <Badge variant="solid">Yeni</Badge> },
  Breadcrumb: {
    default: <Breadcrumb items={[{ label: 'Ana sayfa', href: '/' }, { label: 'Ürün' }]} />,
  },
  Card: { default: <Card>Gövde</Card>, interactive: <Card isInteractive>Gövde</Card> },
  CardBody: {
    default: (
      <Card>
        <CardBody>Gövde</CardBody>
      </Card>
    ),
  },
  CardFooter: {
    default: (
      <Card>
        <CardFooter>Alt</CardFooter>
      </Card>
    ),
  },
  CardMedia: {
    default: (
      <Card>
        <CardMedia>
          <img src="/a.png" alt="" />
        </CardMedia>
      </Card>
    ),
  },
  CardOverlay: {
    default: (
      <Card>
        <CardMedia>
          <img src="/a.png" alt="" />
          <CardOverlay>
            <Badge>Yeni</Badge>
          </CardOverlay>
        </CardMedia>
      </Card>
    ),
  },
  CopyField: { default: <CopyField value="SP-123" /> },
  Divider: { default: <Divider />, labelled: <Divider label="veya" /> },
  Directory: {
    default: (
      <Directory>
        <DirectoryGroup label="A">
          <DirectoryRow href="/a" name="Audi" />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryGroup: {
    default: (
      <Directory>
        <DirectoryGroup label="A" meta="2 kayıt">
          <DirectoryRow href="/a" name="Audi" />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryRow: {
    default: (
      <Directory>
        <DirectoryGroup label="A">
          <DirectoryRow href="/a" name="Audi" marker={<Badge>OEM</Badge>} />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryJump: {
    default: <DirectoryJump labels={['A', 'B']} toId={label => `grup-${label}`} />,
  },
  EmptyState: {
    default: <EmptyState title="Kayıt yok" description="Süzgeci genişletin" />,
    withAction: <EmptyState title="Kayıt yok" action={<Button>Temizle</Button>} />,
  },
  PageHeader: { default: <PageHeader title="Siparişler" description="Tüm siparişleriniz" /> },
  Panel: {
    default: <Panel title="Bilgiler">Gövde</Panel>,
    flush: <Panel isFlush>Gövde</Panel>,
  },
  PanelForm: {
    default: (
      <Panel>
        <PanelForm>
          <Field label="Ad">{props => <Input {...props} />}</Field>
        </PanelForm>
      </Panel>
    ),
  },
  PanelRow: {
    default: (
      <Panel>
        <PanelRow>Satır</PanelRow>
      </Panel>
    ),
  },
  Price: {
    default: <Price value="1.250" />,
    discounted: <Price value="1.250" listValue="1.500" discountPercent={17} />,
  },
  Rating: { default: <Rating value={4.5} count={12} /> },
  SectionHeader: { default: <SectionHeader title="Öne çıkanlar" /> },
  Skeleton: { default: <Skeleton />, text: <Skeleton variant="text" lines={3} /> },
  Spinner: { default: <Spinner /> },
  Tabs: {
    default: (
      <Tabs
        ariaLabel="Görünüm"
        items={[
          { id: 'a', label: 'Birinci', content: 'A' },
          { id: 'b', label: 'İkinci', content: 'B' },
        ]}
      />
    ),
    barOnly: (
      <Tabs
        ariaLabel="Görünüm"
        activeId="a"
        onChange={() => {}}
        items={[
          { id: 'a', label: 'Birinci', count: 3 },
          { id: 'b', label: 'İkinci' },
        ]}
      />
    ),
  },
  Tile: { default: <Tile label="Ana sayfa" href="/" icon={<HouseFill aria-hidden />} /> },

  Accordion: {
    default: (
      <Accordion
        defaultOpenIds={['a']}
        items={[
          { id: 'a', title: 'Kargo ne zaman çıkar?', content: 'Aynı gün.' },
          { id: 'b', title: 'İade koşulları', meta: '2 madde', content: 'On dört gün.' },
        ]}
      />
    ),
    disabled: (
      <Accordion items={[{ id: 'a', title: 'Kapalı bölüm', content: 'Gövde', isDisabled: true }]} />
    ),
  },
  Switch: {
    default: <Switch label="Kampanya bildirimleri" />,
    hint: <Switch label="Bildirimler" hint="Ayda en fazla iki ileti" defaultChecked />,
    disabled: <Switch label="Pasif ayar" disabled />,
  },
  Progress: {
    determinate: <Progress value={60} label="Yükleme" />,
    indeterminate: <Progress label="Yükleme" />,
    withValue: <Progress value={60} label="Yükleme" valueText="3 / 5 dosya" isValueVisible />,
  },
  ProgressCircle: {
    determinate: <ProgressCircle value={60} label="Yükleme" />,
    indeterminate: <ProgressCircle label="Yükleme" />,
  },
  Popover: {
    closed: (
      <Popover label="Yardım" trigger={<button type="button">Aç</button>}>
        Gövde
      </Popover>
    ),
  },
  Menu: {
    closed: (
      <Menu
        label="Satır eylemleri"
        trigger={<button type="button">Eylemler</button>}
        items={[
          { id: 'copy', label: 'Kopyala', onSelect: () => {} },
          { id: 'delete', label: 'Sil', onSelect: () => {}, isDanger: true },
        ]}
      />
    ),
  },
  ToastHub: { default: <ToastHub /> },

  SegmentedControl: {
    default: (
      <SegmentedControl
        label="Görünüm"
        value="list"
        onChange={() => {}}
        options={[
          { value: 'list', label: 'Liste' },
          { value: 'grid', label: 'Izgara' },
        ]}
      />
    ),
  },
  Steps: {
    default: (
      <Steps
        label="Ödeme adımları"
        currentIndex={1}
        steps={[
          { id: 'a', label: 'Adres' },
          { id: 'b', label: 'Ödeme' },
          { id: 'c', label: 'Onay' },
        ]}
      />
    ),
    clickable: (
      <Steps
        label="Ödeme adımları"
        currentIndex={2}
        onStepClick={() => {}}
        steps={[
          { id: 'a', label: 'Adres', description: 'Teslimat bilgileri' },
          { id: 'b', label: 'Ödeme' },
          { id: 'c', label: 'Onay' },
        ]}
      />
    ),
  },
  FileUpload: {
    empty: (
      <FileUpload
        files={[]}
        onSelect={() => {}}
        onRemove={() => {}}
        label="Belge yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
        hint="PDF ya da JPG, en fazla 5 MB"
      />
    ),
    withFiles: (
      <FileUpload
        files={[
          { id: '1', name: 'fatura.pdf', size: 24_000 },
          { id: '2', name: 'ruhsat.jpg', size: 900_000, progress: 40 },
          { id: '3', name: 'bozuk.pdf', size: 10, error: 'Yüklenemedi' },
        ]}
        onSelect={() => {}}
        onRemove={() => {}}
        label="Belge yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
      />
    ),
    error: (
      <FileUpload
        files={[]}
        onSelect={() => {}}
        onRemove={() => {}}
        label="Belge yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
        error="Sunucu dosyayı reddetti"
      />
    ),
  },

  ScrollArea: {
    scrollable: (
      <ScrollArea label="Uzun metin" maxHeight={120}>
        <p>Satır bir</p>
        <p>Satır iki</p>
        <p>Satır üç</p>
        <p>Satır dört</p>
        <p>Satır beş</p>
      </ScrollArea>
    ),
    fits: (
      <ScrollArea label="Kısa metin" maxHeight={400}>
        <p>Tek satır</p>
      </ScrollArea>
    ),
  },
  Stat: {
    up: <Stat label="Bugünkü sipariş" value="128" delta="%12" trend="up" description="düne göre" />,
    down: (
      <Stat
        label="İade oranı"
        value="%3,4"
        delta="%0,8"
        trend="down"
        isUpPositive={false}
        description="geçen haftaya göre"
      />
    ),
    flat: <Stat label="Aktif kullanıcı" value="1.204" delta="0" trend="flat" />,
    plain: <Stat label="Toplam ürün" value="12.480" unit="adet" />,
  },
  Timeline: {
    default: (
      <Timeline
        label="Sipariş geçmişi"
        events={[
          { id: '1', title: 'Sipariş alındı', time: '12 Mart 09:14', status: 'done' },
          { id: '2', title: 'Hazırlanıyor', time: '12 Mart 11:02', status: 'current' },
          { id: '3', title: 'Kargoya verildi', status: 'pending' },
        ]}
      />
    ),
    failed: (
      <Timeline
        label="Ödeme geçmişi"
        events={[
          { id: '1', title: 'Ödeme denendi', time: '12 Mart 09:14', status: 'failed' },
          { id: '2', title: 'Yeniden denendi', time: '12 Mart 09:20', status: 'done' },
        ]}
      />
    ),
  },
  TagInput: {
    withTags: (
      <TagInput
        values={['fren balatası', 'OEM']}
        onChange={() => {}}
        label="Etiketler"
        removeLabel="Kaldır"
        placeholder="Etiket ekleyin"
      />
    ),
    empty: (
      <TagInput
        values={[]}
        onChange={() => {}}
        label="Etiketler"
        removeLabel="Kaldır"
        placeholder="Etiket ekleyin"
      />
    ),
  },

  DateField: {
    default: <DateField aria-label="Doğum tarihi" defaultValue="1990-05-12" />,
    month: <DateField type="month" aria-label="Dönem" defaultValue="2026-03" />,
    disabled: <DateField aria-label="Tarih" defaultValue="2026-03-01" disabled />,
  },
  DateRange: {
    default: (
      <DateRange
        value={{ start: '2026-03-01', end: '2026-03-14' }}
        onChange={() => {}}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        isSummaryVisible
      />
    ),
    empty: (
      <DateRange
        value={{ start: '', end: '' }}
        onChange={() => {}}
        startLabel="Başlangıç"
        endLabel="Bitiş"
      />
    ),
  },
  Carousel: {
    default: (
      <Carousel
        label="Öne çıkan ürünler"
        previousLabel="Önceki"
        nextLabel="Sonraki"
        formatDotLabel={(index, total) => `${total} sayfadan ${index}.`}
        itemMinWidth={160}
      >
        <Card>Kart 1</Card>
        <Card>Kart 2</Card>
        <Card>Kart 3</Card>
        <Card>Kart 4</Card>
        <Card>Kart 5</Card>
      </Carousel>
    ),
  },

  SkeletonCard: { default: <SkeletonCard /> },
  SkeletonRows: { default: <SkeletonRows count={3} /> },
  SkeletonTable: { default: <SkeletonTable count={3} columns={3} /> },

  BottomSheet: {
    default: (
      <BottomSheet title="Seçim" onClose={() => {}}>
        Gövde
      </BottomSheet>
    ),
  },
  Modal: {
    default: (
      <Modal isOpen onClose={() => {}} title="Başlık" description="Bir cümlelik açıklama">
        Gövde
      </Modal>
    ),
    nonDismissable: (
      <Modal isOpen onClose={() => {}} title="Başlık" isDismissable={false}>
        Gövde
      </Modal>
    ),
  },
  Drawer: {
    default: (
      <Drawer isOpen onClose={() => {}} title="Filtreler" closeLabel="Kapat">
        Gövde
      </Drawer>
    ),
  },
  CommandPalette: {
    default: (
      <CommandPalette
        isOpen
        onClose={() => {}}
        label="Komut paleti"
        searchPlaceholder="Komut ara"
        emptyMessage="Sonuç yok"
        items={[
          {
            id: 'orders',
            label: 'Siparişler',
            group: 'Gezinme',
            description: '/siparisler',
            shortcut: 'G S',
            onSelect: () => {},
          },
          { id: 'products', label: 'Ürünler', group: 'Gezinme', onSelect: () => {} },
          { id: 'new', label: 'Yeni ürün ekle', group: 'Eylemler', onSelect: () => {} },
        ]}
      />
    ),
  },
  ConfirmDialog: {
    default: (
      <ConfirmDialog
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        title="Kaydı sil"
        confirmLabel="Sil"
      />
    ),
  },
  PromptDialog: {
    default: (
      <PromptDialog isOpen onClose={() => {}} onSubmit={() => {}} title="Not ekle" label="Not" />
    ),
  },

  Table: {
    default: (
      <Table>
        <thead>
          <tr>
            <th scope="col">Ad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Değer</td>
          </tr>
        </tbody>
      </Table>
    ),
  },
  TableScroller: {
    default: (
      <TableScroller>
        <Table>
          <tbody>
            <tr>
              <td>Değer</td>
            </tr>
          </tbody>
        </Table>
      </TableScroller>
    ),
  },
  DataTable: {
    default: (
      <DataTable columns={COLUMNS}>
        <DataTableRow>
          <td>Değer</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
    loading: <DataTable columns={COLUMNS} isLoading />,
    empty: <DataTable columns={COLUMNS} />,
    error: <DataTable columns={COLUMNS} error="Liste yüklenemedi" />,
    sortable: (
      <DataTable
        columns={[
          { key: 'name', label: 'Ad', isSortable: true, ariaSort: 'ascending', isSticky: true },
          { key: 'actions', srLabel: 'Eylemler' },
        ]}
        onSort={() => {}}
        bulkBar={<span>2 satır seçildi</span>}
      >
        <DataTableRow>
          <td>Değer</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
  },
  DataTableRow: {
    default: (
      <DataTable columns={COLUMNS}>
        <DataTableRow isWarning>
          <td>Değer</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
  },
  FilterBar: {
    default: (
      <FilterBar onSubmit={() => {}}>
        <FilterBarField>
          <Input aria-label="Ara" />
        </FilterBarField>
      </FilterBar>
    ),
  },
  FilterBarField: {
    default: (
      <FilterBar onSubmit={() => {}}>
        <FilterBarField isWide>
          <Input aria-label="Ara" />
        </FilterBarField>
      </FilterBar>
    ),
  },
  Pagination: {
    links: <Pagination page={2} totalPages={9} buildHref={page => `?sayfa=${page}`} />,
    buttons: <Pagination page={1} totalPages={9} onPageChange={() => {}} />,
  },
};

const cases = Object.entries(SCENARIOS).flatMap(([component, states]) =>
  Object.entries(states).map(([state, element]) => [component, state, element] as const),
);

describe('eksen taraması', () => {
  it.each(cases)('%s — %s', async (_component, _state, element) => {
    render(<HanuiProvider labels={LABELS}>{element}</HanuiProvider>);

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('senaryo defteri `index.ts` ile eşleşir', () => {
  const isComponent = (value: unknown): boolean =>
    (typeof value === 'function' && /^[A-Z]/.test((value as { name?: string }).name ?? '')) ||
    (typeof value === 'object' && value !== null && '$$typeof' in value);

  const exported = Object.entries(hanui)
    .filter(([name, value]) => /^[A-Z]/.test(name) && isComponent(value))
    .map(([name]) => name);

  it('dışa verilen her bileşenin en az bir senaryosu var', () => {
    expect(exported.filter(name => !SCENARIOS[name])).toEqual([]);
  });

  it('defterde dışa verilmeyen bir ad yok', () => {
    expect(Object.keys(SCENARIOS).filter(name => !exported.includes(name))).toEqual([]);
  });
});
