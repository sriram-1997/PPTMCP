import { estimateTextLayout } from "./text.js";
import { EPSILON_INCHES, ptToIn, roundInches } from "./utils/units.js";
import { resolveIconData } from "./utils/icons.js";
import { normalizeColor } from "./utils/color.js";
import { normalizeText } from "./utils/textRuns.js";
import { computeFlowLayout } from "./flow.js";
const DEFAULT_LINE_HEIGHT = 1.15;
const CHEVRON_LABEL_MIN_FONT_PT = 10;
function computeStepPoints(args) {
    const x0 = args.x;
    const y0 = args.y;
    const x1 = args.x + args.width;
    const y1 = args.y + args.height;
    const ym = args.y + args.height / 2;
    const leftNotch = args.isFirst ? 0 : args.notch;
    const rightTip = args.isLast ? 0 : args.tip;
    const includeNotch = !args.isFirst && leftNotch > EPSILON_INCHES;
    const points = [];
    points.push({ x: x0, y: y0, moveTo: true });
    if (!args.isLast) {
        points.push({ x: x1 - rightTip, y: y0 });
        points.push({ x: x1, y: ym });
        points.push({ x: x1 - rightTip, y: y1 });
    }
    else {
        points.push({ x: x1, y: y0 });
        points.push({ x: x1, y: y1 });
    }
    points.push({ x: x0, y: y1 });
    if (includeNotch) {
        points.push({ x: x0 + leftNotch, y: ym });
    }
    points.push({ close: true });
    return {
        bbox: { x: x0, y: y0, width: args.width, height: args.height },
        points,
    };
}
function resolveStepFill(theme, index) {
    const palette = theme.chart.palette || [];
    if (palette.length > 0) {
        return palette[index % palette.length];
    }
    return theme.module.fill;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function fitChevronLabel(args) {
    let nextFont = args.fontSize;
    let estimate = estimateTextLayout({
        text: args.text,
        fontSize: nextFont,
        bold: args.bold,
        bbox: args.bbox,
        paddingPt: 0,
        lineHeight: args.lineHeight,
    });
    while ((estimate.overflowHeight || estimate.overflowWidth) && nextFont > args.minFontSize) {
        nextFont -= 1;
        estimate = estimateTextLayout({
            text: args.text,
            fontSize: nextFont,
            bold: args.bold,
            bbox: args.bbox,
            paddingPt: 0,
            lineHeight: args.lineHeight,
        });
    }
    return {
        text: estimate.wrappedLines.join("\n"),
        fontSize: nextFont,
        requiredHeightPt: estimate.requiredHeightPt,
        overflow: estimate.overflowHeight || estimate.overflowWidth,
    };
}
export function prepareChevronFlowElement(args) {
    const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
    const CHEVRON_TIP_DEPTH_RATIO_MAX = 0.25;
    const CHEVRON_TIP_DEPTH_MAX_IN = 0.24;
    const CHEVRON_MIN_TEXT_PADDING_EXTRA_PT = 2;
    const orientation = args.element.orientation ?? "horizontal";
    if (orientation !== "horizontal") {
        args.hardErrors.push(`${prefix} chevron_orientation_invalid`);
    }
    const stepsSpec = Array.isArray(args.element.steps) ? args.element.steps : [];
    if (stepsSpec.length < 2 || stepsSpec.length > 12) {
        args.hardErrors.push(`${prefix} chevron_steps_invalid`);
    }
    const chevronProfile = args.theme.flowProfiles.flowChevron;
    const paddingXPt = chevronProfile.innerPadXPt;
    const paddingYPt = chevronProfile.innerPadYPt;
    const paddingXIn = ptToIn(paddingXPt);
    const paddingYIn = ptToIn(paddingYPt);
    const flowLayout = computeFlowLayout({
        region: args.bbox,
        count: stepsSpec.length,
        orientation: "horizontal",
        kind: "chevron",
        theme: args.theme,
        layoutProfile: args.element.layoutProfile,
    });
    const gapIn = flowLayout.gapX;
    if (flowLayout.stepW <= 0 || flowLayout.stepH <= 0) {
        args.hardErrors.push(`${prefix} chevron_overflow`);
    }
    const rawTipIn = Math.min(flowLayout.stepH * CHEVRON_TIP_DEPTH_RATIO_MAX, CHEVRON_TIP_DEPTH_MAX_IN);
    const minTextPaddingIn = ptToIn(paddingXPt * 2 + CHEVRON_MIN_TEXT_PADDING_EXTRA_PT);
    const maxTipIn = Math.max(0, flowLayout.stepW - minTextPaddingIn);
    const tipIn = clamp(rawTipIn, 0, maxTipIn);
    const useTrapezoidFallback = flowLayout.stepW < (2 * tipIn + minTextPaddingIn);
    const notchIn = useTrapezoidFallback ? 0 : tipIn;
    const font = args.theme.fontScale.body;
    const bold = font.weight >= args.theme.type.weightBold;
    const textPaddingXIn = ptToIn(paddingXPt);
    const textPaddingYIn = ptToIn(paddingYPt);
    const iconSizeTargetPt = args.theme.chevron.step.iconSizePt;
    const iconMinPt = args.theme.chevron.step.iconMinSizePt;
    const iconGapPt = args.theme.chevron.step.iconGapPt;
    const iconSizePt = Math.max(iconSizeTargetPt, iconMinPt);
    const iconSizeIn = ptToIn(iconSizePt);
    const preparedSteps = [];
    stepsSpec.forEach((stepSpec, idx) => {
        if (typeof stepSpec.label !== "string" || stepSpec.label.trim().length === 0) {
            args.hardErrors.push(`${prefix} chevron_step_invalid (${idx + 1})`);
        }
        const stepLayout = flowLayout.steps[idx];
        const stepX = stepLayout?.x ?? args.bbox.x;
        const stepY = stepLayout?.y ?? args.bbox.y;
        const isFirst = idx === 0;
        const isLast = idx === stepsSpec.length - 1;
        const { bbox: stepBox, points } = computeStepPoints({
            x: stepX,
            y: stepY,
            width: stepLayout?.width ?? flowLayout.stepW,
            height: stepLayout?.height ?? flowLayout.stepH,
            notch: notchIn,
            tip: tipIn,
            isFirst,
            isLast,
        });
        const leftInset = (isFirst ? 0 : notchIn) + textPaddingXIn;
        const rightInset = (isLast ? 0 : tipIn) + textPaddingXIn;
        const contentBox = {
            x: stepBox.x + leftInset,
            y: stepBox.y + textPaddingYIn,
            width: Math.max(0, stepBox.width - leftInset - rightInset),
            height: Math.max(0, stepBox.height - textPaddingYIn * 2),
        };
        let iconBox;
        let labelBox = contentBox;
        let labelValue = typeof stepSpec.label === "string" ? normalizeText(stepSpec.label) : "";
        let labelFontSize = font.size;
        let overflow = false;
        if (stepSpec.icon) {
            const availableHeightPt = contentBox.height * 72;
            const availableWidthPt = contentBox.width * 72;
            if (availableHeightPt < iconMinPt - 0.01 ||
                availableWidthPt < iconMinPt - 0.01 ||
                iconSizePt > availableHeightPt + 0.01 ||
                iconSizePt > availableWidthPt + 0.01) {
                args.hardErrors.push(`${prefix} chevron_icon_too_small`);
            }
            const labelHeightBudgetPt = availableHeightPt - iconSizePt - iconGapPt;
            if (labelHeightBudgetPt <= 0) {
                args.hardErrors.push(`${prefix} chevron_label_overflow`);
                overflow = true;
            }
            const labelBoxCandidate = {
                x: contentBox.x,
                y: contentBox.y,
                width: contentBox.width,
                height: Math.max(0, labelHeightBudgetPt / 72),
            };
            const fitted = fitChevronLabel({
                text: labelValue,
                fontSize: font.size,
                minFontSize: CHEVRON_LABEL_MIN_FONT_PT,
                bold,
                bbox: labelBoxCandidate,
                lineHeight: DEFAULT_LINE_HEIGHT,
            });
            if (fitted.overflow) {
                args.hardErrors.push(`${prefix} chevron_label_overflow`);
                overflow = true;
            }
            labelValue = fitted.text;
            labelFontSize = fitted.fontSize;
            const labelHeightIn = fitted.requiredHeightPt / 72;
            const totalContentPt = iconSizePt + iconGapPt + fitted.requiredHeightPt;
            const startY = contentBox.y + ptToIn(Math.max(0, (availableHeightPt - totalContentPt) / 2));
            labelBox = {
                x: contentBox.x,
                y: startY + ptToIn(iconSizePt + iconGapPt),
                width: contentBox.width,
                height: Math.max(0, labelHeightIn),
            };
            const iconResult = resolveIconData({
                name: stepSpec.icon,
                color: normalizeColor(args.theme.text.colorPrimary, args.theme.text.colorPrimary),
            });
            if (iconResult.error || !iconResult.data) {
                args.hardErrors.push(`${prefix} icon_not_found`);
            }
            else {
                iconBox = {
                    bbox: {
                        x: contentBox.x + Math.max(0, (contentBox.width - iconSizeIn) / 2),
                        y: startY,
                        width: iconSizeIn,
                        height: iconSizeIn,
                    },
                    data: iconResult.data,
                };
            }
        }
        else {
            const fitted = fitChevronLabel({
                text: labelValue,
                fontSize: font.size,
                minFontSize: CHEVRON_LABEL_MIN_FONT_PT,
                bold,
                bbox: contentBox,
                lineHeight: DEFAULT_LINE_HEIGHT,
            });
            if (fitted.overflow) {
                args.hardErrors.push(`${prefix} chevron_label_overflow`);
                overflow = true;
            }
            labelValue = fitted.text;
            labelFontSize = fitted.fontSize;
            const labelHeightIn = fitted.requiredHeightPt / 72;
            labelBox = {
                x: contentBox.x,
                y: contentBox.y + Math.max(0, (contentBox.height - labelHeightIn) / 2),
                width: contentBox.width,
                height: Math.max(0, labelHeightIn),
            };
        }
        const fill = resolveStepFill(args.theme, idx);
        const stroke = args.theme.module.stroke;
        preparedSteps.push({
            bbox: {
                x: roundInches(stepBox.x),
                y: roundInches(stepBox.y),
                width: roundInches(stepBox.width),
                height: roundInches(stepBox.height),
            },
            points: points.map((point) => {
                if ("close" in point) {
                    return point;
                }
                return {
                    x: roundInches(point.x - stepBox.x),
                    y: roundInches(point.y - stepBox.y),
                    moveTo: point.moveTo,
                };
            }),
            fill,
            stroke,
            text: {
                value: labelValue,
                bbox: {
                    x: roundInches(labelBox.x),
                    y: roundInches(labelBox.y),
                    width: roundInches(labelBox.width),
                    height: roundInches(labelBox.height),
                },
                fontFace: font.family,
                fontSize: labelFontSize,
                bold,
                color: args.theme.text.colorPrimary,
            },
            icon: iconBox
                ? {
                    bbox: {
                        x: roundInches(iconBox.bbox.x),
                        y: roundInches(iconBox.bbox.y),
                        width: roundInches(iconBox.bbox.width),
                        height: roundInches(iconBox.bbox.height),
                    },
                    data: iconBox.data,
                }
                : undefined,
            textOverflow: overflow,
        });
    });
    const groupBBox = preparedSteps.reduce((current, step) => {
        if (!current) {
            return { ...step.bbox };
        }
        const x0 = Math.min(current.x, step.bbox.x);
        const y0 = Math.min(current.y, step.bbox.y);
        const x1 = Math.max(current.x + current.width, step.bbox.x + step.bbox.width);
        const y1 = Math.max(current.y + current.height, step.bbox.y + step.bbox.height);
        return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
    }, null);
    const roundedGroupBBox = groupBBox
        ? {
            x: roundInches(groupBBox.x),
            y: roundInches(groupBBox.y),
            width: roundInches(groupBBox.width),
            height: roundInches(groupBBox.height),
        }
        : null;
    return {
        kind: "chevron_flow",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        bbox: args.bbox,
        steps: preparedSteps,
        layoutProfile: args.element.layoutProfile,
        metrics: roundedGroupBBox
            ? {
                groupBBox: roundedGroupBBox,
                notchIn,
                tipIn,
                gapIn,
                stepCount: preparedSteps.length,
            }
            : undefined,
    };
}
export function renderChevronFlowElement(slide, shapeType, element, theme) {
    element.steps.forEach((step) => {
        slide.addShape(shapeType.custGeom, {
            x: step.bbox.x,
            y: step.bbox.y,
            w: step.bbox.width,
            h: step.bbox.height,
            points: step.points,
            fill: { color: step.fill },
            line: { color: step.stroke, width: theme.strokeScale.thin },
        });
        if (step.icon) {
            slide.addImage({
                data: step.icon.data,
                x: step.icon.bbox.x,
                y: step.icon.bbox.y,
                w: step.icon.bbox.width,
                h: step.icon.bbox.height,
            });
        }
        slide.addText(step.text.value, {
            x: step.text.bbox.x,
            y: step.text.bbox.y,
            w: step.text.bbox.width,
            h: step.text.bbox.height,
            fontFace: step.text.fontFace,
            fontSize: step.text.fontSize,
            bold: step.text.bold,
            color: step.text.color,
            align: "center",
            valign: "middle",
            margin: 0,
            breakLine: true,
            lineSpacingMultiple: DEFAULT_LINE_HEIGHT,
        });
    });
}
//# sourceMappingURL=chevron.js.map