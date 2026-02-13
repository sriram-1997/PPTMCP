
export type FitMode = "none" | "shrink";
export type ValidationAction = "none" | "shrink" | "truncate" | "error";
export type AnchorPoint = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" | "center";

export interface GridConfig {
  cols: number;
  rows: number;
  gutter: number;
}

export interface RegionConfig {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export interface Regions {
  [regionName: string]: RegionConfig;
}

export interface TextStyle {
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  fit?: FitMode;
  minFont?: number;
  paddingPt?: number;
  lineHeight?: number;
}

export interface TextElement {
  type: "text";
  region: string;
  content: string;
  style?: TextStyle;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export interface TableCell {
  text?: string;
  style?: {
    color?: string;
    bold?: boolean;
  };
}

export interface TableContent {
  headers: string[];
  rows: (string | TableCell)[][];
}

export interface TableStyle {
  borderColor?: string;
  borderWidth?: number;
  headerColor?: string;
  headerTextColor?: string;
  fit?: FitMode;
  minFont?: number;
  fontSize?: number;
  headerFontSize?: number;
  cellPaddingPt?: number;
  lineHeight?: number;
}

export interface TableElement {
  type: "table";
  region: string;
  content: TableContent;
  style?: TableStyle;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export interface ChartDataPoint {
  [0]: string; // category label
  [1]: number; // value
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
}

export interface ChartContent {
  chartType: "column" | string; // v0: only column supported
  title?: string;
  dataSeries: ChartSeries[];
}

export interface ChartElement {
  type: "chart";
  region: string;
  content: ChartContent;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export interface RegionAnchor {
  type: "region";
  targetRegion: string;
  point: AnchorPoint;
  dxPt?: number;
  dyPt?: number;
}

export interface CalloutBox {
  wIn: number;
  hIn: number;
  placement: "auto" | "ne" | "nw" | "se" | "sw" | "n" | "s" | "e" | "w";
  paddingPt?: number;
}

export interface CalloutText {
  value: string;
  style?: TextStyle;
}

export interface CalloutLeader {
  style: "line";
  endCap?: "none";
  startArrow?: "none" | "triangle";
  endArrow?: "none" | "triangle";
}

export interface CalloutElement {
  type: "callout";
  id?: string;
  region: string;
  anchor: RegionAnchor;
  box: CalloutBox;
  text: CalloutText;
  leader?: CalloutLeader;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export interface ConnectorStyle {
  widthPt?: number;
  color?: string;
  startArrow?: "none" | "triangle";
  endArrow?: "none" | "triangle";
}

export interface ConnectorElement {
  type: "connector";
  id?: string;
  region: string;
  start: RegionAnchor;
  end: RegionAnchor;
  style?: ConnectorStyle;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export interface ImageStyle {
  borderColor?: string;
  borderWidthPt?: number;
}

export interface ImageElement {
  type: "image";
  id?: string;
  region: string;
  src: string;
  fit: "contain" | "cover";
  style?: ImageStyle;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export type Element = TextElement | TableElement | ChartElement | CalloutElement | ConnectorElement | ImageElement;

export interface Slide {
  id: string;
  title: string;
  grid: GridConfig;
  regions: Regions;
  elements: Element[];
}

export interface SlideProgramSpec {
  title: string;
  metadata?: {
    author?: string;
    created?: string;
  };
  theme?: string | { name?: string; overrides?: Record<string, unknown> };
  styleTokens?: Record<string, unknown>;
  slides: Slide[];
}

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ValidationReportEntry {
  slide_index: number;
  slide_id: string;
  slide_title: string;
  element_index: number;
  element_type: "text" | "table";
  region: string;
  overflow: {
    width: boolean;
    height: boolean;
    required_width_in: number;
    required_height_in: number;
    available_width_in: number;
    available_height_in: number;
  };
  min_font: number;
  applied_font: number;
  action_taken: ValidationAction;
  details: string;
}

export interface RenderResult {
  output_path: string;
  slides_rendered: number;
  warnings: string[];
  success: boolean;
  validation_report: ValidationReportEntry[];
  integrity_debug?: IntegrityDebugReport;
}

export interface IntegrityWarning {
  code: string;
  message: string;
}

export interface IntegrityEntryBase {
  render_index: number;
  id: string;
  type: string;
  z: number;
  region: string;
  region_rect_in: { x: number; y: number; w: number; h: number };
}

export interface IntegrityReportSlide {
  slide_index: number;
  slide_id: string;
  render_list: (IntegrityEntryBase & Record<string, unknown>)[];
  warnings: IntegrityWarning[];
}

export interface IntegrityDebugReport {
  summary: {
    charts: number;
    shapes_lines: number;
    text_boxes: number;
    tables: number;
  };
  slides: IntegrityReportSlide[];
}

export interface PreparedTextElement {
  kind: "text";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  bbox: BBox;
  content: string;
  fontSize: number;
  style: {
    bold: boolean;
    italic: boolean;
    color: string;
    align: "left" | "center" | "right" | "justify";
    valign: "top" | "middle" | "bottom";
    paddingPt: number;
    lineHeight: number;
  };
}

export interface PreparedTableCell {
  text: string;
  options: {
    bold?: boolean;
    color?: string;
    fill?: { color: string };
    fontSize?: number;
    margin?: number;
  };
}

export interface PreparedTableElement {
  kind: "table";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  bbox: BBox;
  rows: PreparedTableCell[][];
  style: {
    borderColor: string;
    borderWidth: number;
    rowHeightsInches: number[];
  };
}

export interface PreparedChartElement {
  kind: "chart";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  bbox: BBox;
  chartType: string;
  title?: string;
  categories: string[];
  seriesData: { name: string; values: number[] }[];
}

export interface PreparedCalloutElement {
  kind: "callout";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  box: BBox;
  boxStyle?: { fill: string; border: string; borderWidth: number };
  text: PreparedTextElement;
  leader?: { start: { x: number; y: number }; end: { x: number; y: number } };
  leaderStyle?: { color: string; widthPt: number; startArrow: "none" | "triangle"; endArrow: "none" | "triangle" };
  leaderRect?: BBox;
  leaderFlipV?: boolean;
  leaderFlipH?: boolean;
}

export interface PreparedConnectorElement {
  kind: "connector";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  start: { x: number; y: number };
  end: { x: number; y: number };
  style: { widthPt: number; color: string; startArrow: "none" | "triangle"; endArrow: "none" | "triangle" };
  lineRect: BBox;
  lineFlipV: boolean;
  lineFlipH: boolean;
}

export type PreparedElement =
  | PreparedTextElement
  | PreparedTableElement
  | PreparedChartElement
  | PreparedCalloutElement
  | PreparedConnectorElement
  | PreparedImageElement;

export interface PreparedSlide {
  elements: PreparedElement[];
}

export interface PreparedImageElement {
  kind: "image";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  bbox: BBox;
  src: string;
  fit: "contain" | "cover";
  style: { borderColor: string; borderWidthPt: number; fillColor?: string };
}

