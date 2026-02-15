import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { normalizeColor } from "./utils/color.js";
import { roundInches } from "./utils/units.js";
import { addValidationEntry, buildOverflowMessage } from "./validate.js";
import { estimateTextLayout, textUnits, truncateTextToFit } from "./text.js";
const DEFAULT_MIN_FONT = 10;
const DEFAULT_TABLE_PADDING_PT = 2;
function resolveTableStyle(style, theme, defaults) {
    const bodySize = style?.fontSize ?? theme.fontScale.caption.size;
    const headerSize = style?.headerFontSize ?? Math.max(bodySize + 1, theme.fontScale.caption.size + 1);
    const defaultPadding = theme.spaceScale[2] ?? DEFAULT_TABLE_PADDING_PT;
    return {
        borderColor: normalizeColor(style?.borderColor, defaults?.border ?? theme.table.border),
        borderWidth: style?.borderWidth ?? defaults?.borderWidth ?? theme.strokeScale.thin,
        headerColor: normalizeColor(style?.headerColor, defaults?.fill ?? theme.table.headerFill),
        headerTextColor: normalizeColor(style?.headerTextColor, defaults?.textColor ?? theme.table.headerTextColor),
        bodyColor: defaults?.fill ?? theme.table.bodyFill,
        bodyTextColor: defaults?.textColor ?? theme.table.bodyTextColor,
        fit: style?.fit ?? "shrink",
        minFont: style?.minFont ?? DEFAULT_MIN_FONT,
        fontSize: bodySize,
        headerFontSize: headerSize,
        cellPaddingPt: style?.cellPaddingPt ?? defaultPadding,
        lineHeight: style?.lineHeight ?? 1.16,
    };
}
function tableCellText(cell) {
    if (!cell) {
        return "";
    }
    if (typeof cell === "string") {
        return cell;
    }
    return typeof cell.text === "string" ? cell.text : "";
}
function tableCellStyle(cell) {
    if (!cell || typeof cell === "string") {
        return {};
    }
    return {
        bold: cell.style?.bold,
        color: cell.style?.color ? normalizeColor(cell.style.color, "000000") : undefined,
    };
}
function estimateTableLayout(args) {
    const colCount = Math.max(args.headers.length, ...args.rows.map((row) => row.length), 1);
    const colWidthInches = args.bbox.width / colCount;
    const allRows = [
        args.headers.map((header) => header),
        ...args.rows.map((row) => row),
    ];
    const rowRequiredHeightsPt = [];
    const colRequiredWidthsPt = Array.from({ length: colCount }, () => 0);
    for (let rowIdx = 0; rowIdx < allRows.length; rowIdx += 1) {
        const isHeader = rowIdx === 0;
        const rowFont = isHeader ? args.headerFont : args.bodyFont;
        const row = allRows[rowIdx];
        let rowHeightPt = rowFont * args.lineHeight + args.paddingPt * 2;
        for (let colIdx = 0; colIdx < colCount; colIdx += 1) {
            const rawCell = row[colIdx];
            const text = tableCellText(rawCell);
            const style = tableCellStyle(rawCell);
            const estimate = estimateTextLayout({
                text,
                fontSize: rowFont,
                bold: isHeader || Boolean(style.bold),
                bbox: { x: 0, y: 0, width: colWidthInches, height: 100 },
                paddingPt: args.paddingPt,
                lineHeight: args.lineHeight,
            });
            rowHeightPt = Math.max(rowHeightPt, estimate.requiredHeightPt);
            const longestTokenUnits = text
                .split(/\s+/)
                .reduce((max, token) => Math.max(max, textUnits(token)), 0);
            colRequiredWidthsPt[colIdx] = Math.max(colRequiredWidthsPt[colIdx], longestTokenUnits * rowFont * (isHeader || style.bold ? 0.56 : 0.53) + args.paddingPt * 2);
        }
        rowRequiredHeightsPt.push(rowHeightPt);
    }
    const requiredWidthPt = colRequiredWidthsPt.reduce((sum, value) => sum + value, 0);
    const requiredHeightPt = rowRequiredHeightsPt.reduce((sum, value) => sum + value, 0);
    const availableWidthPt = args.bbox.width * 72;
    const availableHeightPt = args.bbox.height * 72;
    return {
        requiredWidthPt,
        requiredHeightPt,
        availableWidthPt,
        availableHeightPt,
        overflowWidth: requiredWidthPt > availableWidthPt + 0.2,
        overflowHeight: requiredHeightPt > availableHeightPt + 0.2,
        rowRequiredHeightsPt,
    };
}
function fitRowHeights(required, availableTotal, minRow) {
    if (required.length === 0) {
        return [];
    }
    const minTotal = minRow * required.length;
    if (availableTotal <= minTotal) {
        return Array.from({ length: required.length }, () => availableTotal / required.length);
    }
    const total = required.reduce((sum, value) => sum + value, 0);
    if (total <= availableTotal) {
        return required.slice();
    }
    const scaled = required.map((value) => Math.max(minRow, (value / total) * availableTotal));
    const scaledTotal = scaled.reduce((sum, value) => sum + value, 0);
    if (scaledTotal <= availableTotal) {
        return scaled;
    }
    const excess = scaledTotal - availableTotal;
    const adjustable = scaled.map((value) => Math.max(0, value - minRow));
    const adjustableTotal = adjustable.reduce((sum, value) => sum + value, 0);
    if (adjustableTotal <= 0) {
        return scaled;
    }
    return scaled.map((value, idx) => value - (adjustable[idx] / adjustableTotal) * excess);
}
export function prepareTableElement(args) {
    const defaults = resolveElementStyleDefaults(args.element, args.theme);
    const style = resolveTableStyle(args.element.style, args.theme, defaults.boxStyle);
    if (style.fontSize < style.minFont || style.headerFontSize < style.minFont) {
        throw new Error(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: table font below minFont ${style.minFont}`);
    }
    const emphasisIndex = typeof args.element.emphasisColumn === "number" && args.element.emphasisColumn >= 1
        ? args.element.emphasisColumn - 1
        : null;
    const columnAlign = Array.isArray(args.element.columnAlign) ? args.element.columnAlign : null;
    const useStriping = args.element.rowStriping === true;
    const stripeFillA = args.theme.surfaces.surface.fill;
    const stripeFillB = args.theme.surfaces.elevated.fill;
    const stripeTextColor = args.theme.text.colorPrimary;
    let bodyFont = style.fontSize;
    let headerFont = style.headerFontSize;
    let estimate = estimateTableLayout({
        headers: args.element.content.headers,
        rows: args.element.content.rows,
        bbox: args.bbox,
        bodyFont,
        headerFont,
        paddingPt: style.cellPaddingPt,
        lineHeight: style.lineHeight,
    });
    let action = "none";
    if ((estimate.overflowHeight || estimate.overflowWidth) && style.fit === "shrink") {
        const delta = style.headerFontSize - style.fontSize;
        for (let font = style.fontSize - 1; font >= style.minFont; font -= 1) {
            const candidateHeader = Math.max(style.minFont, font + Math.max(0, delta));
            const nextEstimate = estimateTableLayout({
                headers: args.element.content.headers,
                rows: args.element.content.rows,
                bbox: args.bbox,
                bodyFont: font,
                headerFont: candidateHeader,
                paddingPt: style.cellPaddingPt,
                lineHeight: style.lineHeight,
            });
            if (!nextEstimate.overflowHeight && !nextEstimate.overflowWidth) {
                bodyFont = font;
                headerFont = candidateHeader;
                estimate = nextEstimate;
                action = "shrink";
                break;
            }
        }
        if (estimate.overflowHeight || estimate.overflowWidth) {
            bodyFont = style.minFont;
            headerFont = Math.max(style.minFont, style.minFont + Math.max(0, delta));
            estimate = estimateTableLayout({
                headers: args.element.content.headers,
                rows: args.element.content.rows,
                bbox: args.bbox,
                bodyFont,
                headerFont,
                paddingPt: style.cellPaddingPt,
                lineHeight: style.lineHeight,
            });
        }
    }
    if (estimate.overflowHeight || estimate.overflowWidth) {
        action = args.allowOverflow ? "truncate" : "error";
        if (action === "truncate") {
            args.warnings.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: table truncated with ellipsis at font ${bodyFont}.`);
        }
    }
    const minRowPt = style.minFont * style.lineHeight + style.cellPaddingPt * 2;
    const rowHeightsPt = action === "truncate"
        ? fitRowHeights(estimate.rowRequiredHeightsPt, args.bbox.height * 72, minRowPt)
        : estimate.rowRequiredHeightsPt;
    const colCount = Math.max(args.element.content.headers.length, ...args.element.content.rows.map((row) => row.length), 1);
    const colWidthInches = args.bbox.width / colCount;
    const allRows = [
        args.element.content.headers.map((header) => header),
        ...args.element.content.rows,
    ];
    const rows = [];
    for (let rowIdx = 0; rowIdx < allRows.length; rowIdx += 1) {
        const isHeader = rowIdx === 0;
        const rowFont = isHeader ? headerFont : bodyFont;
        const rowHeightInches = (rowHeightsPt[rowIdx] ?? minRowPt) / 72;
        const rawRow = allRows[rowIdx];
        const cells = [];
        const bodyRowIdx = Math.max(0, rowIdx - 1);
        for (let colIdx = 0; colIdx < colCount; colIdx += 1) {
            const rawCell = rawRow[colIdx];
            const baseText = tableCellText(rawCell);
            const cellStyle = tableCellStyle(rawCell);
            let text = baseText;
            if (action === "truncate") {
                text = truncateTextToFit({
                    text: baseText,
                    fontSize: rowFont,
                    bold: isHeader || Boolean(cellStyle.bold),
                    bbox: { x: 0, y: 0, width: colWidthInches, height: rowHeightInches },
                    paddingPt: style.cellPaddingPt,
                    lineHeight: style.lineHeight,
                }).text;
            }
            let fillColor = isHeader ? style.headerColor : style.bodyColor;
            let textColor = isHeader ? style.headerTextColor : style.bodyTextColor;
            if (!isHeader && useStriping) {
                fillColor = bodyRowIdx % 2 === 0 ? stripeFillA : stripeFillB;
                textColor = stripeTextColor;
            }
            if (emphasisIndex !== null && colIdx === emphasisIndex) {
                fillColor = args.theme.surfaces.accent.fill;
                textColor = args.theme.surfaces.accent.textColor;
            }
            if (cellStyle.color) {
                textColor = cellStyle.color;
            }
            const options = {
                bold: isHeader || cellStyle.bold,
                color: textColor,
                fill: { color: fillColor },
                fontSize: rowFont,
                margin: style.cellPaddingPt,
                align: columnAlign ? columnAlign[colIdx] : undefined,
            };
            cells.push({ text, options });
        }
        rows.push(cells);
    }
    const entry = addValidationEntry({
        report: args.validationReport,
        slideIndex: args.slideIndex,
        slide: args.slide,
        elementIndex: args.elementIndex,
        elementType: "table",
        region: args.element.region,
        estimate,
        minFont: style.minFont,
        appliedFont: bodyFont,
        action,
        details: action === "none"
            ? "table fits region"
            : action === "shrink"
                ? `table shrunk to font ${bodyFont}`
                : action === "truncate"
                    ? `table truncated at font ${bodyFont}`
                    : `table overflow unresolved at minFont ${style.minFont}`,
    });
    if (action === "error") {
        args.hardErrors.push(buildOverflowMessage(entry));
    }
    return {
        kind: "table",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        variant: args.element.variant,
        bbox: args.bbox,
        rows,
        style: {
            borderColor: style.borderColor,
            borderWidth: style.borderWidth,
            rowHeightsInches: rowHeightsPt.map((pt) => roundInches(pt / 72)),
        },
    };
}
export function renderTableElement(slide, element) {
    const borderProps = { pt: element.style.borderWidth, color: element.style.borderColor };
    slide.addTable(element.rows, {
        x: element.bbox.x,
        y: element.bbox.y,
        w: element.bbox.width,
        h: element.bbox.height,
        rowH: element.style.rowHeightsInches,
        border: [borderProps, borderProps, borderProps, borderProps],
        margin: DEFAULT_TABLE_PADDING_PT,
    });
}
//# sourceMappingURL=table.js.map