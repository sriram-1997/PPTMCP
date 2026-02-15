import type { BBox, EdgeElement, PreparedEdgeElement, Slide } from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { normalizeColor } from "./utils/color.js";
import { isPointInside, nearestPointOnBoxPerimeter } from "./slide.js";
import { lineRectFromPoints, renderArrowHeads } from "./connector.js";

const DEFAULT_EDGE_WIDTH_PT = 1;

function resolveStrokeWidth(slot: EdgeElement["strokeSlot"] | undefined, theme: ConcreteTheme): number | null {
  if (!slot) {
    return null;
  }
  if (slot === "stroke.thin") {
    return theme.strokeScale.thin;
  }
  if (slot === "stroke.normal") {
    return theme.strokeScale.normal;
  }
  if (slot === "stroke.heavy") {
    return theme.strokeScale.heavy;
  }
  return null;
}

export function prepareEdgeElement(args: {
  slide: Slide;
  slideIndex: number;
  element: EdgeElement;
  elementIndex: number;
  z: number;
  order: number;
  id: string;
  bbox: BBox;
  theme: ConcreteTheme;
  nodeBBoxes: Map<string, BBox>;
  hardErrors: string[];
}): PreparedEdgeElement {
  const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
  const startBox = args.nodeBBoxes.get(args.element.startNode);
  const endBox = args.nodeBBoxes.get(args.element.endNode);
  if (!startBox) {
    args.hardErrors.push(`${prefix} edge_node_not_found (${args.element.startNode})`);
  }
  if (!endBox) {
    args.hardErrors.push(`${prefix} edge_node_not_found (${args.element.endNode})`);
  }

  const startCenter = startBox
    ? { x: startBox.x + startBox.width / 2, y: startBox.y + startBox.height / 2 }
    : { x: args.bbox.x, y: args.bbox.y };
  const endCenter = endBox
    ? { x: endBox.x + endBox.width / 2, y: endBox.y + endBox.height / 2 }
    : { x: args.bbox.x + args.bbox.width, y: args.bbox.y + args.bbox.height };

  const start = startBox ? nearestPointOnBoxPerimeter(startBox, endCenter) : startCenter;
  const end = endBox ? nearestPointOnBoxPerimeter(endBox, startCenter) : endCenter;

  if (!isPointInside(args.bbox, start) || !isPointInside(args.bbox, end)) {
    args.hardErrors.push(`${prefix} edge_outside_region`);
  }

  const defaults = resolveElementStyleDefaults({ type: "edge", variant: args.element.variant }, args.theme);
  const widthFromSlot = resolveStrokeWidth(args.element.strokeSlot, args.theme);
  if (args.element.strokeSlot && widthFromSlot === null) {
    args.hardErrors.push(`${prefix} edge_stroke_invalid`);
  }
  const widthPt =
    widthFromSlot ?? defaults.strokeStyle?.widthPt ?? args.theme.strokeScale.normal ?? DEFAULT_EDGE_WIDTH_PT;
  if (!Number.isFinite(widthPt) || widthPt <= 0) {
    args.hardErrors.push(`${prefix} line_width_invalid`);
  }

  const color = normalizeColor(defaults.strokeStyle?.color, args.theme.connector.stroke);
  const endArrow = args.element.arrow === "triangle" ? "triangle" : "none";
  const baseRect = lineRectFromPoints(start, end);

  return {
    kind: "edge",
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
      endArrow,
    },
    arrowHeads: [],
    lineRect: baseRect.rect,
    lineFlipV: baseRect.flipV,
    lineFlipH: baseRect.flipH,
  };
}

export function renderEdgeElement(slide: any, shapeType: any, element: PreparedEdgeElement): void {
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
