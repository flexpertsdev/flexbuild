export interface BuilderState {
  viewMode: 'design' | 'preview' | 'code';
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  canvasSize: CanvasSize;
  history: HistoryState;
  dragState?: DragState;
}

export interface CanvasSize {
  width: number;
  height: number;
  device: DeviceType;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'custom';

export interface DevicePreset {
  name: string;
  type: DeviceType;
  width: number;
  height: number;
  scale: number;
}

export interface HistoryState {
  past: BuilderSnapshot[];
  present: BuilderSnapshot;
  future: BuilderSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
}

export interface BuilderSnapshot {
  timestamp: number;
  state: any;
}

export interface DragState {
  isDragging: boolean;
  draggedItem: DraggedItem | null;
  dropTarget: DropTarget | null;
  dragOffset: { x: number; y: number };
}

export interface DraggedItem {
  type: 'new_component' | 'existing_component';
  componentType?: string;
  componentId?: string;
  source: 'palette' | 'canvas';
}

export interface DropTarget {
  targetId: string;
  targetType: 'screen' | 'container' | 'before' | 'after';
  position: { x: number; y: number };
  isValid: boolean;
}

export interface ComponentDefinition {
  type: string;
  category: ComponentCategory;
  displayName: string;
  description: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultStyles: Record<string, any>;
  allowedChildren?: string[];
  allowedParents?: string[];
  resizable: boolean;
  draggable: boolean;
  duplicatable: boolean;
  deletable: boolean;
}

export type ComponentCategory = 
  | 'layout'
  | 'basic'
  | 'form'
  | 'data'
  | 'navigation'
  | 'feedback'
  | 'media'
  | 'advanced';

export interface PropertyPanel {
  component: Component;
  properties: PropertyGroup[];
  styleGroups: StyleGroup[];
  dataBindings: DataBindingOption[];
  actions: ActionOption[];
}

export interface PropertyGroup {
  name: string;
  icon: string;
  properties: Property[];
  collapsed: boolean;
}

export interface Property {
  key: string;
  label: string;
  type: PropertyType;
  value: any;
  defaultValue?: any;
  options?: PropertyOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helpText?: string;
  validation?: (value: any) => string | null;
}

export type PropertyType = 
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'spacing'
  | 'typography'
  | 'icon'
  | 'image'
  | 'code'
  | 'json';

export interface PropertyOption {
  label: string;
  value: any;
  icon?: string;
}

export interface StyleGroup {
  name: string;
  icon: string;
  styles: StyleProperty[];
  collapsed: boolean;
}

export interface StyleProperty extends Property {
  cssProperty: string;
  unit?: string;
  responsive: boolean;
}

export interface DataBindingOption {
  source: 'static' | 'dynamic' | 'api' | 'store';
  label: string;
  fields?: DataField[];
  endpoints?: APIEndpoint[];
}

export interface ActionOption {
  type: string;
  label: string;
  icon: string;
  parameters: ActionParameter[];
}

export interface ActionParameter {
  key: string;
  label: string;
  type: PropertyType;
  required: boolean;
  defaultValue?: any;
  options?: PropertyOption[];
}

export interface DesignSystem {
  id: string;
  projectId: string;
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  borders: BorderSystem;
  shadows: ShadowSystem;
  animations: AnimationSystem;
  componentStyles: ComponentStyle[];
  version: number;
  generatedCSS?: string;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  success: string;
  warning: string;
  error: string;
  info: string;
  custom: Record<string, string>;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface TypographyScale {
  fontFamilies: FontFamily[];
  fontSizes: FontSize[];
  fontWeights: FontWeight[];
  lineHeights: LineHeight[];
  letterSpacings: LetterSpacing[];
}

export interface FontFamily {
  name: string;
  fallback: string;
  type: 'sans-serif' | 'serif' | 'monospace' | 'custom';
}

export interface FontSize {
  name: string;
  size: number;
  unit: 'px' | 'rem' | 'em';
}

export interface FontWeight {
  name: string;
  value: number;
}

export interface LineHeight {
  name: string;
  value: number;
}

export interface LetterSpacing {
  name: string;
  value: number;
  unit: 'px' | 'em';
}

export interface SpacingScale {
  base: number;
  unit: 'px' | 'rem';
  scale: number[];
}

export interface BorderSystem {
  widths: number[];
  styles: string[];
  radii: number[];
}

export interface ShadowSystem {
  shadows: Shadow[];
}

export interface Shadow {
  name: string;
  value: string;
}

export interface AnimationSystem {
  durations: Duration[];
  easings: Easing[];
  animations: Animation[];
}

export interface Duration {
  name: string;
  value: number;
}

export interface Easing {
  name: string;
  value: string;
}

export interface Animation {
  name: string;
  keyframes: string;
  duration: string;
  easing: string;
}

export interface ComponentStyle {
  componentType: string;
  baseStyles: Record<string, any>;
  variants: Record<string, Record<string, any>>;
  states: Record<string, Record<string, any>>;
  responsive: Record<string, Record<string, any>>;
}

// Import necessary types
import type { Component, DataField, APIEndpoint } from './project';