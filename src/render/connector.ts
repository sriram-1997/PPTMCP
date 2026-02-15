import type { ArrowHead, BBox, ConnectorElement, PreparedConnectorElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { normalizeColor } from "./utils/color.js";
import { EPSILON_INCHES, ptToIn } from "./utils/units.js";
import { isPointInside, resolveRegionAnchor } from "./slide.js";

const DEFAULT_CONNECTOR_WIDTH_PT = 1;
const ARROW_MIN_LEN_PT = 6;
const ARROW_MAX_LEN_PT = 14;
const ARROW_MIN_WIDTH_PT = 4;
const ARROW_MAX_WIDTH_PT = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildCenteredArrowHead(args: {
  tip: { x: number; y: number };
  direction: { x: number; y: number };
  lengthIn: number;
  widthIn: number;
  color: string;
}): ArrowHead {
  const halfWidth = args.widthIn / 2;
  const baseCenter = {
    x: args.tip.x - args.direction.x * args.lengthIn,
    y: args.tip.y - args.direction.y * args.lengthIn,
  };
  const perp = { x: -args.direction.y, y: args.direction.x };
  const cornerA = {
    x: baseCenter.x + perp.x * halfWidth,
    y: baseCenter.y + perp.y * halfWidth,
  };
  const cornerB = {
    x: baseCenter.x - perp.x * halfWidth,
    y: baseCenter.y - perp.y * halfWidth,
  };
  const minX = Math.min(args.tip.x, cornerA.x, cornerB.x);
  const maxX = Math.max(args.tip.x, cornerA.x, cornerB.x);
  const minY = Math.min(args.tip.y, cornerA.y, cornerB.y);
  const maxY = Math.max(args.tip.y, cornerA.y, cornerB.y);

  return {
    bbox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    points: [
      { x: args.tip.x - minX, y: args.tip.y - minY, moveTo: true },
      { x: cornerA.x - minX, y: cornerA.y - minY },
      { x: cornerB.x - minX, y: cornerB.y - minY },
      { close: true },
    ],
    color: args.color,
  };
}

export function lineRectFromPoints(start: { x: number; y: number }, end: { x: number; y: number }): {
  rect: BBox;
  dx: number;
  dy: number;
  flipV: boolean;
  flipH: boolean;
} {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(dx);
  const h = Math.abs(dy);
  const startIsLeft = start.x === x;
  const startIsTop = start.y === y;
  return {
    rect: { x, y, width: w, height: h },
    dx,
    dy,
    flipV: !startIsTop,
    flipH: !startIsLeft,
  };
}

export function normalizeLineRect(
  start: { x: number; y: number },
  end: { x: number; y: number }
): { rect: BBox; error: string | null; dx: number; dy: number; flipV: boolean; flipH: boolean } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(dx);
  const h = Math.abs(dy);
  const startIsLeft = start.x === x;
  const startIsTop = start.y === y;
  const flipH = !startIsLeft;
  const flipV = !startIsTop;

  if (w === 0 && h === 0) {
    return { rect: { x, y, width: w, height: h }, error: "line_zero_length", dx, dy, flipV, flipH };
  }
  if (Math.max(w, h) < 0.01) {
    return { rect: { x, y, width: w, height: h }, error: "line_too_short", dx, dy, flipV, flipH };
  }
  return { rect: { x, y, width: w, height: h }, error: null, dx, dy, flipV, flipH };
}

export function computeLineWithArrowheads(args: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  widthPt: number;
  color: string;
  startArrow: "none" | "triangle";
  endArrow: "none" | "triangle";
  warnings?: string[];
  warnPrefix?: string;
}): {
  lineStart: { x: number; y: number };
  lineEnd: { x: number; y: number };
  arrowHeads: ArrowHead[];
} {
  const dx = args.end.x - args.start.x;
  const dy = args.end.y - args.start.y;
  const lineLength = Math.hypot(dx, dy);
  if (!Number.isFinite(lineLength) || lineLength === 0) {
    return { lineStart: args.start, lineEnd: args.end, arrowHeads: [] };
  }

  const unit = { x: dx / lineLength, y: dy / lineLength };
  const headLenPt = clamp(Math.round(4 * args.widthPt), ARROW_MIN_LEN_PT, ARROW_MAX_LEN_PT);
  const headWidthPt = clamp(Math.round(2.5 * args.widthPt), ARROW_MIN_WIDTH_PT, ARROW_MAX_WIDTH_PT);
  let headLen = ptToIn(headLenPt);
  let headWidth = ptToIn(headWidthPt);

  const endArrow = args.endArrow === "triangle";
  const startArrow = args.startArrow === "triangle";

  if (startArrow && endArrow && args.warnings && args.warnPrefix) {
    args.warnings.push(`${args.warnPrefix} arrowhead_double_requested`);
  }

  const arrowHeads: ArrowHead[] = [];

  if (endArrow) {
    const maxLen = Math.max(lineLength - EPSILON_INCHES, 0);
    if (headLen > maxLen) {
      const scale = maxLen > 0 ? maxLen / headLen : 0;
      headLen *= scale;
      headWidth *= scale;
      if (args.warnings && args.warnPrefix) {
        args.warnings.push(`${args.warnPrefix} arrowhead_scaled`);
      }
    }
    arrowHeads.push(
      buildCenteredArrowHead({
        tip: args.end,
        direction: unit,
        lengthIn: headLen,
        widthIn: headWidth,
        color: args.color,
      })
    );
  } else if (startArrow) {
    arrowHeads.push(
      buildCenteredArrowHead({
        tip: args.start,
        direction: { x: -unit.x, y: -unit.y },
        lengthIn: headLen,
        widthIn: headWidth,
        color: args.color,
      })
    );
  }

  const lineStart = args.start;
  const lineEnd = endArrow ? { x: args.end.x - unit.x * headLen, y: args.end.y - unit.y * headLen } : args.end;

  return { lineStart, lineEnd, arrowHeads };
}

export function renderArrowHeads(slide: any, shapeType: any, arrowHeads: ArrowHead[]): void {
  for (const arrow of arrowHeads) {
    slide.addShape(shapeType.custGeom, {
      x: arrow.bbox.x,
      y: arrow.bbox.y,
      w: arrow.bbox.width,
      h: arrow.bbox.height,
      points: arrow.points,
      fill: { color: arrow.color },
      line: { color: arrow.color, width: 0 },
    });
  }
}

export function prepareConnectorElement(args: {
  slide: Slide;
  slideIndex: number;
  element: ConnectorElement;
  elementIndex: number;
  z: number;
  order: number;
  id: string;
  bbox: BBox;
  theme: ConcreteTheme;
  hardErrors: string[];
}): PreparedConnectorElement {
  const defaults = resolveElementStyleDefaults(args.element, args.theme);
  const start = resolveRegionAnchor({
    anchor: args.element.start,
    regions: args.slide.regions,
    grid: args.slide.grid,
  });
  const end = resolveRegionAnchor({
    anchor: args.element.end,
    regions: args.slide.regions,
    grid: args.slide.grid,
  });

  const widthPt = args.element.style?.widthPt ?? defaults.strokeStyle?.widthPt ?? args.theme.strokeScale.normal ?? DEFAULT_CONNECTOR_WIDTH_PT;
  if (!Number.isFinite(widthPt) || widthPt <= 0) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: line_width_invalid`
    );
  }

  if (!isPointInside(args.bbox, start) || !isPointInside(args.bbox, end)) {
    args.hardErrors.push(
      `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: connector_outside_region`
    );
  }

  const defaultColor = defaults.strokeStyle?.color ?? args.theme.connector.stroke;
  const startArrow = args.element.style?.startArrow ?? defaults.strokeStyle?.startArrow ?? "none";
  const endArrow = args.element.style?.endArrow ?? defaults.strokeStyle?.endArrow ?? "none";
  const color = normalizeColor(args.element.style?.color, defaultColor);
  const baseRect = lineRectFromPoints(start, end);

  return {
    kind: "connector",
    z: args.z,
    order: args.order,
    id: args.id,
    region: args.element.region,
    variant: args.element.variant,
    start,
    end,
    lineStart: start,
    lineEnd: end,
    style: {
      widthPt,
      color,
      startArrow,
      endArrow,
    },
    arrowHeads: [],
    lineRect: baseRect.rect,
    lineFlipV: baseRect.flipV,
    lineFlipH: baseRect.flipH,
  };
}

export function renderConnectorElement(slide: any, shapeType: any, element: PreparedConnectorElement): void {
  slide.addShape(shapeType.line, {
    x: element.lineRect.x,
    y: element.lineRect.y,
    w: element.lineRect.width,
    h: element.lineRect.height,
    flipV: element.lineFlipV,
    flipH: element.lineFlipH,
    line: {
      color: element.style.color,
      width: element.style.widthPt,
    },
  });
  if (element.arrowHeads && element.arrowHeads.length > 0) {
    renderArrowHeads(slide, shapeType, element.arrowHeads);
  }
}
