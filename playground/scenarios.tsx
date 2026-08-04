import { type ReactElement } from 'react';

import { HeartFill, HouseFill } from 'react-bootstrap-icons';

import {
  Accordion,
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
  Chip,
  ChipGroup,
  Combobox,
  ConfirmDialog,
  CommandPalette,
  CopyField,
  DataTable,
  DateField,
  DateRange,
  type DataTableColumn,
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
  type HanuiLabels,
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
  toast,
  TextLink,
  Tile,
  Timeline,
  Tooltip,
  UIVariant,
} from '../src/index';

import { SOLO_ONLY } from './solo';

/**
 * GALERİ DEFTERİ — görsel dilin tek görüldüğü yer.
 *
 * <p>İki işi var ve ikisi de görsel: tasarım kararı burada bir arada görülür
 * (bir token değişiminin hangi on iki bileşeni etkilediği yalnızca yan yana
 * bakınca anlaşılır) ve görsel regresyon anlık görüntülerinin kaynağı budur.
 *
 * <p>Bu defter `components/__tests__/a11y.test.tsx` içindeki senaryo
 * defterinin KOPYASI DEĞİL: orada soru "erişilebilir mi", burada "nasıl
 * duruyor". Bir bileşenin taranmaya değer durumu (hata metni bağlı mı) ile
 * bakmaya değer durumu (üç varyant yan yana) aynı şey değil. Ama İKİSİNİN de
 * eksiksiz olması gerekiyor; kapsamı `src/__tests__/gallery-coverage.test.ts`
 * ölçüyor.
 */

export const LABELS: HanuiLabels = {
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
    srLabel: (value, count) => `5 üzerinden ${value}${count ? ` — ${count} değerlendirme` : ''}`,
    starCount: star => `${star} yıldız`,
    scale: { 1: 'Çok kötü', 2: 'Kötü', 3: 'Orta', 4: 'İyi', 5: 'Çok iyi' },
  },
};

const OPTIONS = [
  { value: 'a', label: 'Birinci seçenek' },
  { value: 'b', label: 'İkinci seçenek', description: 'Ayırt edici satır' },
  { value: 'c', label: 'Üçüncü seçenek' },
];

const COLUMNS: DataTableColumn[] = [
  { key: 'code', label: 'Kod' },
  { key: 'name', label: 'Ad' },
  { key: 'actions', srLabel: 'Eylemler' },
];

const noop = () => {};

export const SCENARIOS: Record<string, Record<string, ReactElement>> = {
  HanuiProvider: {
    açıklama: (
      <p style={{ maxWidth: '52ch' }}>
        Sağlayıcı görünür bir şey çizmez: tema ezmelerini belgeye yazar, metinleri ve yönlendirici
        bileşenini ağaca dağıtır. Bu sayfanın tamamı zaten onun içinde.
      </p>
    ),
  },

  // --- Eylem ---
  Button: {
    primary: <Button variant={UIVariant.PRIMARY}>Kaydet</Button>,
    secondary: <Button variant={UIVariant.SECONDARY}>Vazgeç</Button>,
    cart: <Button variant={UIVariant.CART}>Sepete ekle</Button>,
    outline: <Button variant={UIVariant.OUTLINE}>İncele</Button>,
    ghost: <Button variant={UIVariant.GHOST}>Daha fazla</Button>,
    danger: <Button variant={UIVariant.DANGER}>Sil</Button>,
    loading: <Button isLoading>Kaydet</Button>,
    disabled: <Button disabled>Kaydet</Button>,
    link: <Button href="#">Bağlantı düğmesi</Button>,
  },
  IconButton: {
    ghost: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" />,
    outline: (
      <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" variant="outline" />
    ),
    disabled: <IconButton icon={<HeartFill aria-hidden />} label="Favorilere ekle" disabled />,
  },
  TextLink: {
    brand: <TextLink href="#">Tüm ürünleri gör</TextLink>,
    arrow: (
      <TextLink href="#" hasArrow>
        Devamını oku
      </TextLink>
    ),
    muted: (
      <TextLink href="#" tone="muted">
        Gizlilik
      </TextLink>
    ),
  },
  Tooltip: {
    default: (
      <Tooltip content="Kısa bir açıklama">
        <Button variant={UIVariant.SECONDARY}>Üzerine gel</Button>
      </Tooltip>
    ),
  },

  // --- Seçim ---
  Chip: {
    default: <Chip>Etiket</Chip>,
    selected: <Chip isSelected>Seçili</Chip>,
    count: <Chip count={12}>Sayaçlı</Chip>,
    disabled: <Chip disabled>Pasif</Chip>,
  },
  ChipGroup: {
    single: <ChipGroup label="Sıralama" options={OPTIONS} value="a" onChange={noop} />,
    multiple: (
      <ChipGroup isMultiple label="Süzgeç" options={OPTIONS} value={['a', 'c']} onChange={noop} />
    ),
  },
  Combobox: {
    empty: (
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={noop}
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    selected: (
      <Combobox
        options={OPTIONS}
        value="b"
        onChange={noop}
        isClearable
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
    disabled: (
      <Combobox
        options={OPTIONS}
        value={null}
        onChange={noop}
        isDisabled
        labels={{ placeholder: 'Marka seçin' }}
      />
    ),
  },
  Select: {
    default: <Select options={OPTIONS} value="a" onChange={noop} label="Sıralama" />,
    small: <Select options={OPTIONS} value="b" onChange={noop} label="Sıralama" size="sm" />,
    disabled: <Select options={OPTIONS} value="a" onChange={noop} label="Sıralama" isDisabled />,
  },
  Checkbox: {
    default: <Checkbox label="Kampanyalardan haberdar ol" defaultChecked />,
    hint: <Checkbox label="Sözleşmeyi okudum" hint="Metin yeni sekmede açılır" />,
    disabled: <Checkbox label="Pasif seçim" disabled />,
  },
  Radio: {
    default: <Radio name="teslimat" label="Kargo" defaultChecked />,
    count: <Radio name="teslimat" label="Mağazadan teslim" count={3} />,
  },
  RadioCard: {
    selected: (
      <RadioCard name="ödeme" value="kart" isSelected onChange={noop}>
        <strong>Kredi kartı</strong>
        <div>Tek çekim ya da taksitli</div>
      </RadioCard>
    ),
    unselected: (
      <RadioCard name="ödeme" value="havale" isSelected={false} onChange={noop}>
        <strong>Havale / EFT</strong>
        <div>Ödeme onayı bir iş günü sürebilir</div>
      </RadioCard>
    ),
  },
  RangeSlider: {
    default: (
      <RangeSlider
        min={0}
        max={100000}
        step={500}
        value={[20000, 70000]}
        onChange={noop}
        label="Fiyat aralığı"
        formatValue={value => `${value.toLocaleString('tr-TR')} TL`}
      />
    ),
  },
  RatingInput: {
    selected: <RatingInput value={4} onChange={noop} label="Ürün puanı" />,
    empty: <RatingInput value={null} onChange={noop} label="Ürün puanı" />,
  },
  QuantityStepper: {
    default: <QuantityStepper value={2} onChange={noop} />,
    atMin: <QuantityStepper value={1} onChange={noop} min={1} />,
  },
  TableCheckbox: {
    default: (
      <Table>
        <tbody>
          <tr>
            <td>
              <TableCheckbox label="SP-1 seç" defaultChecked />
            </td>
            <td>SP-1</td>
          </tr>
        </tbody>
      </Table>
    ),
  },

  // --- Girdi ---
  Input: {
    default: <Input aria-label="Ad" placeholder="Ad soyad" />,
    invalid: <Input aria-label="Ad" defaultValue="—" aria-invalid />,
    disabled: <Input aria-label="Ad" defaultValue="Değiştirilemez" disabled />,
    technical: <Input aria-label="Şase" defaultValue="WVWZZZ1KZAW000001" isTechnical />,
  },
  Textarea: { default: <Textarea aria-label="Not" placeholder="Notunuz" /> },
  Field: {
    default: <Field label="Ad">{props => <Input {...props} placeholder="Ad soyad" />}</Field>,
    hint: (
      <Field label="TCKN" hint="Kimlikteki hâliyle, 11 hane">
        {props => <Input {...props} />}
      </Field>
    ),
    error: (
      <Field label="Telefon" error="Telefon numarası geçersiz" isRequired>
        {props => <Input {...props} defaultValue="05" />}
      </Field>
    ),
  },

  // --- Yüzey ve geri bildirim ---
  Alert: {
    info: <Alert>Siparişiniz hazırlanıyor.</Alert>,
    success: <Alert tone="success">Ödeme alındı.</Alert>,
    warning: <Alert tone="warning">Stok azalıyor.</Alert>,
    danger: (
      <Alert tone="danger" title="İşlem tamamlanamadı">
        Kart bankası isteği reddetti.
      </Alert>
    ),
  },
  Avatar: {
    initial: <Avatar name="Ahmet İlhan" />,
    small: <Avatar name="İlkay Yılmaz" size="sm" />,
    large: <Avatar name="Zeynep Kaya" size="lg" />,
  },
  Badge: {
    soft: <Badge>Yeni</Badge>,
    solid: <Badge variant="solid">Kampanya</Badge>,
    outline: <Badge variant="outline">Muadil</Badge>,
    success: <Badge tone="success">Stokta</Badge>,
    warning: <Badge tone="warning">Son 2 adet</Badge>,
    danger: <Badge tone="danger">Tükendi</Badge>,
  },
  Breadcrumb: {
    default: (
      <Breadcrumb
        items={[
          { label: 'Ana sayfa', href: '#' },
          { label: 'Fren sistemi', href: '#' },
          { label: 'Fren balatası' },
        ]}
      />
    ),
  },
  Card: {
    default: <Card>Kart gövdesi</Card>,
    interactive: <Card isInteractive>Tıklanabilir kart</Card>,
  },
  CardBody: {
    default: (
      <Card>
        <CardBody>Gövde bölümü</CardBody>
      </Card>
    ),
  },
  CardFooter: {
    default: (
      <Card>
        <CardBody>Gövde</CardBody>
        <CardFooter>
          <Price value="1.250" />
        </CardFooter>
      </Card>
    ),
  },
  CardMedia: {
    default: (
      <Card>
        <CardMedia ratio={1.4}>
          <div style={{ width: '100%', height: '100%', background: 'var(--hanui-media-bg)' }} />
        </CardMedia>
        <CardBody>Görsel alanı</CardBody>
      </Card>
    ),
  },
  CardOverlay: {
    default: (
      <Card>
        <CardMedia ratio={1.4}>
          <div style={{ width: '100%', height: '100%', background: 'var(--hanui-media-bg)' }} />
          <CardOverlay position="top-left">
            <Badge tone="danger" variant="solid">
              %20
            </Badge>
          </CardOverlay>
        </CardMedia>
      </Card>
    ),
  },
  CopyField: { default: <CopyField value="SP-2026-000123" /> },
  Divider: { plain: <Divider />, labelled: <Divider label="veya" /> },
  Directory: {
    default: (
      <Directory>
        <DirectoryGroup label="A" meta="2 marka">
          <DirectoryRow href="#" name="Audi" />
          <DirectoryRow href="#" name="Alfa Romeo" />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryGroup: {
    default: (
      <Directory>
        <DirectoryGroup label="B" href="#" meta="1 marka">
          <DirectoryRow href="#" name="BMW" />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryRow: {
    marker: (
      <Directory>
        <DirectoryGroup label="B">
          <DirectoryRow href="#" name="BMW" marker={<Badge>OEM</Badge>} />
        </DirectoryGroup>
      </Directory>
    ),
  },
  DirectoryJump: {
    default: <DirectoryJump labels={['A', 'B', 'C', 'D']} toId={label => `grup-${label}`} />,
  },
  EmptyState: {
    default: <EmptyState title="Sonuç bulunamadı" description="Süzgeçleri genişletmeyi deneyin." />,
    error: (
      <EmptyState
        tone="error"
        title="Liste yüklenemedi"
        description="Bağlantı kurulamadı."
        action={<Button>Yeniden dene</Button>}
      />
    ),
    withAction: (
      <EmptyState
        title="Sepetiniz boş"
        description="Beğendiğiniz ürünleri buraya ekleyin."
        action={<Button variant={UIVariant.CART}>Alışverişe başla</Button>}
      />
    ),
  },
  PageHeader: {
    default: (
      <PageHeader
        title="Siparişlerim"
        description="Son 12 ayın siparişleri"
        actions={<Button variant={UIVariant.SECONDARY}>Dışa aktar</Button>}
      />
    ),
  },
  Panel: {
    default: <Panel title="İletişim bilgileri">Gövde</Panel>,
    withFooter: (
      <Panel title="Fatura adresi" footer={<Button>Kaydet</Button>}>
        Gövde
      </Panel>
    ),
    /*
     * NOBETCI: dip seridi `PanelForm`un sutununda bitmeli.
     *
     * Bu bilesim defterde yoktu ve tam da burada bozuluyordu: form 565 px'lik
     * sutununu bitirirken kaydet dugmesi panelin obur ucunda duruyordu.
     * Yukaridaki `withFooter` (formsuz) karsilastirma icin: orada dugmenin
     * saga yaslanmasi DOGRU davranis.
     */
    /*
     * Ad `Wide` ile BITIYOR: hucre satirin tamamini alir (bkz.
     * `playground.css`). Dar bir hucrede `PanelForm`un 565 px'lik siniri hic
     * baglamaz ve nobetci hicbir sey olcmez.
     */
    formWithFooterWide: (
      <Panel title="Fatura adresi" footer={<Button>Kaydet</Button>}>
        <PanelForm>
          <Field label="Adres başlığı">{props => <Input {...props} />}</Field>
          <Field label="Şehir">{props => <Input {...props} />}</Field>
        </PanelForm>
      </Panel>
    ),
  },
  PanelForm: {
    default: (
      <Panel title="Bilgiler">
        <PanelForm columns={2}>
          <Field label="Ad">{props => <Input {...props} />}</Field>
          <Field label="Soyad">{props => <Input {...props} />}</Field>
        </PanelForm>
      </Panel>
    ),
  },
  PanelRow: {
    default: (
      <Panel title="Özet">
        <PanelRow>Ara toplam</PanelRow>
        <PanelRow>Kargo</PanelRow>
      </Panel>
    ),
  },
  Price: {
    default: <Price value="1.250" />,
    discounted: <Price value="1.250" listValue="1.500" discountPercent={17} />,
    large: <Price value="12.499" size="xl" />,
  },
  Rating: {
    default: <Rating value={4.5} count={128} />,
    small: <Rating value={3} size="sm" />,
  },
  SectionHeader: {
    default: (
      <SectionHeader
        overline="Kampanya"
        title="Öne çıkan ürünler"
        description="Bu hafta en çok tercih edilenler"
      />
    ),
  },
  Skeleton: {
    block: <Skeleton height={72} />,
    text: <Skeleton variant="text" lines={3} />,
    circle: <Skeleton variant="circle" width={48} height={48} />,
  },
  Spinner: { small: <Spinner size="sm" />, medium: <Spinner />, large: <Spinner size="lg" /> },
  Tabs: {
    withPanel: (
      <Tabs
        ariaLabel="Ürün bilgisi"
        items={[
          { id: 'a', label: 'Açıklama', content: 'Ürün açıklaması' },
          { id: 'b', label: 'Uyumluluk', count: 12, content: 'Uyumlu araçlar' },
          { id: 'c', label: 'Yorumlar', count: 3, content: 'Yorumlar' },
        ]}
      />
    ),
  },
  Tile: {
    default: <Tile label="Ana sayfa" href="#" icon={<HouseFill aria-hidden />} />,
    active: <Tile label="Garajım" href="#" icon={<HouseFill aria-hidden />} isActive />,
  },

  Accordion: {
    çoklu: (
      <Accordion
        defaultOpenIds={['a']}
        items={[
          { id: 'a', title: 'Kargo ne zaman çıkar?', content: 'Saat 16:00`a kadar aynı gün.' },
          { id: 'b', title: 'İade koşulları', meta: '2 madde', content: 'On dört gün içinde.' },
          { id: 'c', title: 'Garanti', content: 'Üretici garantisi 2 yıl.' },
        ]}
      />
    ),
    tekAçık: (
      <Accordion
        isSingle
        defaultOpenIds={['a']}
        items={[
          { id: 'a', title: 'Marka', content: 'Filtre gövdesi' },
          { id: 'b', title: 'Fiyat', content: 'Filtre gövdesi' },
        ]}
      />
    ),
  },
  Switch: {
    default: <Switch label="Kampanya bildirimleri" defaultChecked />,
    hint: <Switch label="Stok uyarısı" hint="Ürün stoğa girince e-posta gönderilir" />,
    labelFirst: <Switch label="Koyu tema" isLabelFirst />,
    disabled: <Switch label="Pasif ayar" disabled />,
  },
  Progress: {
    determinate: <Progress value={60} label="Yükleme" isValueVisible />,
    withText: (
      <Progress value={60} max={100} label="Yükleme" valueText="3 / 5 dosya" isValueVisible />
    ),
    indeterminate: <Progress label="Yükleme" />,
    success: <Progress value={100} label="Yükleme" tone="success" isValueVisible />,
    danger: <Progress value={35} label="Yükleme" tone="danger" isValueVisible />,
  },
  ProgressCircle: {
    determinate: <ProgressCircle value={70} label="Yükleme" isValueVisible />,
    large: <ProgressCircle value={40} label="Yükleme" size={72} isValueVisible />,
    indeterminate: <ProgressCircle label="Yükleme" />,
  },
  Popover: {
    kapalı: (
      <Popover label="Yardım" trigger={<Button variant={UIVariant.SECONDARY}>Popover aç</Button>}>
        <strong>Uyumluluk nasıl belirlenir?</strong>
        <p style={{ margin: '8px 0 0' }}>Aracın şase numarasından üretici verisi çözümlenir.</p>
      </Popover>
    ),
  },
  Menu: {
    kapalı: (
      <Menu
        label="Satır eylemleri"
        trigger={<Button variant={UIVariant.SECONDARY}>Eylemler</Button>}
        items={[
          { id: 'copy', label: 'Kopyala', onSelect: noop },
          { id: 'export', label: 'Dışa aktar', onSelect: noop },
          { id: 'archive', label: 'Arşivle', onSelect: noop, isDisabled: true },
          { id: 'delete', label: 'Sil', onSelect: noop, isDanger: true },
        ]}
      />
    ),
  },
  ToastHub: {
    /*
     * Yigin GORUNUR bir sey kaplamaz; bildirimler `toast.*` ile aciliyor.
     * Galeride bir dugme ile ornek uretiliyor — anlik goruntude yalnizca
     * dugmeler gorunur, ki dogrusu bu: bildirim kalici bir yuzey degil.
     */
    örnek: (
      <>
        <ToastHub />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant={UIVariant.SECONDARY} onClick={() => toast.success('Adres kaydedildi')}>
            Başarı
          </Button>
          <Button
            variant={UIVariant.SECONDARY}
            onClick={() =>
              toast.error('Kart reddedildi', {
                description: 'Bankanız işlemi onaylamadı.',
                action: { label: 'Yeniden dene', onClick: noop },
              })
            }
          >
            Hata
          </Button>
        </div>
      </>
    ),
  },

  SegmentedControl: {
    metin: (
      <SegmentedControl
        label="Görünüm"
        value="list"
        onChange={noop}
        options={[
          { value: 'list', label: 'Liste' },
          { value: 'grid', label: 'Izgara' },
        ]}
      />
    ),
    üçlü: (
      <SegmentedControl
        label="Dönem"
        value="year"
        onChange={noop}
        size="sm"
        options={[
          { value: 'week', label: 'Hafta' },
          { value: 'month', label: 'Ay' },
          { value: 'year', label: 'Yıl' },
        ]}
      />
    ),
  },
  Steps: {
    yatay: (
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
    dikey: (
      <Steps
        label="Sipariş durumu"
        orientation="vertical"
        currentIndex={2}
        steps={[
          { id: 'a', label: 'Alındı', description: 'Sipariş oluşturuldu' },
          { id: 'b', label: 'Hazırlanıyor', description: 'Depoda toplanıyor' },
          { id: 'c', label: 'Kargoda', description: 'Yola çıktı' },
          { id: 'd', label: 'Teslim' },
        ]}
      />
    ),
  },
  FileUpload: {
    boş: (
      <FileUpload
        files={[]}
        onSelect={noop}
        onRemove={noop}
        label="Ruhsat yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
        hint="PDF ya da JPG, en fazla 5 MB"
      />
    ),
    dosyalı: (
      <FileUpload
        files={[
          { id: '1', name: 'ruhsat-on.jpg', size: 240_000 },
          { id: '2', name: 'ruhsat-arka.jpg', size: 910_000, progress: 45 },
          { id: '3', name: 'eski.pdf', size: 12_000_000, error: 'Dosya çok büyük' },
        ]}
        onSelect={noop}
        onRemove={noop}
        label="Ruhsat yükleyin"
        dropLabel="Dosyaları buraya bırakın"
        removeLabel="Kaldır"
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
    valueOnly: <Stat label="Toplam ürün" value="12.480" unit="adet" />,
    /* Kutusuz olcum: kendi zemini olan bandin uzerinde kullanilir. */
    plain: <Stat variant="plain" label="Toplam ürün" value="12.480" unit="adet" />,
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
        onChange={noop}
        label="Etiketler"
        removeLabel="Kaldır"
        placeholder="Etiket ekleyin"
      />
    ),
    empty: (
      <TagInput
        values={[]}
        onChange={noop}
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
        onChange={noop}
        startLabel="Başlangıç"
        endLabel="Bitiş"
        isSummaryVisible
      />
    ),
    empty: (
      <DateRange
        value={{ start: '', end: '' }}
        onChange={noop}
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

  // --- Kipsel (yalnızca `?solo=`) ---
  Modal: {
    default: (
      <Modal
        isOpen
        onClose={noop}
        title="Adresi sil"
        description="Bu adres siparişlerinizde görünmeye devam eder."
        footer={
          <>
            <Button variant={UIVariant.SECONDARY}>Vazgeç</Button>
            <Button variant={UIVariant.DANGER}>Sil</Button>
          </>
        }
      >
        Gövde metni.
      </Modal>
    ),
  },
  BottomSheet: {
    default: (
      <BottomSheet title="Sıralama" onClose={noop}>
        Panel gövdesi
      </BottomSheet>
    ),
  },
  Drawer: {
    default: (
      <Drawer
        isOpen
        onClose={noop}
        title="Filtreler"
        footer={
          <>
            <Button variant={UIVariant.GHOST}>Temizle</Button>
            <Button variant={UIVariant.PRIMARY}>128 ürünü göster</Button>
          </>
        }
      >
        Filtre gövdesi
      </Drawer>
    ),
  },
  CommandPalette: {
    default: (
      <CommandPalette
        isOpen
        onClose={noop}
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
            onSelect: noop,
          },
          { id: 'products', label: 'Ürünler', group: 'Gezinme', onSelect: noop },
          { id: 'new', label: 'Yeni ürün ekle', group: 'Eylemler', onSelect: noop },
        ]}
      />
    ),
  },
  ConfirmDialog: {
    default: (
      <ConfirmDialog
        isOpen
        onClose={noop}
        onConfirm={noop}
        title="Kaydı sil"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
      />
    ),
  },
  PromptDialog: {
    default: (
      <PromptDialog
        isOpen
        onClose={noop}
        onSubmit={noop}
        title="Not ekle"
        label="Sipariş notu"
        hint="En fazla 200 karakter"
      />
    ),
  },

  // --- Veri ---
  Table: {
    default: (
      <Table hasRowHover>
        <thead>
          <tr>
            <th scope="col">Kod</th>
            <th scope="col">Ad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SP-1</td>
            <td>Fren balatası</td>
          </tr>
          <tr>
            <td>SP-2</td>
            <td>Fren diski</td>
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
              <td>Kaydırma kutusu içinde</td>
            </tr>
          </tbody>
        </Table>
      </TableScroller>
    ),
  },
  DataTable: {
    rows: (
      <DataTable columns={COLUMNS}>
        <DataTableRow>
          <td>SP-1</td>
          <td>Fren balatası</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
    loading: <DataTable columns={COLUMNS} isLoading />,
    empty: <DataTable columns={COLUMNS} />,
    error: <DataTable columns={COLUMNS} error="Liste yüklenemedi" />,
    sıralanabilir: (
      <DataTable
        columns={[
          { key: 'code', label: 'Kod', isSortable: true, ariaSort: 'ascending', isSticky: true },
          { key: 'name', label: 'Ad', isSortable: true },
          { key: 'actions', srLabel: 'Eylemler' },
        ]}
        onSort={noop}
        bulkBar={<span>2 satır seçildi</span>}
      >
        <DataTableRow>
          <td>SP-1</td>
          <td>Fren balatası</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
  },
  DataTableRow: {
    warning: (
      <DataTable columns={COLUMNS}>
        <DataTableRow isWarning>
          <td>SP-9</td>
          <td>Kritik stok</td>
          <td />
        </DataTableRow>
      </DataTable>
    ),
  },
  FilterBar: {
    default: (
      <FilterBar onSubmit={noop} actions={<Button>Uygula</Button>}>
        <FilterBarField>
          <Input aria-label="Ara" placeholder="Kod ya da ad" />
        </FilterBarField>
        <FilterBarField>
          <Select options={OPTIONS} value="a" onChange={noop} label="Durum" size="sm" />
        </FilterBarField>
      </FilterBar>
    ),
    /*
     * KARISIK YUKSEKLIKLER — seridin en zor hali ve tek gorsel nobetcisi.
     *
     * Ucu bir arada: etiketsiz alan, etiketli alan ve etiketi + ALTINDA
     * yardim metni olan alan. Serit `align-items: flex-end` tasidigi surece
     * ucuncusunun yardim metni digerlerinin GIRDISIYLE ayni hizaya oturuyor
     * ve girdinin kendisi yukari kaciyordu. Senaryo bu yuzden defterde.
     */
    mixed: (
      <FilterBar onSubmit={noop} actions={<Button>Uygula</Button>}>
        <FilterBarField isWide>
          <Input aria-label="Ara" placeholder="Kod ya da ad" />
        </FilterBarField>
        <FilterBarField>
          <Select options={OPTIONS} value="a" onChange={noop} label="Durum" size="sm" />
        </FilterBarField>
        <FilterBarField>
          <Field label="Depo kodu" hint="Örn. IST-01">
            {props => <Input {...props} placeholder="IST-01" />}
          </Field>
        </FilterBarField>
      </FilterBar>
    ),
  },
  FilterBarField: {
    wide: (
      <FilterBar onSubmit={noop}>
        <FilterBarField isWide>
          <Input aria-label="Ara" placeholder="Geniş alan" />
        </FilterBarField>
      </FilterBar>
    ),
  },
  Pagination: {
    links: <Pagination page={4} totalPages={42} buildHref={page => `#sayfa-${page}`} />,
    buttons: <Pagination page={1} totalPages={5} onPageChange={noop} />,
  },
};

export { HanuiProvider, SOLO_ONLY };
