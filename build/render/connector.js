import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { normalizeColor } from "./utils/color.js";
import { EPSILON_INCHES, ptToIn } from "./utils/units.js";
import { isPointInside, resolveRegionAnchor } from "./slide.js";
import { computeArrowhead, formatLineTooShortFromArrowhead } from "./arrowhead.js";
const DEFAULT_CONNECTOR_WIDTH_PT = 1;
function buildCenteredArrowHead(args) {
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
function anchorPointFromBox(bbox, point) {
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
export function lineRectFromPoints(start, end) {
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
export function normalizeLineRect(start, end) {
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
export function computeLineWithArrowheads(args) {
    const dx = args.end.x - args.start.x;
    const dy = args.end.y - args.start.y;
    const lineLength = Math.hypot(dx, dy);
    if (!Number.isFinite(lineLength) || lineLength === 0) {
        return { lineStart: args.start, lineEnd: args.end, arrowHeads: [], error: "line_zero_length" };
    }
    const unit = { x: dx / lineLength, y: dy / lineLength };
    const endArrow = args.endArrow === "triangle";
    const startArrow = args.startArrow === "triangle";
    if (startArrow && endArrow && args.warnings && args.warnPrefix) {
        args.warnings.push(`${args.warnPrefix} arrowhead_double_requested`);
    }
    const arrowHeads = [];
    let headLen = 0;
    let headWidth = 0;
    if (startArrow || endArrow) {
        const arrowMeta = computeArrowhead({
            strokeWidthPt: args.widthPt,
            segmentLengthIn: lineLength,
            preferredHeadLengthPt: args.arrowSizePt,
        });
        if (!arrowMeta.valid) {
            return {
                lineStart: args.start,
                lineEnd: args.end,
                arrowHeads: [],
                error: formatLineTooShortFromArrowhead(arrowMeta.diagnostics),
            };
        }
        headLen = ptToIn(arrowMeta.headLengthPt);
        headWidth = ptToIn(arrowMeta.headWidthPt);
    }
    if (endArrow) {
        arrowHeads.push(buildCenteredArrowHead({
            tip: args.end,
            direction: unit,
            lengthIn: headLen,
            widthIn: headWidth,
            color: args.color,
        }));
    }
    else if (startArrow) {
        arrowHeads.push(buildCenteredArrowHead({
            tip: args.start,
            direction: { x: -unit.x, y: -unit.y },
            lengthIn: headLen,
            widthIn: headWidth,
            color: args.color,
        }));
    }
    const lineStart = args.start;
    const lineEnd = endArrow ? { x: args.end.x - unit.x * headLen, y: args.end.y - unit.y * headLen } : args.end;
    return { lineStart, lineEnd, arrowHeads, error: null };
}
export function renderArrowHeads(slide, shapeType, arrowHeads) {
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
export function prepareConnectorElement(args) {
    const defaults = resolveElementStyleDefaults(args.element, args.theme);
    let start = resolveRegionAnchor({
        anchor: args.element.start,
        regions: args.slide.regions,
        grid: args.slide.grid,
    });
    let end = resolveRegionAnchor({
        anchor: args.element.end,
        regions: args.slide.regions,
        grid: args.slide.grid,
    });
    const startBox = args.flow?.stepBoxes && args.element.start.type === "region"
        ? args.flow.stepBoxes.get(args.element.start.targetRegion)
        : undefined;
    const endBox = args.flow?.stepBoxes && args.element.end.type === "region"
        ? args.flow.stepBoxes.get(args.element.end.targetRegion)
        : undefined;
    if (startBox) {
        const anchored = anchorPointFromBox(startBox, args.element.start.point);
        start = { x: anchored.x, y: startBox.y + startBox.height / 2 };
    }
    if (endBox) {
        const anchored = anchorPointFromBox(endBox, args.element.end.point);
        end = { x: anchored.x, y: endBox.y + endBox.height / 2 };
    }
    const widthPt = args.element.style?.widthPt ?? defaults.strokeStyle?.widthPt ?? args.theme.strokeScale.normal ?? DEFAULT_CONNECTOR_WIDTH_PT;
    const flowActive = Boolean(startBox && endBox);
    const flowWidthPt = flowActive ? args.flow?.strokePt : undefined;
    let flowArrowSizePt = flowActive ? args.flow?.arrowSizePt : undefined;
    if (flowActive && flowArrowSizePt && Number.isFinite(flowArrowSizePt)) {
        const lengthIn = Math.hypot(end.x - start.x, end.y - start.y);
        const maxArrowPt = Math.max(0, (lengthIn - EPSILON_INCHES) * 72);
        flowArrowSizePt = Math.min(flowArrowSizePt, maxArrowPt);
    }
    const resolvedWidthPt = flowWidthPt && Number.isFinite(flowWidthPt) ? Math.max(widthPt, flowWidthPt) : widthPt;
    if (!Number.isFinite(resolvedWidthPt) || resolvedWidthPt <= 0) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: line_width_invalid`);
    }
    if (!isPointInside(args.bbox, start) || !isPointInside(args.bbox, end)) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: connector_outside_region`);
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
            widthPt: resolvedWidthPt,
            color,
            startArrow,
            endArrow,
        },
        arrowHeads: [],
        customArrowheads: flowActive && Boolean(flowArrowSizePt),
        arrowSizePt: flowActive ? flowArrowSizePt : undefined,
        lineRect: baseRect.rect,
        lineFlipV: baseRect.flipV,
        lineFlipH: baseRect.flipH,
    };
}
export function renderConnectorElement(slide, shapeType, element) {
    const useCustom = Boolean(element.arrowHeads && element.arrowHeads.length > 0);
    const beginArrowType = useCustom ? "none" : element.style.startArrow === "triangle" ? "triangle" : "none";
    const endArrowType = useCustom ? "none" : element.style.endArrow === "triangle" ? "triangle" : "none";
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
            beginArrowType,
            endArrowType,
        },
    });
    if (useCustom) {
        renderArrowHeads(slide, shapeType, element.arrowHeads || []);
    }
}
//# sourceMappingURL=connector.js.map