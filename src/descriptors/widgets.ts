import type { TrackType } from '../models/track';
import type { LabelText } from './text';

export enum WidgetType {
  Slider = 1,
  Input = 2,
  /** A widget that selects one track. */
  TrackSelector = 3,
  /** A widget that selects a pitch. */
  Pitch = 4,
  TrackPitchSelector = 5,
  InstrumentSelector = 6,
  Select = 7,
  Switch = 8,
  InputNumber = 9,
  MultiTrackSelector = 10,
  /** Does not render a widget. */
  None = 11,
  FileSelector = 12,
  MultiSourceAudioSelector = 13,
  AudioRecorder = 14,
  SelectList = 15,
  /** Read-only table of descriptions. */
  Descriptions = 16,
  TextArea = 17,
  /** Display a markdown block. Does not produce any value. */
  Markdown = 18,
}

/**
 * Add your widget config here.
 */
export interface WidgetDescriptor {
  type: WidgetType;
  config?:
    | SliderWidgetConfig
    | InputWidgetConfig
    | SelectWidgetConfig
    | TrackSelectorWidgetConfig
    | PitchWidgetConfig
    | TrackPitchSelectorWidgetConfig
    | InstrumentSelectorWidgetConfig
    | SwitchWidgetConfig
    | InputNumberWidgetConfig
    | FileSelectorWidgetConfig
    | SelectListWidgetConfig
    | MultiSourceAudioSelectorWidgetConfig
    | DescriptionsWidgetConfig
    | TextAreaWidgetConfig
    | undefined
    | null;
}

export type SliderMarkerConfig = { [percentage: number]: LabelText };

export interface SliderWidgetConfig {
  minValue: number;
  maxValue: number;
  step: number;
  unit?: string;
  markers?: SliderMarkerConfig;
}

export interface InputWidgetConfig {
  minValue: number;
  maxValue: number;
  step: number;
}

export interface TrackSelectorWidgetConfig {
  /** Whether to always show the track info. Default to false. */
  alwaysShowTrackInfo?: boolean;
  /** If specified, only the allowed types of tracks can be selected. */
  allowedTrackTypes?: TrackType[];
}

export interface PitchWidgetConfig {
  minAllowedPitch?: number;
  maxAllowedPitch?: number;
}

export interface TrackPitchSelectorWidgetConfig {
  trackSelectorConfig: TrackSelectorWidgetConfig;
  pitchSelectorConfig: PitchWidgetConfig;
}

export interface InstrumentSelectorWidgetConfig {
  /** Not supported yet. */
  disabledPrograms?: number[];
}

export interface SelectWidgetOption {
  label: LabelText;
  value: any;
}

export interface SelectWidgetConfig {
  options: SelectWidgetOption[];
  /** Whether to show search box. Default to false. */
  allowSearch?: boolean;
  placeholder?: LabelText;
  /** https://arco.design/vue/component/select#virtual-list */
  virtualListProps?: any;
  /**
   * Whether to populate the options with the styles that
   * TuneFlow can generate.
   */
  populateOptionsWithGeneratableStyles?: boolean;
  /**
   * Whether to populate the options with the tempo settings that
   * TuneFlow can generate with.
   */
  populateOptionsWithGeneratableTempos?: boolean;
}

export interface SelectListWidgetConfig {
  options: SelectWidgetOption[];
  maxHeight?: number;
  size?: string;
  /** https://arco.design/vue/component/list */
  virtualListProps?: any;
  allowSearch?: boolean;
}

export interface SwitchWidgetConfig {
  /**
   * 'circle' | 'round' | 'line'
   * https://arco.design/vue/component/switch
   */
  type?: 'circle' | 'round' | 'line';
}

export interface InputNumberWidgetConfig {
  minValue: number;
  maxValue: number;
  step: number;
}

export interface FileSelectorWidgetConfig {
  /** The extensions (without ".") that are allowed to choose. */
  allowedExtensions: string[];

  /**
   * Whether to select a directory instead of a file.
   * Default to false.
   */
  selectDirectory?: boolean;

  /**
   * Custom placeholder text.
   */
  placeholder?: LabelText;

  /** If true, selects local system files. */
  selectLocalFile?: boolean;
}

type AudioSourceType = 'file' | 'audioTrack' | 'record';

export interface MultiSourceAudioSelectorWidgetConfig {
  // Default to allow all audio sources.
  allowedSources?: AudioSourceType[];
}

export interface MultiSourceAudioSelectorResult {
  sourceType: AudioSourceType;
  /**
   * Result type will be:
   * * `File` if `sourceType` is 'file'
   * * trackId if `sourceType` is 'audioTrack'
   * * `AudioBuffer` if `sourceType` is 'record'
   */
  audioInfo: File | string | AudioBuffer;
}

export interface DescriptionData {
  label: LabelText;
  value: string;
  span?: number;
}

export interface DescriptionsWidgetConfig {
  size: 'mini' | 'small' | 'medium' | 'large';
  column: number;
  data: DescriptionData[];
}

export interface TextAreaWidgetConfig {
  placeholder?: string;
  maxLength?: number;
  allowClear?: boolean;
  autoSize?: boolean;
}

export interface MarkdownWidgetConfig {
  markdown: string;
}

export async function getFileContentFromFileSelector(file: File) {
  return file.arrayBuffer();
}
