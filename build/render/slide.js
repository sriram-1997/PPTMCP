import { EPSILON_INCHES, SLIDE_HEIGHT_INCHES, SLIDE_WIDTH_INCHES, ptToIn, roundInches } from "./utils/units.js";
import { prepareTextElement } from "./text.js";
import { prepareTableElement } from "./table.js";
import { prepareChartElement } from "./chart.js";
import { prepareCalloutElement } from "./callout.js";
import { prepareConnectorElement } from "./connector.js";
import { prepareImageElement } from "./image.js";
export function computeRegionBBox(region, grid) {
    const { cols, rows, gutter } = grid;
    const totalGutterWidth = (cols - 1) * gutter;
    const totalGutterHeight = (rows - 1) * gutter;
    const cellWidth = (SLIDE_WIDTH_INCHES - totalGutterWidth) / cols;
    const cellHeight = (SLIDE_HEIGHT_INCHES - totalGutterHeight) / rows;
    const x = region.col * cellWidth + region.col * gutter;
    const y = region.row * cellHeight + region.row * gutter;
    const width = region.colSpan * cellWidth + (region.colSpan - 1) * gutter;
    const height = region.rowSpan * cellHeight + (region.rowSpan - 1) * gutter;
    return { x, y, width, height };
}
function anchorPointFromRegion(bbox, point) {
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
export function resolveRegionAnchor(args) {
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
export function isPointInside(bbox, point) {
    return (point.x >= bbox.x - EPSILON_INCHES &&
        point.y >= bbox.y - EPSILON_INCHES &&
        point.x <= bbox.x + bbox.width + EPSILON_INCHES &&
        point.y <= bbox.y + bbox.height + EPSILON_INCHES);
}
export function isBoxInside(container, box) {
    return (box.x >= container.x - EPSILON_INCHES &&
        box.y >= container.y - EPSILON_INCHES &&
        box.x + box.width <= container.x + container.width + EPSILON_INCHES &&
        box.y + box.height <= container.y + container.height + EPSILON_INCHES);
}
export function nearestPointOnBoxPerimeter(box, point) {
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
function regionWithinSlide(bbox) {
    return (bbox.x >= -EPSILON_INCHES &&
        bbox.y >= -EPSILON_INCHES &&
        bbox.width > 0 &&
        bbox.height > 0 &&
        bbox.x + bbox.width <= SLIDE_WIDTH_INCHES + EPSILON_INCHES &&
        bbox.y + bbox.height <= SLIDE_HEIGHT_INCHES + EPSILON_INCHES);
}
export function prepareSlides(args) {
    const preparedSlides = [];
    args.spec.slides.forEach((slideSpec, slideIndex) => {
        const preparedElements = [];
        for (let elementIndex = 0; elementIndex < slideSpec.elements.length; elementIndex += 1) {
            const element = slideSpec.elements[elementIndex];
            const z = Number.isFinite(element.z) ? element.z : 0;
            const order = elementIndex;
            const id = typeof element.id === "string"
                ? String(element.id)
                : `${element.type}-${slideIndex + 1}-${elementIndex + 1}`;
            const region = slideSpec.regions[element.region];
            const bbox = computeRegionBBox(region, slideSpec.grid);
            if (!regionWithinSlide(bbox)) {
                throw new Error(`Slide ${slideIndex + 1} region '${element.region}' is out of slide bounds`);
            }
            if (element.type === "text") {
                preparedElements.push(prepareTextElement({
                    slide: slideSpec,
                    slideIndex,
                    element: element,
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
                }));
            }
            else if (element.type === "table") {
                preparedElements.push(prepareTableElement({
                    slide: slideSpec,
                    slideIndex,
                    element: element,
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
                }));
            }
            else if (element.type === "chart") {
                preparedElements.push(prepareChartElement({
                    slideIndex,
                    elementIndex,
                    element: element,
                    bbox,
                    z,
                    order,
                    id,
                    allowDenseCharts: args.allowDenseCharts,
                    warnings: args.warnings,
                    hardErrors: args.hardErrors,
                }));
            }
            else if (element.type === "callout") {
                preparedElements.push(prepareCalloutElement({
                    slide: slideSpec,
                    slideIndex,
                    element: element,
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
                }));
            }
            else if (element.type === "connector") {
                preparedElements.push(prepareConnectorElement({
                    slide: slideSpec,
                    slideIndex,
                    element: element,
                    elementIndex,
                    z,
                    order,
                    id,
                    bbox,
                    theme: args.theme,
                    hardErrors: args.hardErrors,
                }));
            }
            else if (element.type === "image") {
                preparedElements.push(prepareImageElement({
                    slide: slideSpec,
                    slideIndex,
                    element: element,
                    elementIndex,
                    z,
                    order,
                    id,
                    bbox,
                    theme: args.theme,
                    baseDir: args.baseDir,
                    hardErrors: args.hardErrors,
                }));
            }
            else {
                throw new Error(`Slide ${slideIndex + 1} element ${elementIndex + 1}: unsupported element type`);
            }
        }
        preparedElements.sort((a, b) => (a.z - b.z) || (a.order - b.order));
        preparedSlides.push({ elements: preparedElements });
    });
    return preparedSlides;
}
export function buildIntegrityDebug(args) {
    const slidesReport = [];
    let chartCount = 0;
    let shapeCount = 0;
    let textCount = 0;
    let tableCount = 0;
    args.preparedSlides.forEach((slidePlan, slideIdx) => {
        const slideSpec = args.spec.slides[slideIdx];
        const warningsLocal = [];
        const renderList = [];
        slidePlan.elements.forEach((element, renderIndex) => {
            const regionSpec = slideSpec.regions[element.region];
            const regionRect = computeRegionBBox(regionSpec, slideSpec.grid);
            const entryBase = {
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
            const addWarning = (code, message) => {
                warningsLocal.push({ code, message });
            };
            const addIntegrityWarning = (message) => {
                addWarning("INTEGRITY_WARNINGS", message);
            };
            const checkPoint = (label, point) => {
                if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
                    addWarning("INTEGRITY_WARN_NAN", `${label} has NaN/Inf`);
                    addIntegrityWarning(`${label} has NaN/Inf`);
                }
                if (point.x < -EPSILON_INCHES ||
                    point.y < -EPSILON_INCHES ||
                    point.x > SLIDE_WIDTH_INCHES + EPSILON_INCHES ||
                    point.y > SLIDE_HEIGHT_INCHES + EPSILON_INCHES) {
                    addWarning("INTEGRITY_WARN_OUTSIDE", `${label} outside slide bounds`);
                    addIntegrityWarning(`${label} outside slide bounds`);
                }
            };
            const checkBox = (label, box) => {
                if (!Number.isFinite(box.x) || !Number.isFinite(box.y) || !Number.isFinite(box.width) || !Number.isFinite(box.height)) {
                    addWarning("INTEGRITY_WARN_NAN", `${label} has NaN/Inf`);
                    addIntegrityWarning(`${label} has NaN/Inf`);
                }
                if (box.width < 0 || box.height < 0) {
                    addWarning("INTEGRITY_WARN_NEGATIVE", `${label} has negative w/h`);
                    addIntegrityWarning(`${label} has negative w/h`);
                }
                if (box.x < -EPSILON_INCHES ||
                    box.y < -EPSILON_INCHES ||
                    box.x + box.width > SLIDE_WIDTH_INCHES + EPSILON_INCHES ||
                    box.y + box.height > SLIDE_HEIGHT_INCHES + EPSILON_INCHES) {
                    addWarning("INTEGRITY_WARN_OUTSIDE", `${label} outside slide bounds`);
                    addIntegrityWarning(`${label} outside slide bounds`);
                }
            };
            const checkLine = (label, start, end, widthPt) => {
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
            }
            else if (element.kind === "table") {
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
            }
            else if (element.kind === "chart") {
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
            }
            else if (element.kind === "connector") {
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
            }
            else if (element.kind === "callout") {
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
//# sourceMappingURL=slide.js.map