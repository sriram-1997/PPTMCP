import type { BBox, PreparedCalloutElement, PreparedConnectorElement, PreparedEdgeElement, PreparedSlide } from "./types.js";
import { computeLineWithArrowheads, lineRectFromPoints, normalizeLineRect } from "./connector.js";
import { EPSILON_INCHES } from "./utils/units.js";
import { nearestPointOnBoxPerimeter } from "./slide.js";

const GEOMETRY_ROUND_FACTOR = 10000;

function roundGeom(value: number): number {
  return Math.round(value * GEOMETRY_ROUND_FACTOR) / GEOMETRY_ROUND_FACTOR;
}

function roundPoint(point: { x: number; y: number }): { x: number; y: number } {
  return { x: roundGeom(point.x), y: roundGeom(point.y) };
}

function roundBox(box: BBox): BBox {
  return {
    x: roundGeom(box.x),
    y: roundGeom(box.y),
    width: roundGeom(box.width),
    height: roundGeom(box.height),
  };
}

function unionBoxes(current: BBox | null, next: BBox): BBox {
  if (!current) {
    return { ...next };
  }
  const x0 = Math.min(current.x, next.x);
  const y0 = Math.min(current.y, next.y);
  const x1 = Math.max(current.x + current.width, next.x + next.width);
  const y1 = Math.max(current.y + current.height, next.y + next.height);
  return {
    x: x0,
    y: y0,
    width: x1 - x0,
    height: y1 - y0,
  };
}

function translatePoint(point: { x: number; y: number }, delta: { x: number; y: number }): { x: number; y: number } {
  return roundPoint({ x: point.x + delta.x, y: point.y + delta.y });
}

function translateBox(box: BBox, delta: { x: number; y: number }): BBox {
  return roundBox({
    x: box.x + delta.x,
    y: box.y + delta.y,
    width: box.width,
    height: box.height,
  });
}

function translateArrowHead(arrow: any, delta: { x: number; y: number }): any {
  return {
    ...arrow,
    bbox: translateBox(arrow.bbox, delta),
    points: arrow.points.map((point: any) => {
      if ("close" in point) {
        return point;
      }
      return { ...point, x: roundGeom(point.x + delta.x), y: roundGeom(point.y + delta.y) };
    }),
  };
}

function roundArrowHead(arrow: any): any {
  return {
    ...arrow,
    bbox: roundBox(arrow.bbox),
    points: arrow.points.map((point: any) => {
      if ("close" in point) {
        return point;
      }
      return { ...point, x: roundGeom(point.x), y: roundGeom(point.y) };
    }),
  };
}

function intersectRayWithBox(anchor: { x: number; y: number }, box: BBox): { x: number; y: number } {
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const dir = { x: center.x - anchor.x, y: center.y - anchor.y };
  if (Math.abs(dir.x) < EPSILON_INCHES && Math.abs(dir.y) < EPSILON_INCHES) {
    return nearestPointOnBoxPerimeter(box, anchor);
  }

  const x0 = box.x;
  const x1 = box.x + box.width;
  const y0 = box.y;
  const y1 = box.y + box.height;

  let bestT = Number.POSITIVE_INFINITY;
  let hit: { x: number; y: number } | null = null;

  if (Math.abs(dir.x) >= EPSILON_INCHES) {
    const tLeft = (x0 - anchor.x) / dir.x;
    const yLeft = anchor.y + tLeft * dir.y;
    if (tLeft >= 0 && yLeft >= y0 - EPSILON_INCHES && yLeft <= y1 + EPSILON_INCHES && tLeft < bestT) {
      bestT = tLeft;
      hit = { x: x0, y: yLeft };
    }
    const tRight = (x1 - anchor.x) / dir.x;
    const yRight = anchor.y + tRight * dir.y;
    if (tRight >= 0 && yRight >= y0 - EPSILON_INCHES && yRight <= y1 + EPSILON_INCHES && tRight < bestT) {
      bestT = tRight;
      hit = { x: x1, y: yRight };
    }
  }

  if (Math.abs(dir.y) >= EPSILON_INCHES) {
    const tTop = (y0 - anchor.y) / dir.y;
    const xTop = anchor.x + tTop * dir.x;
    if (tTop >= 0 && xTop >= x0 - EPSILON_INCHES && xTop <= x1 + EPSILON_INCHES && tTop < bestT) {
      bestT = tTop;
      hit = { x: xTop, y: y0 };
    }
    const tBottom = (y1 - anchor.y) / dir.y;
    const xBottom = anchor.x + tBottom * dir.x;
    if (tBottom >= 0 && xBottom >= x0 - EPSILON_INCHES && xBottom <= x1 + EPSILON_INCHES && tBottom < bestT) {
      bestT = tBottom;
      hit = { x: xBottom, y: y1 };
    }
  }

  if (!hit) {
    return nearestPointOnBoxPerimeter(box, anchor);
  }
  return hit;
}

function resolveConnectorGeometry(
  element: PreparedConnectorElement,
  slideIndex: number,
  warnings: string[],
  hardErrors: string[]
): void {
  const start = roundPoint(element.start);
  const end = roundPoint(element.end);
  const lineRectResult = normalizeLineRect(start, end);
  if (lineRectResult.error) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${lineRectResult.error}`);
  }

  let lineStart = roundPoint(start);
  let lineEnd = roundPoint(end);
  let arrowHeads: any[] = [];

  const arrowMeta = computeLineWithArrowheads({
    start,
    end,
    widthPt: element.style.widthPt,
    color: element.style.color,
    startArrow: element.style.startArrow,
    endArrow: element.style.endArrow,
    arrowSizePt: element.arrowSizePt,
    warnings,
    warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
  });
  if (arrowMeta.error) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
  }
  lineStart = roundPoint(arrowMeta.lineStart);
  lineEnd = roundPoint(arrowMeta.lineEnd);
  arrowHeads = arrowMeta.arrowHeads.map((arrow) => roundArrowHead(arrow));

  const adjustedRect = lineRectFromPoints(lineStart, lineEnd);

  element.start = start;
  element.end = end;
  element.lineStart = lineStart;
  element.lineEnd = lineEnd;
  element.arrowHeads = arrowHeads;
  element.lineRect = roundBox(adjustedRect.rect);
  element.lineFlipV = adjustedRect.flipV;
  element.lineFlipH = adjustedRect.flipH;
}

function resolveEdgeGeometry(
  element: PreparedEdgeElement,
  slideIndex: number,
  warnings: string[],
  hardErrors: string[]
): void {
  const start = roundPoint(element.start);
  const end = roundPoint(element.end);
  const lineRectResult = normalizeLineRect(start, end);
  if (lineRectResult.error) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${lineRectResult.error}`);
  }

  const arrowMeta = computeLineWithArrowheads({
    start,
    end,
    widthPt: element.style.widthPt,
    color: element.style.color,
    startArrow: "none",
    endArrow: element.style.endArrow,
    warnings,
    warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
  });
  if (arrowMeta.error) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
  }

  const lineStart = roundPoint(arrowMeta.lineStart);
  const lineEnd = roundPoint(arrowMeta.lineEnd);
  const adjustedRect = lineRectFromPoints(lineStart, lineEnd);

  element.start = start;
  element.end = end;
  element.lineStart = lineStart;
  element.lineEnd = lineEnd;
  element.arrowHeads = arrowMeta.arrowHeads.map((arrow) => roundArrowHead(arrow));
  element.metrics = { renderMode: "unified" };
  element.lineRect = roundBox(adjustedRect.rect);
  element.lineFlipV = adjustedRect.flipV;
  element.lineFlipH = adjustedRect.flipH;
}

function resolveCalloutLeaderGeometry(
  element: PreparedCalloutElement,
  slideIndex: number,
  warnings: string[],
  hardErrors: string[]
): void {
  if (!element.leader || !element.leaderStyle) {
    return;
  }

  const anchor = roundPoint(element.anchor);
  const leaderEnd = roundPoint(intersectRayWithBox(anchor, element.box));
  const lineRectResult = normalizeLineRect(anchor, leaderEnd);
  if (lineRectResult.error) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${lineRectResult.error}`);
  }

  const arrowMeta = computeLineWithArrowheads({
    start: anchor,
    end: leaderEnd,
    widthPt: element.leaderStyle.widthPt,
    color: element.leaderStyle.color,
    startArrow: element.leaderStyle.startArrow,
    endArrow: element.leaderStyle.endArrow,
    warnings,
    warnPrefix: `Slide ${slideIndex + 1} element ${element.order + 1}:`,
  });
  if (arrowMeta.error) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: ${arrowMeta.error}`);
  }

  const lineStart = roundPoint(arrowMeta.lineStart);
  const lineEnd = roundPoint(arrowMeta.lineEnd);
  const adjustedRect = lineRectFromPoints(lineStart, lineEnd);

  element.anchor = anchor;
  element.leader = { start: anchor, end: leaderEnd };
  element.leaderLineStart = lineStart;
  element.leaderLineEnd = lineEnd;
  if (arrowMeta.arrowHeads.length > 1) {
    hardErrors.push(`Slide ${slideIndex + 1} element ${element.order + 1}: callout_arrowhead_count_invalid`);
  }
  element.leaderArrowHeads = arrowMeta.arrowHeads.map((arrow) => roundArrowHead(arrow));
  element.leaderRect = roundBox(adjustedRect.rect);
  element.leaderFlipV = adjustedRect.flipV;
  element.leaderFlipH = adjustedRect.flipH;
}

function applyDiagramCentering(slide: PreparedSlide): void {
  if (!slide.diagramRegionBBox) {
    return;
  }

  let diagramBBox: BBox | null = null;

  slide.elements.forEach((element) => {
    if (element.kind === "node") {
      element.bbox = roundBox(element.bbox);
      if (element.icon) {
        element.icon.bbox = roundBox(element.icon.bbox);
      }
      element.label.bbox = roundBox(element.label.bbox);
      diagramBBox = unionBoxes(diagramBBox, element.bbox);
    } else if (element.kind === "edge") {
      element.lineRect = roundBox(element.lineRect);
      diagramBBox = unionBoxes(diagramBBox, element.lineRect);
    } else if (element.kind === "connector") {
      element.lineRect = roundBox(element.lineRect);
      diagramBBox = unionBoxes(diagramBBox, element.lineRect);
    }
  });

  if (!diagramBBox) {
    return;
  }

  const region = roundBox(slide.diagramRegionBBox);
  const regionCenter = { x: region.x + region.width / 2, y: region.y + region.height / 2 };
  const diagramBox = diagramBBox as BBox;
  const diagramCenter = { x: diagramBox.x + diagramBox.width / 2, y: diagramBox.y + diagramBox.height / 2 };
  const delta = { x: regionCenter.x - diagramCenter.x, y: regionCenter.y - diagramCenter.y };

  if (Math.abs(delta.x) < EPSILON_INCHES && Math.abs(delta.y) < EPSILON_INCHES) {
    return;
  }

  slide.elements.forEach((element) => {
    if (element.kind === "node") {
      element.bbox = translateBox(element.bbox, delta);
      if (element.icon) {
        element.icon.bbox = translateBox(element.icon.bbox, delta);
      }
      element.label.bbox = translateBox(element.label.bbox, delta);
    } else if (element.kind === "edge") {
      element.start = translatePoint(element.start, delta);
      element.end = translatePoint(element.end, delta);
      element.lineStart = translatePoint(element.lineStart ?? element.start, delta);
      element.lineEnd = translatePoint(element.lineEnd ?? element.end, delta);
      element.lineRect = translateBox(element.lineRect, delta);
    } else if (element.kind === "connector") {
      element.start = translatePoint(element.start, delta);
      element.end = translatePoint(element.end, delta);
      element.lineStart = translatePoint(element.lineStart ?? element.start, delta);
      element.lineEnd = translatePoint(element.lineEnd ?? element.end, delta);
      element.lineRect = translateBox(element.lineRect, delta);
      if (element.arrowHeads && element.arrowHeads.length > 0) {
        element.arrowHeads = element.arrowHeads.map((arrow) => translateArrowHead(arrow, delta));
      }
    } else if (element.kind === "callout") {
      element.anchor = translatePoint(element.anchor, delta);
      element.box = translateBox(element.box, delta);
      element.text.bbox = translateBox(element.text.bbox, delta);
      if (element.icon) {
        element.icon.bbox = translateBox(element.icon.bbox, delta);
      }
      if (element.leader) {
        element.leader.start = translatePoint(element.leader.start, delta);
        element.leader.end = translatePoint(element.leader.end, delta);
        if (element.leaderLineStart) {
          element.leaderLineStart = translatePoint(element.leaderLineStart, delta);
        }
        if (element.leaderLineEnd) {
          element.leaderLineEnd = translatePoint(element.leaderLineEnd, delta);
        }
        if (element.leaderRect) {
          element.leaderRect = translateBox(element.leaderRect, delta);
        }
        if (element.leaderArrowHeads && element.leaderArrowHeads.length > 0) {
          element.leaderArrowHeads = element.leaderArrowHeads.map((arrow) => translateArrowHead(arrow, delta));
        }
      }
    }
  });
}

export function resolveGeometryV1(args: {
  slides: PreparedSlide[];
  warnings: string[];
  hardErrors: string[];
}): void {
  args.slides.forEach((slide, slideIndex) => {
    slide.elements.forEach((element) => {
      if (element.kind === "connector") {
        resolveConnectorGeometry(element, slideIndex, args.warnings, args.hardErrors);
      } else if (element.kind === "edge") {
        resolveEdgeGeometry(element, slideIndex, args.warnings, args.hardErrors);
      } else if (element.kind === "callout") {
        resolveCalloutLeaderGeometry(element, slideIndex, args.warnings, args.hardErrors);
      }
    });
    applyDiagramCentering(slide);
  });
}
