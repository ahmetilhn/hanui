/**
 * @ahmetilhn/hanui — açık genel API.
 *
 * <p>Dışa verilen her ad bir SÖZLEŞMEDİR: bir sonraki büyük sürüme kadar
 * kaldırılmaz ve davranışı sessizce değişmez. İç yardımcılar (`HanuiLink`,
 * ikonlar, `cx`) bilinçli olarak dışarıda — dışa verilseler tüketiciler onlara
 * dayanır ve iç yapıyı değiştirmek kırıcı bir değişikliğe dönüşür.
 */

import './styles/base.scss';

// --- Tema -------------------------------------------------------------
export { default as HanuiProvider } from './theme/HanuiProvider';
export { default as initHanui } from './theme/initHanui';
export { useHanui } from './theme/context';
export {
  COMPACT_DENSITY,
  DARK_THEME,
  DEFAULT_FONTS,
  LIGHT_THEME,
  METRIC_TOKENS,
} from './theme/tokens';
export { resolveTokens, buildThemeCss } from './helpers/theme.helper';

// --- Kancalar ---------------------------------------------------------
export { default as useAnnounce } from './hooks/useAnnounce';
export { default as useHanuiTheme } from './hooks/useHanuiTheme';
export {
  default as useListboxNavigation,
  type ListboxNavigation,
} from './hooks/useListboxNavigation';
export { default as usePositioning } from './hooks/usePositioning';
export { default as useVirtualList } from './hooks/useVirtualList';
export { default as useScrollLock } from './hooks/useScrollLock';
export { default as useSheetViewport } from './hooks/useSheetViewport';

// --- Enum ve tipler ---------------------------------------------------
export { default as UIVariant } from './enums/ui-variant.enum';
export { default as UISize } from './enums/ui-size.enum';
export type { CommonElementProps } from './types/common-element-props.type';
export type { HanuiLinkComponent, HanuiLinkExtraProps, HanuiLinkProps } from './types/link.type';

// --- Sabitler ---------------------------------------------------------
export {
  ABOVE_MOBILE_MEDIA_QUERY,
  ABOVE_TABLET_MEDIA_QUERY,
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  TABLET_PORTRAIT_BREAKPOINT,
} from './constants/breakpoint.constants';

// --- Yardımcılar ------------------------------------------------------
export { matchesSearch, normalizeSearchTerm } from './helpers/text.helper';
export { isKeyboardOpeningElement, preventAutoKeyboard } from './helpers/focus.helper';

// --- Eylem ------------------------------------------------------------
export { default as Button } from './components/Button';
export { default as IconButton, type IconButtonVariant } from './components/IconButton';
export { default as TextLink } from './components/TextLink';
export { default as Tooltip } from './components/Tooltip';
export { default as Menu, type MenuItem } from './components/Menu';
export { default as Popover } from './components/Popover';

// --- Seçim ------------------------------------------------------------
export { default as Chip, type ChipSize } from './components/Chip';
export { default as ChipGroup, type ChipOption } from './components/ChipGroup';
export {
  default as Combobox,
  type ComboboxLabels,
  type ComboboxOption,
} from './components/Combobox';
export { default as SegmentedControl, type SegmentOption } from './components/SegmentedControl';
export { default as Select, type SelectOption } from './components/Select';
export { default as Checkbox } from './components/Checkbox';
export { default as Switch } from './components/Switch';
export { default as Radio } from './components/Radio';
export { default as RadioCard } from './components/RadioCard';
export { default as RangeSlider, type RangeValue } from './components/RangeSlider';
export { default as RatingInput, type RatingLabels } from './components/RatingInput';
export { default as QuantityStepper } from './components/QuantityStepper';
export { default as TableCheckbox } from './components/TableCheckbox';

// --- Girdi ------------------------------------------------------------
export { default as Input } from './components/Input';
export { default as PasswordInput } from './components/PasswordInput';
export { default as TagInput } from './components/TagInput';
export { default as Textarea } from './components/Textarea';
export { default as DateField, DateRange, type DateRangeValue } from './components/DateField';
export { default as Field, type FieldChildProps } from './components/Field';
export { default as FileUpload, type UploadFile } from './components/FileUpload';

// --- Yüzey ve geri bildirim -------------------------------------------
export { default as Alert, type AlertTone } from './components/Alert';
export { default as Avatar } from './components/Avatar';
export { default as Badge, type BadgeTone, type BadgeVariant } from './components/Badge';
export { default as Breadcrumb, type Crumb } from './components/Breadcrumb';
export {
  default as Card,
  CardBody,
  CardFooter,
  CardMedia,
  type CardMediaFit,
  CardOverlay,
} from './components/Card';
export { default as Carousel } from './components/Carousel';
export { default as CopyField } from './components/CopyField';
export { default as Divider } from './components/Divider';
export {
  default as Directory,
  DirectoryGroup,
  DirectoryJump,
  DirectoryRow,
} from './components/Directory';
export { default as EmptyState } from './components/EmptyState';
export { default as PageHeader } from './components/PageHeader';
export { default as Panel, PanelForm, PanelRow } from './components/Panel';
export { default as Price } from './components/Price';
export { default as Rating } from './components/Rating';
export { default as SectionHeader } from './components/SectionHeader';
export { default as ScrollArea } from './components/ScrollArea';
export {
  default as Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonTable,
} from './components/Skeleton';
export { default as Stat, type StatTrend } from './components/Stat';
export { default as Progress, ProgressCircle } from './components/Progress';
export { default as Spinner } from './components/Spinner';
export { default as ToastHub, toast, type ToastOptions, type ToastTone } from './components/Toast';
export { default as ToastPortal } from './components/ToastPortal';
export { default as Accordion, type AccordionItem } from './components/Accordion';
export { default as Steps, type StepItem } from './components/Steps';
export { default as Tabs, type TabItem } from './components/Tabs';
export { default as Tile } from './components/Tile';
export {
  default as Timeline,
  type TimelineEvent,
  type TimelineStatus,
} from './components/Timeline';

// --- Kipsel -----------------------------------------------------------
export { default as BottomSheet } from './components/BottomSheet';
export { default as Modal, type ModalTone } from './components/Modal';
export { default as CommandPalette, type CommandItem } from './components/CommandPalette';
export { default as ConfirmDialog, type ConfirmKind } from './components/ConfirmDialog';
export { default as Drawer } from './components/Drawer';
export { default as PromptDialog } from './components/PromptDialog';

// --- Veri -------------------------------------------------------------
export { default as Table, TableScroller } from './components/Table';
export { default as DataTable, DataTableRow, type DataTableColumn } from './components/DataTable';
export { default as FilterBar, FilterBarField } from './components/FilterBar';
export { default as Pagination } from './components/Pagination';

/* Tip sozlesmeleri — govdeleri `src/types/` altinda. */
export type { AnnouncePoliteness, ListboxNavigationOptions, VirtualRange } from './types/hook.type';
export type {
  PositionAlign,
  PositionSide,
  PositioningOptions,
  PositioningState,
} from './types/positioning.type';
export type {
  HanuiColorPreference,
  HanuiColorScheme,
  HanuiContextValue,
  HanuiDensity,
  HanuiFonts,
  HanuiLabels,
  HanuiMetricToken,
  HanuiMetrics,
  HanuiResolvedTokens,
  HanuiThemeConfig,
  HanuiThemeTokens,
  HanuiToken,
  InitHanuiOptions,
} from './types/theme.type';
