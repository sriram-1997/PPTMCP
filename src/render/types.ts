
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
  __rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

export type ListBulletStyle = "dot" | "number" | "icon" | "none";
export type FlowLayoutProfile = "flow.chevron" | "flow.card";

export interface ListBulletSpec {
  size?: "sm" | "md";
  gap?: number;
  color?: "text" | "muted" | "primary";
  icon?: string;
}

export interface ListIndentSpec {
  left?: number;
  hanging?: number;
}

export interface ListItemSpec {
  text: string;
}

export interface ListSpec {
  style?: ListBulletStyle;
  bullet?: ListBulletSpec;
  indent?: ListIndentSpec;
  lineGap?: number;
  items: ListItemSpec[];
}

export interface ListElement extends ListSpec {
  type: "list";
  region: string;
  z?: number;
}

export interface CardStyleAccent {
  edge: "left" | "top" | "none";
  color?: "accent";
  width?: number;
}

export interface CardStyleSpec {
  bg?: "background" | "surface" | "elevated" | "accent";
  border?: "default" | "subtle" | "none";
  radius?: "sm" | "md" | "lg";
  padding?: "sm" | "md" | "lg";
  // Internal canonicalization input (resolved to paddingPt before validation/rendering).
  paddingSlot?: number;
  paddingPt?: number;
  shadow?: "none" | "sm";
  accent?: CardStyleAccent;
}

export interface CardHeaderSpec {
  title: string;
  subtitle?: string;
  icon?: string;
}

export interface CardFooterSpec {
  strip?: boolean;
  label?: string;
  text?: string;
}

export interface CardElement {
  type: "card";
  region: string;
  variant?: "surface" | "elevated" | "accent";
  layoutProfile?: FlowLayoutProfile;
  style?: CardStyleSpec;
  header?: CardHeaderSpec;
  body: Array<ListSpec & { type: "list" }>;
  footer?: CardFooterSpec;
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
  emphasisColumn?: number;
  rowStriping?: boolean;
  columnAlign?: Array<"left" | "center" | "right">;
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

export interface ChartOverlays {
  averageLine?: boolean;
  trendLine?: boolean;
}

export interface ChartElement {
  type: "chart";
  region: string;
  content?: ChartContent;
  chartType?: "line" | "column";
  data?: {
    labels: string[];
    series: Array<{ name: string; values: number[] }>;
  };
  options?: {
    showGrid?: boolean;
    showMarkers?: boolean;
    smooth?: boolean;
    yAxisZero?: boolean;
  };
  overlays?: ChartOverlays;
  title?: string;
  variant?: "surface" | "elevated" | "accent";
  z?: number;
}

export interface ChevronFlowStep {
  label: string;
  icon?: string;
}

export interface ChevronFlowElement {
  type: "chevron_flow";
  region: string;
  steps: ChevronFlowStep[];
  orientation?: "horizontal";
  layoutProfile?: FlowLayoutProfile;
  z?: number;
}

export interface NodeElement {
  type: "node";
  id: string;
  region: string;
  shape: "rounded-rect";
  variant?: "surface" | "elevated" | "accent";
  icon?: string;
  label: string;
  paddingToken?: number;
  z?: number;
}

export interface EdgeElement {
  type: "edge";
  id?: string;
  region: string;
  startNode: string;
  endNode: string;
  arrow?: "none" | "triangle";
  strokeSlot?: "stroke.thin" | "stroke.normal" | "stroke.heavy";
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

export interface CalloutContent {
  icon?: string;
  text: string;
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
  text?: CalloutText;
  content?: CalloutContent;
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
  opacity?: number;
  crop?: { left?: number; right?: number; top?: number; bottom?: number };
  overlaySurfaceSlot?: "surface.background" | "surface.surface" | "surface.elevated" | "surface.accent";
  overlayOpacity?: number;
  borderRadiusPt?: number;
  z?: number;
}

export interface IconElement {
  type: "icon";
  id?: string;
  region: string;
  name: string;
  sizeToken: number;
  colorSlot: "text.title" | "text.subtitle" | "text.body" | "text.caption";
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  z?: number;
}

export type Element =
  | TextElement
  | ListElement
  | CardElement
  | TableElement
  | ChartElement
  | ChevronFlowElement
  | NodeElement
  | EdgeElement
  | CalloutElement
  | ConnectorElement
  | ImageElement
  | IconElement;

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
  render_metrics?: {
    total_slides: number;
    total_elements: number;
    overflow_count: number;
    validation_failures: number;
    render_time_ms: number;
  };
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
  fontFace: string;
  fontSize: number;
  boxStyle?: { fill: string; border: string; borderWidth: number };
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
    align?: "left" | "center" | "right";
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
  options?: {
    showGrid: boolean;
    showMarkers: boolean;
    smooth: boolean;
    yAxisZero: boolean;
  };
  overlays?: PreparedChartOverlayLine[];
}

export interface PreparedChevronStep {
  bbox: BBox;
  points: Array<{ x: number; y: number; moveTo?: boolean } | { close: true }>;
  fill: string;
  stroke: string;
  text: {
    value: string;
    bbox: BBox;
    fontFace: string;
    fontSize: number;
    bold: boolean;
    color: string;
  };
  icon?: { bbox: BBox; data: string };
  textOverflow?: boolean;
}

export interface PreparedChevronFlowElement {
  kind: "chevron_flow";
  z: number;
  order: number;
  id: string;
  region: string;
  bbox: BBox;
  steps: PreparedChevronStep[];
  layoutProfile?: FlowLayoutProfile;
  metrics?: {
    groupBBox: BBox;
    notchIn: number;
    tipIn: number;
    gapIn: number;
    stepCount: number;
  };
}

export interface PreparedChartOverlayLine {
  kind: "average" | "trend";
  start: { x: number; y: number };
  end: { x: number; y: number };
  style: { color: string; widthPt: number; dash?: "solid" | "dash" };
}

export interface PreparedListTextRun {
  text: string;
  bold: boolean;
}

export interface PreparedListLine {
  runs: PreparedListTextRun[];
}

export interface PreparedListBullet {
  type: "dot" | "number" | "icon";
  bbox: BBox;
  color: string;
  text?: string;
  data?: string;
}

export interface PreparedListItem {
  textBox: BBox;
  lines: PreparedListLine[];
  bullet?: PreparedListBullet;
}

export interface PreparedListLayout {
  bbox: BBox;
  items: PreparedListItem[];
  textStyle: {
    fontFace: string;
    fontSize: number;
    color: string;
    lineHeight: number;
  };
  bulletStyle: {
    style: ListBulletStyle;
    sizePt: number;
    gapPt: number;
    color: string;
  };
  totalHeightPt: number;
  metrics?: {
    textStartX: number;
    textBoxX: number;
    hangingPt: number;
    leftPt: number;
    numberedInline: boolean;
  };
}

export interface PreparedListElement extends PreparedListLayout {
  kind: "list";
  z: number;
  order: number;
  id: string;
  region: string;
}

export interface PreparedCardElement {
  kind: "card";
  z: number;
  order: number;
  id: string;
  region: string;
  bbox: BBox;
  layoutProfile?: FlowLayoutProfile;
  style: {
    fill: string;
    border: string;
    borderWidth: number;
    radius: number;
    shadow?: {
      type: "outer" | "inner" | "none";
      opacity?: number;
      blur?: number;
      angle?: number;
      offset?: number;
      color?: string;
    };
  };
  accent?: {
    edge: "left" | "top";
    bbox: BBox;
    color: string;
  };
  header?: {
    title: string;
    subtitle?: string;
    titleBox: BBox;
    subtitleBox?: BBox;
    titleFont: { face: string; size: number; bold: boolean; color: string };
    subtitleFont?: { face: string; size: number; bold: boolean; color: string };
    iconBox?: BBox;
    iconData?: string;
  };
  body: PreparedListLayout[];
  footer?: {
    strip: boolean;
    bbox: BBox;
    label?: string;
    text?: string;
    labelFont?: { face: string; size: number; bold: boolean; color: string };
    textFont?: { face: string; size: number; bold: boolean; color: string };
    labelBox?: BBox;
    textBox?: BBox;
    stripFill?: string;
  };
  metrics?: {
    innerHeightPt: number;
    contentHeightPt: number;
    bodyUsedPt: number;
  };
}

export interface PreparedCalloutElement {
  kind: "callout";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  anchor: { x: number; y: number };
  box: BBox;
  boxStyle?: { fill: string; border: string; borderWidth: number };
  icon?: { bbox: BBox; data: string };
  text: PreparedTextElement;
  leader?: { start: { x: number; y: number }; end: { x: number; y: number } };
  leaderStyle?: { color: string; widthPt: number; startArrow: "none" | "triangle"; endArrow: "none" | "triangle" };
  leaderLineStart?: { x: number; y: number };
  leaderLineEnd?: { x: number; y: number };
  leaderArrowHeads?: ArrowHead[];
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
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
  style: { widthPt: number; color: string; startArrow: "none" | "triangle"; endArrow: "none" | "triangle" };
  arrowHeads?: ArrowHead[];
  customArrowheads?: boolean;
  arrowSizePt?: number;
  lineRect: BBox;
  lineFlipV: boolean;
  lineFlipH: boolean;
}

export type PreparedElement =
  | PreparedTextElement
  | PreparedListElement
  | PreparedCardElement
  | PreparedTableElement
  | PreparedChartElement
  | PreparedChevronFlowElement
  | PreparedNodeElement
  | PreparedEdgeElement
  | PreparedCalloutElement
  | PreparedConnectorElement
  | PreparedImageElement
  | PreparedIconElement;

export interface PreparedSlide {
  elements: PreparedElement[];
  diagramRegionId?: string;
  diagramRegionBBox?: BBox;
}

export interface ArrowHead {
  bbox: BBox;
  points: Array<{ x: number; y: number; moveTo?: boolean } | { close: true }>;
  color: string;
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
  opacity: number;
  crop?: { left: number; right: number; top: number; bottom: number };
  overlay?: { color: string; opacity: number };
  borderRadiusPt: number;
  data?: string;
  style: { borderColor: string; borderWidthPt: number; fillColor?: string };
}

export interface PreparedIconElement {
  kind: "icon";
  z: number;
  order: number;
  id: string;
  region: string;
  bbox: BBox;
  data: string;
  boxStyle?: { fill: string; border: string; borderWidth: number };
}

export interface PreparedNodeElement {
  kind: "node";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  bbox: BBox;
  shape: "rounded-rect";
  radius: number;
  style: { fill: string; border: string; borderWidth: number };
  icon?: { bbox: BBox; data: string };
  label: {
    text: string;
    bbox: BBox;
    fontFace: string;
    fontSize: number;
    bold: boolean;
    color: string;
  };
  metrics?: {
    innerHeightPt: number;
    contentHeightPt: number;
  };
}

export interface PreparedEdgeElement {
  kind: "edge";
  z: number;
  order: number;
  id: string;
  region: string;
  variant?: "surface" | "elevated" | "accent";
  start: { x: number; y: number };
  end: { x: number; y: number };
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
  style: { widthPt: number; color: string; endArrow: "none" | "triangle" };
  arrowHeads?: ArrowHead[];
  lineRect: BBox;
  lineFlipV: boolean;
  lineFlipH: boolean;
  metrics?: {
    renderMode: "unified" | "split";
  };
}

