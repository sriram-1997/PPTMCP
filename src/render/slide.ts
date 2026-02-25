import type {
  AnchorPoint,
  BBox,
  CalloutElement,
  CardElement,
  ChartElement,
  ChevronFlowElement,
  ConnectorElement,
  EdgeElement,
  GridConfig,
  ImageElement,
  IconElement,
  IntegrityDebugReport,
  IntegrityEntryBase,
  IntegrityReportSlide,
  IntegrityWarning,
  NodeElement,
  PreparedElement,
  PreparedSlide,
  RegionConfig,
  Regions,
  SlideProgramSpec,
  ListElement,
  TableElement,
  TextElement,
  ValidationReportEntry,
} from "./types.js";
import type { ConcreteTheme } from "../theme/types.js";
import {
  EPSILON_INCHES,
  SLIDE_HEIGHT_INCHES,
  SLIDE_WIDTH_INCHES,
  ptToIn,
  quantizeInchesToEmuStep,
  roundInches,
} from "./utils/units.js";
import { prepareTextElement } from "./text.js";
import { prepareTableElement } from "./table.js";
import { prepareChartElement } from "./chart.js";
import { prepareListElement } from "./list.js";
import { prepareCardElement } from "./card.js";
import { prepareChevronFlowElement } from "./chevron.js";
import { prepareCalloutElement } from "./callout.js";
import { prepareConnectorElement } from "./connector.js";
import { prepareEdgeElement } from "./edge.js";
import { prepareImageElement } from "./image.js";
import { prepareIconElement } from "./icon.js";
import { prepareNodeElement } from "./node.js";
import { computeFlowLayout } from "./flow.js";
import { layerBucketForElementType } from "../compiler/canonicalize.js";

export function computeRegionBBox(region: RegionConfig, grid: GridConfig): BBox {
  if (
    region.__rect &&
    Number.isFinite(region.__rect.x) &&
    Number.isFinite(region.__rect.y) &&
    Number.isFinite(region.__rect.width) &&
    Number.isFinite(region.__rect.height)
  ) {
    return {
      x: quantizeInchesToEmuStep(region.__rect.x),
      y: quantizeInchesToEmuStep(region.__rect.y),
      width: quantizeInchesToEmuStep(region.__rect.width),
      height: quantizeInchesToEmuStep(region.__rect.height),
    };
  }
  const { cols, rows, gutter } = grid;
  const totalGutterWidth = (cols - 1) * gutter;
  const totalGutterHeight = (rows - 1) * gutter;
  const cellWidth = (SLIDE_WIDTH_INCHES - totalGutterWidth) / cols;
  const cellHeight = (SLIDE_HEIGHT_INCHES - totalGutterHeight) / rows;
  const x = region.col * cellWidth + region.col * gutter;
  const y = region.row * cellHeight + region.row * gutter;
  const width = region.colSpan * cellWidth + (region.colSpan - 1) * gutter;
  const height = region.rowSpan * cellHeight + (region.rowSpan - 1) * gutter;
  return {
    x: quantizeInchesToEmuStep(x),
    y: quantizeInchesToEmuStep(y),
    width: quantizeInchesToEmuStep(width),
    height: quantizeInchesToEmuStep(height),
  };
}

function anchorPointFromRegion(bbox: BBox, point: AnchorPoint): { x: number; y: number } {
  const x0 = bbox.x;
  const y0 = bbox.y;
  const x1 = bbox.x + bbox.width;
  const y1 = bbox.y + bbox.height;
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  switch (point) {
    case "n":
      return { x: cx, y: y0 };
    case "ne":
      return { x: x1, y: y0 };
    case "e":
      return { x: x1, y: cy };
    case "se":
      return { x: x1, y: y1 };
    case "s":
      return { x: cx, y: y1 };
    case "sw":
      return { x: x0, y: y1 };
    case "w":
      return { x: x0, y: cy };
    case "nw":
      return { x: x0, y: y0 };
    default:
      return { x: cx, y: cy };
  }
}

export function resolveRegionAnchor(args: {
  anchor: { type: string; targetRegion: string; point: AnchorPoint; dxPt?: number; dyPt?: number };
  regions: Regions;
  grid: GridConfig;
}): { x: number; y: number } {
  if (args.anchor.type !== "region") {
    throw new Error("anchor_type_not_supported");
  }
  const target = args.regions[args.anchor.targetRegion];
  if (!target) {
    throw new Error(`anchor_region_not_found (${args.anchor.targetRegion})`);
  }
  const bbox = computeRegionBBox(target, args.grid);
  const base = anchorPointFromRegion(bbox, args.anchor.point);
  const dxIn = ptToIn(args.anchor.dxPt ?? 0);
  const dyIn = ptToIn(args.anchor.dyPt ?? 0);
  return { x: base.x + dxIn, y: base.y + dyIn };
}

export function isPointInside(bbox: BBox, point: { x: number; y: number }): boolean {
  return (
    point.x >= bbox.x - EPSILON_INCHES &&
    point.y >= bbox.y - EPSILON_INCHES &&
    point.x <= bbox.x + bbox.width + EPSILON_INCHES &&
    point.y <= bbox.y + bbox.height + EPSILON_INCHES
  );
}

export function isBoxInside(container: BBox, box: BBox): boolean {
  return (
    box.x >= container.x - EPSILON_INCHES &&
    box.y >= container.y - EPSILON_INCHES &&
    box.x + box.width <= container.x + container.width + EPSILON_INCHES &&
    box.y + box.height <= container.y + container.height + EPSILON_INCHES
  );
}

function stepIndexFromRegion(region: string): number | null {
  const match = region.match(/^step_(\d+)$/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

export function nearestPointOnBoxPerimeter(box: BBox, point: { x: number; y: number }): { x: number; y: number } {
  const x0 = box.x;
  const y0 = box.y;
  const x1 = box.x + box.width;
  const y1 = box.y + box.height;

  const insideX = point.x >= x0 && point.x <= x1;
  const insideY = point.y >= y0 && point.y <= y1;

  if (!insideX || !insideY) {
    const clampedX = Math.min(Math.max(point.x, x0), x1);
    const clampedY = Math.min(Math.max(point.y, y0), y1);
    if (point.x < x0) {
      return { x: x0, y: clampedY };
    }
    if (point.x > x1) {
      return { x: x1, y: clampedY };
    }
    if (point.y < y0) {
      return { x: clampedX, y: y0 };
    }
    return { x: clampedX, y: y1 };
  }

  const distLeft = Math.abs(point.x - x0);
  const distRight = Math.abs(x1 - point.x);
  const distTop = Math.abs(point.y - y0);
  const distBottom = Math.abs(y1 - point.y);
  const min = Math.min(distLeft, distRight, distTop, distBottom);

  if (min === distLeft) {
    return { x: x0, y: point.y };
  }
  if (min === distRight) {
    return { x: x1, y: point.y };
  }
  if (min === distTop) {
    return { x: point.x, y: y0 };
  }
  return { x: point.x, y: y1 };
}

function regionWithinSlide(bbox: BBox): boolean {
  return (
    bbox.x >= -EPSILON_INCHES &&
    bbox.y >= -EPSILON_INCHES &&
    bbox.width > 0 &&
    bbox.height > 0 &&
    bbox.x + bbox.width <= SLIDE_WIDTH_INCHES + EPSILON_INCHES &&
    bbox.y + bbox.height <= SLIDE_HEIGHT_INCHES + EPSILON_INCHES
  );
}

export function prepareSlides(args: {
  spec: SlideProgramSpec;
  theme: ConcreteTheme;
  baseDir: string;
  allowOverflow: boolean;
  allowDenseCharts: boolean;
  validationReport: ValidationReportEntry[];
  warnings: string[];
  hardErrors: string[];
}): PreparedSlide[] {
  const preparedSlides: PreparedSlide[] = [];

  args.spec.slides.forEach((slideSpec, slideIndex) => {
    const preparedElements: PreparedElement[] = [];
    const nodeBBoxes = new Map<string, BBox>();
    const flowStepBoxes = new Map<string, BBox>();
    let flowContext:
      | {
          stepBoxes: Map<string, BBox>;
          strokePt: number;
          arrowSizePt: number;
          layoutProfile: "flow.chevron" | "flow.card";
          profileExplicit: boolean;
        }
      | undefined;
    const flowRegionSpec = slideSpec.regions["canvas"];
    if (flowRegionSpec) {
      const stepCards = slideSpec.elements
        .filter((el) => el.type === "card")
        .map((el) => ({
          region: el.region,
          index: stepIndexFromRegion(el.region),
          layoutProfile: (el as { layoutProfile?: "flow.chevron" | "flow.card" }).layoutProfile,
        }))
        .filter((entry) => entry.index !== null) as Array<{
          region: string;
          index: number;
          layoutProfile?: "flow.chevron" | "flow.card";
        }>;
      if (stepCards.length >= 2) {
        stepCards.sort((a, b) => a.index - b.index);
        const explicitProfile = stepCards.find((entry) => entry.layoutProfile)?.layoutProfile;
        const resolvedProfile = explicitProfile === "flow.chevron" || explicitProfile === "flow.card" ? explicitProfile : "flow.card";
        const profile = resolvedProfile === "flow.chevron" ? args.theme.flowProfiles.flowChevron : args.theme.flowProfiles.flowCard;
        const flowLayout = computeFlowLayout({
          region: computeRegionBBox(flowRegionSpec, slideSpec.grid),
          count: stepCards.length,
          kind: "card",
          theme: args.theme,
          layoutProfile: resolvedProfile,
        });
        stepCards.forEach((entry, idx) => {
          const step = flowLayout.steps[idx];
          if (step) {
            flowStepBoxes.set(entry.region, {
              x: step.x,
              y: step.y,
              width: step.width,
              height: step.height,
            });
          }
        });
        flowContext = {
          stepBoxes: flowStepBoxes,
          strokePt: profile.connectorStrokePt,
          arrowSizePt: profile.connectorArrowSizePt,
          layoutProfile: resolvedProfile,
          profileExplicit: Boolean(explicitProfile),
        };
      }
    }
    slideSpec.elements.forEach((rawElement, elementIndex) => {
      if (rawElement.type !== "node") {
        return;
      }
      const element = rawElement as NodeElement;
      if (typeof element.id !== "string" || element.id.trim().length === 0) {
        return;
      }
      const region = slideSpec.regions[element.region];
      if (!region) {
        return;
      }
      nodeBBoxes.set(element.id, computeRegionBBox(region, slideSpec.grid));
    });
    for (let elementIndex = 0; elementIndex < slideSpec.elements.length; elementIndex += 1) {
      const element = slideSpec.elements[elementIndex];
      const z = Number.isFinite(element.z as number) ? (element.z as number) : 0;
      const order = elementIndex;
      const id =
        typeof (element as { id?: unknown }).id === "string"
          ? String((element as { id?: unknown }).id)
          : `${element.type}-${slideIndex + 1}-${elementIndex + 1}`;
      const region = slideSpec.regions[element.region];
      const baseBBox = computeRegionBBox(region, slideSpec.grid);
      const bbox = flowStepBoxes.get(element.region) ?? baseBBox;
      if (!regionWithinSlide(bbox)) {
        throw new Error(`Slide ${slideIndex + 1} region '${element.region}' is out of slide bounds`);
      }

      if (element.type === "text") {
        preparedElements.push(
          prepareTextElement({
            slide: slideSpec,
            slideIndex,
            element: element as TextElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            allowOverflow: args.allowOverflow,
            validationReport: args.validationReport,
            warnings: args.warnings,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "table") {
        preparedElements.push(
          prepareTableElement({
            slide: slideSpec,
            slideIndex,
            element: element as TableElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            allowOverflow: args.allowOverflow,
            validationReport: args.validationReport,
            warnings: args.warnings,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "list") {
        preparedElements.push(
          prepareListElement({
            slideIndex,
            elementIndex,
            element: element as ListElement,
            bbox,
            z,
            order,
            id,
            theme: args.theme,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "card") {
        preparedElements.push(
          prepareCardElement({
            slideIndex,
            elementIndex,
            element: element as CardElement,
            bbox,
            z,
            order,
            id,
            theme: args.theme,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "chart") {
        preparedElements.push(
          prepareChartElement({
            slideIndex,
            elementIndex,
            element: element as ChartElement,
            bbox,
            z,
            order,
            id,
            theme: args.theme,
            allowDenseCharts: args.allowDenseCharts,
            warnings: args.warnings,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "chevron_flow") {
        preparedElements.push(
          prepareChevronFlowElement({
            slideIndex,
            elementIndex,
            element: element as ChevronFlowElement,
            bbox,
            z,
            order,
            id,
            theme: args.theme,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "node") {
        preparedElements.push(
          prepareNodeElement({
            slideIndex,
            elementIndex,
            element: element as NodeElement,
            bbox,
            z,
            order,
            id,
            theme: args.theme,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "edge") {
        preparedElements.push(
          prepareEdgeElement({
            slide: slideSpec,
            slideIndex,
            element: element as EdgeElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            nodeBBoxes,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "callout") {
        preparedElements.push(
          prepareCalloutElement({
            slide: slideSpec,
            slideIndex,
            element: element as CalloutElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            allowOverflow: args.allowOverflow,
            validationReport: args.validationReport,
            warnings: args.warnings,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "connector") {
        preparedElements.push(
          prepareConnectorElement({
            slide: slideSpec,
            slideIndex,
            element: element as ConnectorElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            flow: flowContext,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "image") {
        preparedElements.push(
          prepareImageElement({
            slide: slideSpec,
            slideIndex,
            element: element as ImageElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            baseDir: args.baseDir,
            hardErrors: args.hardErrors,
          })
        );
      } else if (element.type === "icon") {
        preparedElements.push(
          prepareIconElement({
            slide: slideSpec,
            slideIndex,
            element: element as IconElement,
            elementIndex,
            z,
            order,
            id,
            bbox,
            theme: args.theme,
            hardErrors: args.hardErrors,
          })
        );
      } else {
        throw new Error(`Slide ${slideIndex + 1} element ${elementIndex + 1}: unsupported element type`);
      }
    }
    preparedElements.sort((a, b) => {
      const bucketA = layerBucketForElementType(a.kind);
      const bucketB = layerBucketForElementType(b.kind);
      if (bucketA !== bucketB) {
        return bucketA - bucketB;
      }
      const idCompare = a.id.localeCompare(b.id);
      if (idCompare !== 0) {
        return idCompare;
      }
      return a.order - b.order;
    });
    const diagramRegionId = slideSpec.regions["canvas"] ? "canvas" : undefined;
    const diagramRegionBBox = diagramRegionId
      ? computeRegionBBox(slideSpec.regions[diagramRegionId], slideSpec.grid)
      : undefined;
    preparedSlides.push({
      elements: preparedElements,
      diagramRegionId,
      diagramRegionBBox,
    });
  });

  return preparedSlides;
}

export function buildIntegrityDebug(args: {
  spec: SlideProgramSpec;
  preparedSlides: PreparedSlide[];
}): IntegrityDebugReport {
  const slidesReport: IntegrityReportSlide[] = [];
  let chartCount = 0;
  let shapeCount = 0;
  let textCount = 0;
  let tableCount = 0;

  args.preparedSlides.forEach((slidePlan, slideIdx) => {
    const slideSpec = args.spec.slides[slideIdx];
    const warningsLocal: IntegrityWarning[] = [];
    const renderList: (IntegrityEntryBase & Record<string, unknown>)[] = [];

    slidePlan.elements.forEach((element, renderIndex) => {
      const regionSpec = slideSpec.regions[element.region];
      const regionRect = computeRegionBBox(regionSpec, slideSpec.grid);
      const entryBase: IntegrityEntryBase = {
        render_index: renderIndex + 1,
        id: element.id,
        type: element.kind,
        z: element.z,
        region: element.region,
        region_rect_in: {
          x: roundInches(regionRect.x),
          y: roundInches(regionRect.y),
          w: roundInches(regionRect.width),
          h: roundInches(regionRect.height),
        },
      };

      const addWarning = (code: string, message: string) => {
        warningsLocal.push({ code, message });
      };

      const addIntegrityWarning = (message: string) => {
        addWarning("INTEGRITY_WARNINGS", message);
      };

      const checkPoint = (label: string, point: { x: number; y: number }) => {
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
          addWarning("INTEGRITY_WARN_NAN", `${label} has NaN/Inf`);
          addIntegrityWarning(`${label} has NaN/Inf`);
        }
        if (
          point.x < -EPSILON_INCHES ||
          point.y < -EPSILON_INCHES ||
          point.x > SLIDE_WIDTH_INCHES + EPSILON_INCHES ||
          point.y > SLIDE_HEIGHT_INCHES + EPSILON_INCHES
        ) {
          addWarning("INTEGRITY_WARN_OUTSIDE", `${label} outside slide bounds`);
          addIntegrityWarning(`${label} outside slide bounds`);
        }
      };

      const checkBox = (label: string, box: BBox) => {
        if (!Number.isFinite(box.x) || !Number.isFinite(box.y) || !Number.isFinite(box.width) || !Number.isFinite(box.height)) {
          addWarning("INTEGRITY_WARN_NAN", `${label} has NaN/Inf`);
          addIntegrityWarning(`${label} has NaN/Inf`);
        }
        if (box.width < 0 || box.height < 0) {
          addWarning("INTEGRITY_WARN_NEGATIVE", `${label} has negative w/h`);
          addIntegrityWarning(`${label} has negative w/h`);
        }
        if (
          box.x < -EPSILON_INCHES ||
          box.y < -EPSILON_INCHES ||
          box.x + box.width > SLIDE_WIDTH_INCHES + EPSILON_INCHES ||
          box.y + box.height > SLIDE_HEIGHT_INCHES + EPSILON_INCHES
        ) {
          addWarning("INTEGRITY_WARN_OUTSIDE", `${label} outside slide bounds`);
          addIntegrityWarning(`${label} outside slide bounds`);
        }
      };

      const checkLine = (label: string, start: { x: number; y: number }, end: { x: number; y: number }, widthPt: number) => {
        if (!Number.isFinite(widthPt) || widthPt <= 0) {
          addIntegrityWarning(`${label} widthPt <= 0`);
        }
        if (start.x === end.x && start.y === end.y) {
          addIntegrityWarning(`${label} start equals end`);
        }
      };

      if (element.kind === "text") {
        textCount += 1;
        checkBox("text_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      } else if (element.kind === "table") {
        tableCount += 1;
        checkBox("table_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      } else if (element.kind === "chart") {
        chartCount += 1;
        checkBox("chart_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      } else if (element.kind === "list") {
        textCount += 1;
        checkBox("list_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      } else if (element.kind === "card") {
        shapeCount += 1;
        checkBox("card_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      } else if (element.kind === "connector") {
        shapeCount += 1;
        checkPoint("connector_start", element.start);
        checkPoint("connector_end", element.end);
        checkLine("connector", element.start, element.end, element.style.widthPt);
        const dx = element.end.x - element.start.x;
        const dy = element.end.y - element.start.y;
        if (dx < 0 || dy < 0) {
          addIntegrityWarning("connector pre-normalization negative extent");
        }
        if (element.lineRect.width < 0 || element.lineRect.height < 0) {
          addIntegrityWarning("connector normalized rect has negative extent");
        }
        if (element.start.x === element.end.x && element.start.y === element.end.y) {
          addWarning("INTEGRITY_WARN_ZERO_LINE", "connector start equals end");
        }
        renderList.push({
          ...entryBase,
          start_in: { x: roundInches(element.start.x), y: roundInches(element.start.y) },
          end_in: { x: roundInches(element.end.x), y: roundInches(element.end.y) },
          line_rect_in: {
            x: roundInches(element.lineRect.x),
            y: roundInches(element.lineRect.y),
            w: roundInches(element.lineRect.width),
            h: roundInches(element.lineRect.height),
          },
          dx: roundInches(dx),
          dy: roundInches(dy),
          flip_v: element.lineFlipV === true,
          flip_h: element.lineFlipH === true,
        });
      } else if (element.kind === "edge") {
        shapeCount += 1;
        checkPoint("edge_start", element.start);
        checkPoint("edge_end", element.end);
        checkLine("edge", element.start, element.end, element.style.widthPt);
        const dx = element.end.x - element.start.x;
        const dy = element.end.y - element.start.y;
        if (dx < 0 || dy < 0) {
          addIntegrityWarning("edge pre-normalization negative extent");
        }
        if (element.lineRect.width < 0 || element.lineRect.height < 0) {
          addIntegrityWarning("edge normalized rect has negative extent");
        }
        renderList.push({
          ...entryBase,
          start_in: { x: roundInches(element.start.x), y: roundInches(element.start.y) },
          end_in: { x: roundInches(element.end.x), y: roundInches(element.end.y) },
          line_rect_in: {
            x: roundInches(element.lineRect.x),
            y: roundInches(element.lineRect.y),
            w: roundInches(element.lineRect.width),
            h: roundInches(element.lineRect.height),
          },
          dx: roundInches(dx),
          dy: roundInches(dy),
          flip_v: element.lineFlipV === true,
          flip_h: element.lineFlipH === true,
        });
      } else if (element.kind === "callout") {
        shapeCount += element.leader ? 2 : 1;
        textCount += 1;
        if (element.leader) {
          checkPoint("callout_anchor", element.leader.start);
          checkPoint("callout_leader_end", element.leader.end);
          checkLine("callout_leader", element.leader.start, element.leader.end, 1);
          if (element.leaderRect && (element.leaderRect.width < 0 || element.leaderRect.height < 0)) {
            addIntegrityWarning("callout leader normalized rect has negative extent");
          }
        }
        checkBox("callout_box", element.box);
        if (element.leader && element.leader.start.x === element.leader.end.x && element.leader.start.y === element.leader.end.y) {
          addWarning("INTEGRITY_WARN_ZERO_LINE", "callout leader start equals end");
        }
        renderList.push({
          ...entryBase,
          anchor_in: element.leader ? { x: roundInches(element.leader.start.x), y: roundInches(element.leader.start.y) } : null,
          box_in: {
            x: roundInches(element.box.x),
            y: roundInches(element.box.y),
            w: roundInches(element.box.width),
            h: roundInches(element.box.height),
          },
          leader_start_in: element.leader ? { x: roundInches(element.leader.start.x), y: roundInches(element.leader.start.y) } : null,
          leader_end_in: element.leader ? { x: roundInches(element.leader.end.x), y: roundInches(element.leader.end.y) } : null,
          line_rect_in: element.leaderRect
            ? {
                x: roundInches(element.leaderRect.x),
                y: roundInches(element.leaderRect.y),
                w: roundInches(element.leaderRect.width),
                h: roundInches(element.leaderRect.height),
              }
            : null,
          dx: element.leader ? roundInches(element.leader.end.x - element.leader.start.x) : null,
          dy: element.leader ? roundInches(element.leader.end.y - element.leader.start.y) : null,
          flip_v: element.leader ? element.leaderFlipV === true : null,
          flip_h: element.leader ? element.leaderFlipH === true : null,
        });
      } else if (element.kind === "icon") {
        shapeCount += 1;
        checkBox("icon_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      } else if (element.kind === "node") {
        shapeCount += 1;
        checkBox("node_bbox", element.bbox);
        renderList.push({
          ...entryBase,
          bbox_in: {
            x: roundInches(element.bbox.x),
            y: roundInches(element.bbox.y),
            w: roundInches(element.bbox.width),
            h: roundInches(element.bbox.height),
          },
        });
      }
    });

    slidesReport.push({
      slide_index: slideIdx + 1,
      slide_id: slideSpec.id,
      render_list: renderList,
      warnings: warningsLocal,
    });
  });

  return {
    summary: {
      charts: chartCount,
      shapes_lines: shapeCount,
      text_boxes: textCount,
      tables: tableCount,
    },
    slides: slidesReport,
  };
}




