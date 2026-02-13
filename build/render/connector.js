import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { normalizeColor } from "./utils/color.js";
import { isPointInside, resolveRegionAnchor } from "./slide.js";
const DEFAULT_CONNECTOR_WIDTH_PT = 1;
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
export function prepareConnectorElement(args) {
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
    const widthPt = args.element.style?.widthPt ?? DEFAULT_CONNECTOR_WIDTH_PT;
    if (!Number.isFinite(widthPt) || widthPt <= 0) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: line_width_invalid`);
    }
    if (!isPointInside(args.bbox, start) || !isPointInside(args.bbox, end)) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: connector_outside_region`);
    }
    const lineRectResult = normalizeLineRect(start, end);
    if (lineRectResult.error) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: ${lineRectResult.error}`);
    }
    const lineFlipV = lineRectResult.flipV;
    const lineFlipH = lineRectResult.flipH;
    const defaultColor = defaults.strokeStyle?.color ?? args.theme.connector.stroke;
    const startArrow = args.element.style?.startArrow ?? defaults.strokeStyle?.startArrow ?? "none";
    const endArrow = args.element.style?.endArrow ?? defaults.strokeStyle?.endArrow ?? "none";
    return {
        kind: "connector",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        variant: args.element.variant,
        start,
        end,
        style: {
            widthPt,
            color: normalizeColor(args.element.style?.color, defaultColor),
            startArrow,
            endArrow,
        },
        lineRect: lineRectResult.rect,
        lineFlipV,
        lineFlipH,
    };
}
export function renderConnectorElement(slide, shapeType, element) {
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
            beginArrowType: element.style.startArrow,
            endArrowType: element.style.endArrow,
        },
    });
}
//# sourceMappingURL=connector.js.map