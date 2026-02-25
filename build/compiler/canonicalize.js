import { SLIDE_HEIGHT_INCHES, SLIDE_WIDTH_INCHES, quantizeInchesToEmuStep, quantizePtToEmuStep, } from "../render/utils/units.js";
function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function quantizeInches(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
    }
    return quantizeInchesToEmuStep(value);
}
function quantizePt(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
    }
    return quantizePtToEmuStep(value);
}
function resolveLegacyCardPaddingPt(padding, themeSpaceScale) {
    if (!Array.isArray(themeSpaceScale) || themeSpaceScale.length === 0) {
        return undefined;
    }
    if (padding === "sm") {
        return themeSpaceScale[2] ?? themeSpaceScale[1] ?? 0;
    }
    if (padding === "lg") {
        return themeSpaceScale[4] ?? themeSpaceScale[3] ?? themeSpaceScale[2] ?? 0;
    }
    if (padding === "md") {
        return themeSpaceScale[3] ?? themeSpaceScale[2] ?? themeSpaceScale[1] ?? 0;
    }
    return undefined;
}
function computeRegionRect(region, grid) {
    const totalGutterWidth = (grid.cols - 1) * grid.gutter;
    const totalGutterHeight = (grid.rows - 1) * grid.gutter;
    const cellWidth = (SLIDE_WIDTH_INCHES - totalGutterWidth) / grid.cols;
    const cellHeight = (SLIDE_HEIGHT_INCHES - totalGutterHeight) / grid.rows;
    return {
        x: region.col * cellWidth + region.col * grid.gutter,
        y: region.row * cellHeight + region.row * grid.gutter,
        width: region.colSpan * cellWidth + (region.colSpan - 1) * grid.gutter,
        height: region.rowSpan * cellHeight + (region.rowSpan - 1) * grid.gutter,
    };
}
export function layerBucketForElementType(type) {
    if (type === "image") {
        return 1; // background
    }
    if (type === "card" || type === "table" || type === "chart" || type === "node" || type === "chevron_flow") {
        return 2; // surfaces
    }
    if (type === "icon") {
        return 3; // shapes
    }
    if (type === "connector" || type === "edge") {
        return 4; // connectors
    }
    if (type === "text" || type === "list") {
        return 5; // text
    }
    if (type === "callout") {
        return 6; // overlays
    }
    return 3;
}
function quantizeTextInsets(element) {
    if (!element.style) {
        return;
    }
    const paddingPt = quantizePt(element.style.paddingPt);
    if (typeof paddingPt === "number") {
        element.style.paddingPt = paddingPt;
    }
}
function quantizeListInsets(element) {
    if (element.bullet) {
        const gapPt = quantizePt(element.bullet.gap);
        if (typeof gapPt === "number") {
            element.bullet.gap = gapPt;
        }
    }
    if (element.indent) {
        const leftPt = quantizePt(element.indent.left);
        if (typeof leftPt === "number") {
            element.indent.left = leftPt;
        }
        const hangingPt = quantizePt(element.indent.hanging);
        if (typeof hangingPt === "number") {
            element.indent.hanging = hangingPt;
        }
    }
    const lineGapPt = quantizePt(element.lineGap);
    if (typeof lineGapPt === "number") {
        element.lineGap = lineGapPt;
    }
}
function normalizeCardPadding(element, slideIndex, elementIndex, themeSpaceScale) {
    if (!element.style) {
        return;
    }
    const style = element.style;
    const hasPaddingSlot = typeof style.paddingSlot !== "undefined";
    const hasPaddingPt = typeof style.paddingPt === "number" && Number.isFinite(style.paddingPt);
    if (hasPaddingSlot && hasPaddingPt) {
        throw new Error(`Slide ${slideIndex + 1} element ${elementIndex + 1}: card_padding_ambiguous`);
    }
    if (hasPaddingSlot) {
        const slot = style.paddingSlot;
        if (!Number.isInteger(slot) || slot < 0 || slot >= themeSpaceScale.length) {
            throw new Error(`Slide ${slideIndex + 1} element ${elementIndex + 1}: card_padding_ambiguous`);
        }
        style.paddingPt = themeSpaceScale[slot];
    }
    else if (!hasPaddingPt) {
        const legacyPaddingPt = resolveLegacyCardPaddingPt(style.padding, themeSpaceScale);
        if (typeof legacyPaddingPt === "number") {
            style.paddingPt = legacyPaddingPt;
        }
    }
    delete style.paddingSlot;
    delete style.padding;
    const paddingPt = quantizePt(style.paddingPt);
    if (typeof paddingPt === "number") {
        style.paddingPt = paddingPt;
    }
    if (style.accent) {
        const widthPt = quantizePt(style.accent.width);
        if (typeof widthPt === "number") {
            style.accent.width = widthPt;
        }
    }
}
function quantizeTableInsets(element) {
    if (!element.style) {
        return;
    }
    const borderWidth = quantizePt(element.style.borderWidth);
    if (typeof borderWidth === "number") {
        element.style.borderWidth = borderWidth;
    }
    const cellPaddingPt = quantizePt(element.style.cellPaddingPt);
    if (typeof cellPaddingPt === "number") {
        element.style.cellPaddingPt = cellPaddingPt;
    }
}
function quantizeCalloutGeometry(element) {
    if (element.anchor) {
        const dxPt = quantizePt(element.anchor.dxPt);
        if (typeof dxPt === "number") {
            element.anchor.dxPt = dxPt;
        }
        const dyPt = quantizePt(element.anchor.dyPt);
        if (typeof dyPt === "number") {
            element.anchor.dyPt = dyPt;
        }
    }
    if (element.box) {
        const wIn = quantizeInches(element.box.wIn);
        if (typeof wIn === "number") {
            element.box.wIn = wIn;
        }
        const hIn = quantizeInches(element.box.hIn);
        if (typeof hIn === "number") {
            element.box.hIn = hIn;
        }
        const paddingPt = quantizePt(element.box.paddingPt);
        if (typeof paddingPt === "number") {
            element.box.paddingPt = paddingPt;
        }
    }
    if (element.text?.style) {
        const paddingPt = quantizePt(element.text.style.paddingPt);
        if (typeof paddingPt === "number") {
            element.text.style.paddingPt = paddingPt;
        }
    }
}
function quantizeConnectorGeometry(element) {
    if (element.start) {
        const dxPt = quantizePt(element.start.dxPt);
        if (typeof dxPt === "number") {
            element.start.dxPt = dxPt;
        }
        const dyPt = quantizePt(element.start.dyPt);
        if (typeof dyPt === "number") {
            element.start.dyPt = dyPt;
        }
    }
    if (element.end) {
        const dxPt = quantizePt(element.end.dxPt);
        if (typeof dxPt === "number") {
            element.end.dxPt = dxPt;
        }
        const dyPt = quantizePt(element.end.dyPt);
        if (typeof dyPt === "number") {
            element.end.dyPt = dyPt;
        }
    }
    if (element.style) {
        const widthPt = quantizePt(element.style.widthPt);
        if (typeof widthPt === "number") {
            element.style.widthPt = widthPt;
        }
    }
}
function canonicalizeElement(element, slideIndex, elementIndex, themeSpaceScale) {
    if (element.type === "text") {
        quantizeTextInsets(element);
        return;
    }
    if (element.type === "list") {
        quantizeListInsets(element);
        return;
    }
    if (element.type === "card") {
        normalizeCardPadding(element, slideIndex, elementIndex, themeSpaceScale);
        return;
    }
    if (element.type === "table") {
        quantizeTableInsets(element);
        return;
    }
    if (element.type === "callout") {
        quantizeCalloutGeometry(element);
        return;
    }
    if (element.type === "connector") {
        quantizeConnectorGeometry(element);
        return;
    }
    if (element.type === "image" && isObject(element.style)) {
        const style = element.style;
        const borderWidthPt = quantizePt(style.borderWidthPt);
        if (typeof borderWidthPt === "number") {
            style.borderWidthPt = borderWidthPt;
        }
    }
}
export function canonicalizeIR(ir) {
    const cloned = JSON.parse(JSON.stringify(ir ?? {}));
    const themeSpaceScale = Array.isArray(cloned.__themeSpaceScale) && cloned.__themeSpaceScale.every((value) => typeof value === "number")
        ? [...cloned.__themeSpaceScale]
        : [];
    delete cloned.__themeSpaceScale;
    if (!Array.isArray(cloned.slides)) {
        return cloned;
    }
    cloned.slides.forEach((slide, slideIndex) => {
        const gutter = quantizeInches(slide.grid?.gutter);
        if (typeof gutter === "number" && slide.grid) {
            slide.grid.gutter = gutter;
        }
        if (slide.regions && isObject(slide.regions) && slide.grid) {
            for (const [regionName, rawRegion] of Object.entries(slide.regions)) {
                if (!isObject(rawRegion)) {
                    continue;
                }
                const region = rawRegion;
                if (typeof region.col !== "number" ||
                    typeof region.row !== "number" ||
                    typeof region.colSpan !== "number" ||
                    typeof region.rowSpan !== "number" ||
                    typeof slide.grid.cols !== "number" ||
                    typeof slide.grid.rows !== "number" ||
                    typeof slide.grid.gutter !== "number") {
                    continue;
                }
                const rect = computeRegionRect(region, slide.grid);
                region.__rect = {
                    x: quantizeInchesToEmuStep(rect.x),
                    y: quantizeInchesToEmuStep(rect.y),
                    width: quantizeInchesToEmuStep(rect.width),
                    height: quantizeInchesToEmuStep(rect.height),
                };
                slide.regions[regionName] = region;
            }
        }
        if (!Array.isArray(slide.elements)) {
            return;
        }
        slide.elements.forEach((element, elementIndex) => {
            canonicalizeElement(element, slideIndex, elementIndex, themeSpaceScale);
        });
        const sorted = slide.elements
            .map((element, index) => {
            const explicitId = typeof element.id === "string" && String(element.id).trim().length > 0
                ? String(element.id)
                : `${element.type}:${String(index).padStart(6, "0")}`;
            return {
                element,
                index,
                bucket: layerBucketForElementType(element.type),
                idKey: explicitId,
            };
        })
            .sort((a, b) => {
            if (a.bucket !== b.bucket) {
                return a.bucket - b.bucket;
            }
            const idCompare = a.idKey.localeCompare(b.idKey);
            if (idCompare !== 0) {
                return idCompare;
            }
            return a.index - b.index;
        });
        slide.elements = sorted.map((entry) => entry.element);
    });
    return cloned;
}
//# sourceMappingURL=canonicalize.js.map