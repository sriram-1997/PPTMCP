import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { prepareTextElement } from "./text.js";
import { normalizeLineRect } from "./connector.js";
import { isBoxInside, nearestPointOnBoxPerimeter, resolveRegionAnchor } from "./slide.js";
const DEFAULT_CALLOUT_PADDING_PT = 6;
const CALLOUT_GAP_PT = 6;
function resolveCalloutBoxPosition(args) {
    const gapIn = CALLOUT_GAP_PT / 72;
    const w = args.box.wIn;
    const h = args.box.hIn;
    const ax = args.anchor.x;
    const ay = args.anchor.y;
    switch (args.box.placement) {
        case "ne":
            return { x: ax + gapIn, y: ay - h - gapIn };
        case "nw":
            return { x: ax - w - gapIn, y: ay - h - gapIn };
        case "se":
            return { x: ax + gapIn, y: ay + gapIn };
        case "sw":
            return { x: ax - w - gapIn, y: ay + gapIn };
        case "e":
            return { x: ax + gapIn, y: ay - h / 2 };
        case "w":
            return { x: ax - w - gapIn, y: ay - h / 2 };
        case "n":
            return { x: ax - w / 2, y: ay - h - gapIn };
        case "s":
            return { x: ax - w / 2, y: ay + gapIn };
        default:
            return { x: ax + gapIn, y: ay - h - gapIn };
    }
}
export function prepareCalloutElement(args) {
    const defaults = resolveElementStyleDefaults(args.element, args.theme);
    const anchor = resolveRegionAnchor({
        anchor: args.element.anchor,
        regions: args.slide.regions,
        grid: args.slide.grid,
    });
    const boxW = args.element.box.wIn;
    const boxH = args.element.box.hIn;
    const candidates = args.element.box.placement === "auto"
        ? ["ne", "nw", "se", "sw", "e", "w", "n", "s"]
        : [args.element.box.placement];
    let box = null;
    for (const placement of candidates) {
        const nextBox = resolveCalloutBoxPosition({
            anchor,
            box: { ...args.element.box, placement },
        });
        const candidateBox = {
            x: nextBox.x,
            y: nextBox.y,
            width: boxW,
            height: boxH,
        };
        if (isBoxInside(args.bbox, candidateBox)) {
            box = candidateBox;
            break;
        }
    }
    if (!box) {
        if (args.element.box.placement === "auto") {
            args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: callout_no_feasible_placement`);
        }
        else {
            args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: callout_box_outside_region`);
        }
        box = { x: args.bbox.x, y: args.bbox.y, width: boxW, height: boxH };
    }
    const leaderEnd = args.element.leader ? nearestPointOnBoxPerimeter(box, anchor) : null;
    const leaderRectResult = leaderEnd ? normalizeLineRect(anchor, leaderEnd) : null;
    const leaderFlipV = leaderRectResult ? leaderRectResult.flipV : false;
    const leaderFlipH = leaderRectResult ? leaderRectResult.flipH : false;
    if (leaderRectResult?.error) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: ${leaderRectResult.error}`);
    }
    const leaderDefaults = defaults.strokeStyle;
    const leaderStyle = leaderEnd
        ? {
            color: leaderDefaults?.color ?? args.theme.callout.leader,
            widthPt: leaderDefaults?.widthPt ?? args.theme.shape.borderWidth,
            startArrow: leaderDefaults?.startArrow ?? "none",
            endArrow: leaderDefaults?.endArrow ?? "none",
        }
        : undefined;
    const leaderStartArrow = args.element.leader?.startArrow ?? leaderStyle?.startArrow ?? "none";
    const leaderEndArrow = args.element.leader?.endArrow ?? leaderStyle?.endArrow ?? "none";
    const textElement = {
        type: "text",
        region: args.element.region,
        content: args.element.text.value,
        style: {
            ...args.element.text.style,
            paddingPt: args.element.box.paddingPt ?? DEFAULT_CALLOUT_PADDING_PT,
            color: args.element.text.style?.color ?? (defaults.textStyle?.color ?? args.theme.callout.textColor),
        },
    };
    const preparedText = prepareTextElement({
        slide: args.slide,
        slideIndex: args.slideIndex,
        element: textElement,
        elementIndex: args.elementIndex,
        z: args.z,
        order: args.order,
        id: `${args.id}::text`,
        bbox: box,
        theme: args.theme,
        allowOverflow: args.allowOverflow,
        validationReport: args.validationReport,
        warnings: args.warnings,
        hardErrors: args.hardErrors,
    });
    return {
        kind: "callout",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        variant: args.element.variant,
        box,
        boxStyle: defaults.boxStyle
            ? { fill: defaults.boxStyle.fill, border: defaults.boxStyle.border, borderWidth: defaults.boxStyle.borderWidth }
            : undefined,
        text: preparedText,
        leader: leaderEnd
            ? {
                start: anchor,
                end: leaderEnd,
            }
            : undefined,
        leaderStyle: leaderEnd
            ? {
                color: leaderStyle?.color ?? args.theme.callout.leader,
                widthPt: leaderStyle?.widthPt ?? args.theme.shape.borderWidth,
                startArrow: leaderStartArrow,
                endArrow: leaderEndArrow,
            }
            : undefined,
        leaderRect: leaderRectResult?.rect,
        leaderFlipV: leaderEnd ? leaderFlipV : undefined,
        leaderFlipH: leaderEnd ? leaderFlipH : undefined,
    };
}
export function renderCalloutElement(slide, shapeType, element, theme) {
    if (element.leader) {
        const leaderStyle = element.leaderStyle;
        slide.addShape(shapeType.line, {
            x: element.leaderRect?.x ?? element.leader.start.x,
            y: element.leaderRect?.y ?? element.leader.start.y,
            w: element.leaderRect?.width ?? element.leader.end.x - element.leader.start.x,
            h: element.leaderRect?.height ?? element.leader.end.y - element.leader.start.y,
            flipV: element.leaderFlipV === true,
            flipH: element.leaderFlipH === true,
            line: {
                color: leaderStyle?.color ?? theme.callout.leader,
                width: leaderStyle?.widthPt ?? theme.shape.borderWidth,
                beginArrowType: leaderStyle?.startArrow ?? "none",
                endArrowType: leaderStyle?.endArrow ?? "none",
            },
        });
    }
    const boxFill = element.boxStyle?.fill ?? theme.callout.fill;
    const boxBorder = element.boxStyle?.border ?? theme.callout.border;
    const boxBorderWidth = element.boxStyle?.borderWidth ?? theme.shape.borderWidth;
    slide.addShape(shapeType.rect, {
        x: element.box.x,
        y: element.box.y,
        w: element.box.width,
        h: element.box.height,
        fill: { color: boxFill },
        line: { color: boxBorder, width: boxBorderWidth },
    });
    slide.addText(element.text.content, {
        x: element.text.bbox.x,
        y: element.text.bbox.y,
        w: element.text.bbox.width,
        h: element.text.bbox.height,
        fontSize: element.text.fontSize,
        bold: element.text.style.bold,
        italic: element.text.style.italic,
        color: element.text.style.color,
        align: element.text.style.align,
        valign: element.text.style.valign,
        fit: "none",
        margin: element.text.style.paddingPt,
        breakLine: true,
    });
}
//# sourceMappingURL=callout.js.map