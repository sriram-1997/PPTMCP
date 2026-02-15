import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { prepareTextElement } from "./text.js";
import { lineRectFromPoints, renderArrowHeads } from "./connector.js";
import { isBoxInside, resolveRegionAnchor } from "./slide.js";
import { resolveIconData } from "./utils/icons.js";
import { ptToIn } from "./utils/units.js";
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
    const leaderDefaults = defaults.strokeStyle;
    const leaderColor = leaderDefaults?.color ?? args.theme.callout.leader;
    const leaderWidthPt = leaderDefaults?.widthPt ?? args.theme.strokeScale.normal;
    const leaderStartArrow = args.element.leader?.startArrow ?? leaderDefaults?.startArrow ?? "none";
    const leaderEndArrow = args.element.leader?.endArrow ?? leaderDefaults?.endArrow ?? "none";
    const hasLeader = Boolean(args.element.leader);
    const content = args.element.content;
    const usingContent = Boolean(content);
    const textValue = content ? content.text : (args.element.text?.value ?? "");
    let textBox = box;
    let iconBox;
    let iconData;
    let textElement;
    if (usingContent) {
        const paddingPt = args.element.box.paddingPt ?? (args.theme.spaceScale[3] ?? 0);
        const iconName = content?.icon;
        const iconSizePt = iconName ? (args.theme.spaceScale[4] ?? args.theme.spaceScale[3] ?? 0) : 0;
        const iconGapPt = iconName ? (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0) : 0;
        const contentWidthIn = box.width - ptToIn(paddingPt * 2);
        const contentHeightIn = box.height - ptToIn(paddingPt * 2);
        textBox = {
            x: box.x + ptToIn(paddingPt + iconSizePt + iconGapPt),
            y: box.y + ptToIn(paddingPt),
            width: Math.max(0, contentWidthIn - ptToIn(iconSizePt + iconGapPt)),
            height: Math.max(0, contentHeightIn),
        };
        if (iconName) {
            const iconResult = resolveIconData({ name: iconName, color: args.theme.text.colorPrimary });
            if (iconResult.error || !iconResult.data) {
                args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: icon_not_found`);
            }
            else {
                iconData = iconResult.data;
                const iconSizeIn = ptToIn(iconSizePt);
                const contentHeightPt = contentHeightIn * 72;
                const iconY = box.y + ptToIn(paddingPt) + ptToIn(Math.max(0, (contentHeightPt - iconSizePt) / 2));
                iconBox = {
                    x: box.x + ptToIn(paddingPt),
                    y: iconY,
                    width: iconSizeIn,
                    height: iconSizeIn,
                };
            }
        }
        const bodyFont = args.theme.fontScale.body;
        const bodyBold = bodyFont.weight >= args.theme.type.weightBold;
        textElement = {
            type: "text",
            region: args.element.region,
            content: textValue,
            style: {
                fontSize: bodyFont.size,
                bold: bodyBold,
                color: defaults.textStyle?.color ?? args.theme.text.colorPrimary,
                paddingPt: 0,
            },
        };
    }
    else {
        const legacyPaddingPt = args.element.box.paddingPt ?? (args.theme.spaceScale[3] ?? 0);
        textElement = {
            type: "text",
            region: args.element.region,
            content: textValue,
            style: {
                ...args.element.text?.style,
                paddingPt: legacyPaddingPt,
                color: args.element.text?.style?.color ?? (defaults.textStyle?.color ?? args.theme.callout.textColor),
            },
        };
    }
    const preparedText = prepareTextElement({
        slide: args.slide,
        slideIndex: args.slideIndex,
        element: textElement,
        elementIndex: args.elementIndex,
        z: args.z,
        order: args.order,
        id: `${args.id}::text`,
        bbox: textBox,
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
        anchor,
        box,
        boxStyle: defaults.boxStyle
            ? { fill: defaults.boxStyle.fill, border: defaults.boxStyle.border, borderWidth: defaults.boxStyle.borderWidth }
            : undefined,
        icon: iconBox && iconData ? { bbox: iconBox, data: iconData } : undefined,
        text: preparedText,
        leader: hasLeader
            ? {
                start: anchor,
                end: anchor,
            }
            : undefined,
        leaderStyle: hasLeader
            ? {
                color: leaderColor,
                widthPt: leaderWidthPt,
                startArrow: leaderStartArrow,
                endArrow: leaderEndArrow,
            }
            : undefined,
    };
}
export function renderCalloutElement(slide, shapeType, element, theme) {
    if (element.leader) {
        const leaderStyle = element.leaderStyle;
        const lineStart = element.leaderLineStart ?? element.leader.start;
        const lineEnd = element.leaderLineEnd ?? element.leader.end;
        const rect = element.leaderRect ?? lineRectFromPoints(lineStart, lineEnd).rect;
        slide.addShape(shapeType.line, {
            x: rect.x,
            y: rect.y,
            w: rect.width,
            h: rect.height,
            flipV: element.leaderFlipV === true,
            flipH: element.leaderFlipH === true,
            line: {
                color: leaderStyle?.color ?? theme.callout.leader,
                width: leaderStyle?.widthPt ?? theme.strokeScale.normal,
            },
        });
        if (element.leaderArrowHeads && element.leaderArrowHeads.length > 0) {
            renderArrowHeads(slide, shapeType, element.leaderArrowHeads);
        }
    }
    const boxFill = element.boxStyle?.fill ?? theme.callout.fill;
    const boxBorder = element.boxStyle?.border ?? theme.callout.border;
    const boxBorderWidth = element.boxStyle?.borderWidth ?? theme.strokeScale.thin;
    slide.addShape(shapeType.rect, {
        x: element.box.x,
        y: element.box.y,
        w: element.box.width,
        h: element.box.height,
        fill: { color: boxFill },
        line: { color: boxBorder, width: boxBorderWidth },
    });
    if (element.icon) {
        slide.addImage({
            data: element.icon.data,
            x: element.icon.bbox.x,
            y: element.icon.bbox.y,
            w: element.icon.bbox.width,
            h: element.icon.bbox.height,
        });
    }
    slide.addText(element.text.content, {
        x: element.text.bbox.x,
        y: element.text.bbox.y,
        w: element.text.bbox.width,
        h: element.text.bbox.height,
        fontFace: element.text.fontFace,
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