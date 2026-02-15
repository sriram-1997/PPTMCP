import { normalizeColor } from "./utils/color.js";
import { ptToIn } from "./utils/units.js";
import { estimateTextLayout } from "./text.js";
import { resolveIconData } from "./utils/icons.js";
import { layoutList, renderListLayout } from "./list.js";
function resolveCardPadding(value, theme) {
    const sm = theme.spaceScale[2] ?? theme.spaceScale[1] ?? 0;
    const md = theme.spaceScale[3] ?? sm;
    const lg = theme.spaceScale[4] ?? md;
    if (value === "sm") {
        return sm;
    }
    if (value === "lg") {
        return lg;
    }
    return md;
}
function resolveCardRadius(value, theme) {
    const sm = theme.spaceScale[2] ?? theme.spaceScale[1] ?? 0;
    const md = theme.spaceScale[3] ?? sm;
    const lg = theme.spaceScale[4] ?? md;
    if (value === "sm") {
        return ptToIn(sm);
    }
    if (value === "lg") {
        return ptToIn(lg);
    }
    return ptToIn(md);
}
function resolveSurfaceToken(value, fallback, theme) {
    const token = value ?? fallback;
    return theme.surfaces[token];
}
function resolveCardBorder(value, theme) {
    if (value === "none") {
        return { color: theme.surfaces.surface.border, width: 0 };
    }
    if (value === "subtle") {
        return { color: theme.surfaces.surface.border, width: theme.strokeScale.thin };
    }
    return { color: theme.surfaces.surface.border, width: theme.strokeScale.normal };
}
function resolveShadow(value, theme) {
    if (value !== "sm") {
        return undefined;
    }
    const blur = theme.spaceScale[3] ?? theme.spaceScale[2] ?? theme.strokeScale.thin;
    const offset = theme.spaceScale[2] ?? theme.strokeScale.thin;
    const denom = theme.strokeScale.heavy + theme.strokeScale.normal;
    const opacity = denom > 0 ? theme.strokeScale.thin / denom : 0;
    return {
        type: "outer",
        opacity,
        blur,
        angle: 45,
        offset,
        color: theme.surfaces.surface.border,
    };
}
function resolveVariantDefaults(variant, theme) {
    const baseAccent = { edge: "none", color: "accent", width: theme.strokeScale.normal };
    if (variant === "elevated") {
        return {
            bg: "elevated",
            border: "default",
            radius: "md",
            padding: "md",
            shadow: "none",
            accent: baseAccent,
        };
    }
    if (variant === "accent") {
        return {
            bg: "accent",
            border: "default",
            radius: "md",
            padding: "md",
            shadow: "none",
            accent: baseAccent,
        };
    }
    return {
        bg: "surface",
        border: "default",
        radius: "md",
        padding: "md",
        shadow: "none",
        accent: baseAccent,
    };
}
function mergeCardStyle(base, override) {
    if (!override) {
        return base;
    }
    const mergedAccent = {
        ...base.accent,
        ...(override.accent ?? {}),
    };
    return {
        ...base,
        ...override,
        accent: mergedAccent,
    };
}
function estimateTextHeight(args) {
    if (!args.text) {
        return 0;
    }
    const estimate = estimateTextLayout({
        text: args.text,
        fontSize: args.fontSize,
        bold: args.bold,
        bbox: { x: 0, y: 0, width: args.widthIn, height: 10 },
        paddingPt: 0,
        lineHeight: args.lineHeight,
    });
    return estimate.requiredHeightPt;
}
function lineHeightMultiple(fontSize, theme) {
    const leading = theme.spaceScale[1] ?? theme.spaceScale[0] ?? 0;
    return Math.max(1, (fontSize + leading) / fontSize);
}
export function prepareCardElement(args) {
    const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
    const variantDefaults = resolveVariantDefaults(args.element.variant, args.theme);
    const styleSpec = mergeCardStyle(variantDefaults, args.element.style);
    const paddingPt = resolveCardPadding(styleSpec.padding, args.theme);
    const radius = resolveCardRadius(styleSpec.radius, args.theme);
    const surface = resolveSurfaceToken(styleSpec.bg, "surface", args.theme);
    const fill = surface.fill;
    const border = resolveCardBorder(styleSpec.border, args.theme);
    const shadow = resolveShadow(styleSpec.shadow, args.theme);
    const innerX = args.bbox.x + ptToIn(paddingPt);
    const innerY = args.bbox.y + ptToIn(paddingPt);
    const innerW = args.bbox.width - ptToIn(paddingPt * 2);
    const innerH = args.bbox.height - ptToIn(paddingPt * 2);
    if (innerW <= 0 || innerH <= 0) {
        args.hardErrors.push(`${prefix} card_overflow (zone=body overflowPx=${Math.round(Math.abs(innerH * 72))})`);
    }
    const headerGapPt = args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0;
    const footerGapPt = args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0;
    const minInsetPt = args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0;
    const minInsetIn = ptToIn(minInsetPt);
    let header;
    let headerHeightPt = 0;
    if (args.element.header) {
        const titleFont = args.theme.fontScale.subtitle;
        const subtitleFont = args.theme.fontScale.caption;
        const titleBold = titleFont.weight >= args.theme.type.weightBold;
        const subtitleBold = subtitleFont.weight >= args.theme.type.weightBold;
        const iconSizePt = args.element.header.icon
            ? Math.max(args.theme.spaceScale[5] ??
                args.theme.spaceScale[4] ??
                args.theme.spaceScale[3] ??
                args.theme.spaceScale[2] ??
                0, titleFont.size)
            : 0;
        const iconGapPt = args.element.header.icon ? (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0) : 0;
        const textWidthIn = innerW - ptToIn(iconSizePt + iconGapPt);
        const titleLineHeight = lineHeightMultiple(titleFont.size, args.theme);
        const subtitleLineHeight = lineHeightMultiple(subtitleFont.size, args.theme);
        const titleHeightPt = estimateTextHeight({
            text: args.element.header.title,
            fontSize: titleFont.size,
            bold: titleBold,
            widthIn: Math.max(minInsetIn, textWidthIn),
            lineHeight: titleLineHeight,
        });
        const subtitleHeightPt = args.element.header.subtitle
            ? estimateTextHeight({
                text: args.element.header.subtitle,
                fontSize: subtitleFont.size,
                bold: subtitleBold,
                widthIn: Math.max(minInsetIn, textWidthIn),
                lineHeight: subtitleLineHeight,
            })
            : 0;
        const subtitleGapPt = args.element.header.subtitle ? (args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0) : 0;
        const textBlockHeightPt = titleHeightPt + subtitleGapPt + subtitleHeightPt;
        headerHeightPt = Math.max(iconSizePt, textBlockHeightPt);
        let iconBox;
        let iconData;
        if (args.element.header.icon) {
            const iconResult = resolveIconData({
                name: args.element.header.icon,
                color: normalizeColor(args.theme.text.colorPrimary, args.theme.text.colorPrimary),
            });
            if (iconResult.error || !iconResult.data) {
                args.hardErrors.push(`${prefix} icon_not_found`);
            }
            else {
                iconData = iconResult.data;
            }
            const iconSizeIn = ptToIn(iconSizePt);
            iconBox = {
                x: innerX,
                y: innerY + ptToIn(Math.max(0, (headerHeightPt - iconSizePt) / 2)),
                width: iconSizeIn,
                height: iconSizeIn,
            };
        }
        const textX = innerX + ptToIn(iconSizePt + iconGapPt);
        const titleBox = {
            x: textX,
            y: innerY,
            width: Math.max(minInsetIn, textWidthIn),
            height: Math.max(minInsetIn, titleHeightPt / 72),
        };
        const subtitleBox = args.element.header.subtitle
            ? {
                x: textX,
                y: innerY + ptToIn(titleHeightPt + subtitleGapPt),
                width: Math.max(minInsetIn, textWidthIn),
                height: Math.max(minInsetIn, subtitleHeightPt / 72),
            }
            : undefined;
        header = {
            title: args.element.header.title,
            subtitle: args.element.header.subtitle,
            titleBox,
            subtitleBox,
            titleFont: {
                face: titleFont.family,
                size: titleFont.size,
                bold: titleBold,
                color: args.theme.text.colorPrimary,
            },
            subtitleFont: args.element.header.subtitle
                ? {
                    face: subtitleFont.family,
                    size: subtitleFont.size,
                    bold: subtitleBold,
                    color: args.theme.text.colorPrimary,
                }
                : undefined,
            iconBox,
            iconData,
        };
    }
    let footer;
    let footerHeightPt = 0;
    if (args.element.footer && (args.element.footer.label || args.element.footer.text)) {
        const footerPaddingPt = args.theme.spaceScale[0] ?? 0;
        const labelFont = args.theme.fontScale.body;
        const textFont = args.theme.fontScale.body;
        const labelBold = labelFont.weight >= args.theme.type.weightBold;
        const textBold = textFont.weight >= args.theme.type.weightBold;
        const footerContentWidthIn = innerW - ptToIn(footerPaddingPt * 2);
        const footerLineHeight = lineHeightMultiple(textFont.size, args.theme);
        const labelHeightPt = args.element.footer.label
            ? estimateTextHeight({
                text: args.element.footer.label,
                fontSize: labelFont.size,
                bold: labelBold,
                widthIn: Math.max(minInsetIn, footerContentWidthIn),
                lineHeight: footerLineHeight,
            })
            : 0;
        const textHeightPt = args.element.footer.text
            ? estimateTextHeight({
                text: args.element.footer.text,
                fontSize: textFont.size,
                bold: textBold,
                widthIn: Math.max(minInsetIn, footerContentWidthIn),
                lineHeight: footerLineHeight,
            })
            : 0;
        const footerTextGapPt = args.element.footer.label && args.element.footer.text
            ? (args.theme.spaceScale[1] ?? args.theme.spaceScale[0] ?? 0)
            : 0;
        const footerContentHeightPt = labelHeightPt + footerTextGapPt + textHeightPt;
        const footerStripHeightPt = args.theme.fontScale.body.size + (args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0);
        const footerAvailablePt = footerStripHeightPt - footerPaddingPt * 2;
        if (footerContentHeightPt > footerAvailablePt && args.hardErrors) {
            args.hardErrors.push(`${prefix} card_overflow (zone=footer overflowPx=${Math.round(footerContentHeightPt - footerAvailablePt)})`);
        }
        footerHeightPt = footerStripHeightPt;
        const footerY = args.bbox.y + args.bbox.height - ptToIn(paddingPt) - ptToIn(footerHeightPt);
        const labelBox = args.element.footer.label
            ? {
                x: innerX + ptToIn(footerPaddingPt),
                y: footerY + ptToIn(footerPaddingPt),
                width: Math.max(minInsetIn, footerContentWidthIn),
                height: Math.max(minInsetIn, labelHeightPt / 72),
            }
            : undefined;
        const textBox = args.element.footer.text
            ? {
                x: innerX + ptToIn(footerPaddingPt),
                y: footerY + ptToIn(footerPaddingPt + labelHeightPt + footerTextGapPt),
                width: Math.max(minInsetIn, footerContentWidthIn),
                height: Math.max(minInsetIn, textHeightPt / 72),
            }
            : undefined;
        footer = {
            strip: args.element.footer.strip !== false,
            bbox: {
                x: args.bbox.x,
                y: footerY,
                width: args.bbox.width,
                height: ptToIn(footerHeightPt),
            },
            label: args.element.footer.label,
            text: args.element.footer.text,
            labelFont: labelBox
                ? {
                    face: labelFont.family,
                    size: labelFont.size,
                    bold: true,
                    color: args.theme.text.colorPrimary,
                }
                : undefined,
            textFont: textBox
                ? {
                    face: textFont.family,
                    size: textFont.size,
                    bold: false,
                    color: args.theme.text.colorPrimary,
                }
                : undefined,
            labelBox,
            textBox,
            stripFill: args.theme.surfaces.elevated.fill,
        };
    }
    let availableHeightPt = innerH * 72;
    if (headerHeightPt > availableHeightPt && args.hardErrors) {
        args.hardErrors.push(`${prefix} card_overflow (zone=header overflowPx=${Math.round(headerHeightPt - availableHeightPt)})`);
    }
    availableHeightPt -= headerHeightPt > 0 ? headerHeightPt + headerGapPt : 0;
    if (footerHeightPt > availableHeightPt && args.hardErrors) {
        args.hardErrors.push(`${prefix} card_overflow (zone=footer overflowPx=${Math.round(footerHeightPt - availableHeightPt)})`);
    }
    availableHeightPt -= footerHeightPt > 0 ? footerHeightPt + footerGapPt : 0;
    const bodyX = innerX;
    const bodyY = innerY + ptToIn(headerHeightPt > 0 ? headerHeightPt + headerGapPt : 0);
    const bodyW = innerW;
    const bodyH = Math.max(0, availableHeightPt / 72);
    const bodyLayouts = [];
    let bodyCursorY = bodyY;
    let bodyUsedPt = 0;
    const bodyGapPt = args.theme.spaceScale[2] ?? args.theme.spaceScale[1] ?? 0;
    (args.element.body ?? []).forEach((bodyItem, idx) => {
        const listLayout = layoutList({
            list: bodyItem,
            bbox: { x: bodyX, y: bodyCursorY, width: bodyW, height: bodyH },
            theme: args.theme,
            hardErrors: args.hardErrors,
            prefix,
            enforceFit: false,
        });
        bodyLayouts.push(listLayout);
        bodyCursorY += ptToIn(listLayout.totalHeightPt);
        bodyUsedPt += listLayout.totalHeightPt;
        if (idx < args.element.body.length - 1) {
            bodyCursorY += ptToIn(bodyGapPt);
            bodyUsedPt += bodyGapPt;
        }
    });
    const overflowEpsilonPt = args.theme.strokeScale.thin;
    if (bodyUsedPt > availableHeightPt + overflowEpsilonPt && args.hardErrors) {
        args.hardErrors.push(`${prefix} card_overflow (zone=body overflowPx=${Math.round(bodyUsedPt - availableHeightPt)})`);
    }
    let accent;
    if (styleSpec.accent && styleSpec.accent.edge && styleSpec.accent.edge !== "none") {
        const accentWidthPt = typeof styleSpec.accent.width === "number" ? styleSpec.accent.width : args.theme.strokeScale.normal;
        const accentColor = normalizeColor(args.theme.surfaces.accent.fill, args.theme.surfaces.accent.fill);
        if (styleSpec.accent.edge === "left") {
            accent = {
                edge: "left",
                color: accentColor,
                bbox: {
                    x: args.bbox.x,
                    y: args.bbox.y,
                    width: ptToIn(accentWidthPt),
                    height: args.bbox.height,
                },
            };
        }
        else if (styleSpec.accent.edge === "top") {
            accent = {
                edge: "top",
                color: accentColor,
                bbox: {
                    x: args.bbox.x,
                    y: args.bbox.y,
                    width: args.bbox.width,
                    height: ptToIn(accentWidthPt),
                },
            };
        }
    }
    return {
        kind: "card",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        bbox: args.bbox,
        style: {
            fill,
            border: border.color,
            borderWidth: border.width,
            radius,
            shadow,
        },
        accent,
        header,
        body: bodyLayouts,
        footer,
    };
}
export function renderCardElement(slide, shapeType, element) {
    const shape = element.style.radius > 0 ? shapeType.roundRect : shapeType.rect;
    slide.addShape(shape, {
        x: element.bbox.x,
        y: element.bbox.y,
        w: element.bbox.width,
        h: element.bbox.height,
        fill: { color: element.style.fill },
        line: { color: element.style.border, width: element.style.borderWidth },
        rectRadius: element.style.radius,
        shadow: element.style.shadow,
    });
    if (element.accent) {
        slide.addShape(shapeType.rect, {
            x: element.accent.bbox.x,
            y: element.accent.bbox.y,
            w: element.accent.bbox.width,
            h: element.accent.bbox.height,
            fill: { color: element.accent.color },
            line: { color: element.accent.color, width: 0 },
        });
    }
    if (element.header) {
        if (element.header.iconBox && element.header.iconData) {
            slide.addImage({
                data: element.header.iconData,
                x: element.header.iconBox.x,
                y: element.header.iconBox.y,
                w: element.header.iconBox.width,
                h: element.header.iconBox.height,
            });
        }
        slide.addText(element.header.title, {
            x: element.header.titleBox.x,
            y: element.header.titleBox.y,
            w: element.header.titleBox.width,
            h: element.header.titleBox.height,
            fontFace: element.header.titleFont.face,
            fontSize: element.header.titleFont.size,
            bold: element.header.titleFont.bold,
            color: element.header.titleFont.color,
            align: "left",
            valign: "top",
            margin: 0,
        });
        if (element.header.subtitle && element.header.subtitleBox && element.header.subtitleFont) {
            slide.addText(element.header.subtitle, {
                x: element.header.subtitleBox.x,
                y: element.header.subtitleBox.y,
                w: element.header.subtitleBox.width,
                h: element.header.subtitleBox.height,
                fontFace: element.header.subtitleFont.face,
                fontSize: element.header.subtitleFont.size,
                bold: element.header.subtitleFont.bold,
                color: element.header.subtitleFont.color,
                align: "left",
                valign: "top",
                margin: 0,
            });
        }
    }
    element.body.forEach((layout) => {
        renderListLayout(slide, shapeType, layout);
    });
    if (element.footer) {
        if (element.footer.strip) {
            slide.addShape(shapeType.rect, {
                x: element.footer.bbox.x,
                y: element.footer.bbox.y,
                w: element.footer.bbox.width,
                h: element.footer.bbox.height,
                fill: { color: element.footer.stripFill ?? "FFFFFF" },
                line: { color: element.footer.stripFill ?? "FFFFFF", width: 0 },
            });
        }
        if (element.footer.label && element.footer.labelBox && element.footer.labelFont) {
            slide.addText(element.footer.label, {
                x: element.footer.labelBox.x,
                y: element.footer.labelBox.y,
                w: element.footer.labelBox.width,
                h: element.footer.labelBox.height,
                fontFace: element.footer.labelFont.face,
                fontSize: element.footer.labelFont.size,
                bold: element.footer.labelFont.bold,
                color: element.footer.labelFont.color,
                align: "left",
                valign: "top",
                margin: 0,
            });
        }
        if (element.footer.text && element.footer.textBox && element.footer.textFont) {
            slide.addText(element.footer.text, {
                x: element.footer.textBox.x,
                y: element.footer.textBox.y,
                w: element.footer.textBox.width,
                h: element.footer.textBox.height,
                fontFace: element.footer.textFont.face,
                fontSize: element.footer.textFont.size,
                bold: element.footer.textFont.bold,
                color: element.footer.textFont.color,
                align: "left",
                valign: "top",
                margin: 0,
            });
        }
    }
}
//# sourceMappingURL=card.js.map