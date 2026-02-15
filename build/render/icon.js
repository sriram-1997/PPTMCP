import { ptToIn } from "./utils/units.js";
import { normalizeColor } from "./utils/color.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
import { resolveIconData } from "./utils/icons.js";
function resolveIconColor(slot, theme) {
    if (slot === "text.caption") {
        return theme.text.colorSecondary;
    }
    return theme.text.colorPrimary;
}
function resolveAlign(value) {
    if (value === "left" || value === "right") {
        return value;
    }
    return "center";
}
function resolveVerticalAlign(value) {
    if (value === "top" || value === "bottom") {
        return value;
    }
    return "middle";
}
export function prepareIconElement(args) {
    const prefix = `Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}:`;
    const iconResult = resolveIconData({ name: args.element.name, color: "000000" });
    if (iconResult.error) {
        args.hardErrors.push(`${prefix} ${iconResult.error}`);
    }
    const sizeToken = args.element.sizeToken;
    const sizePt = Number.isInteger(sizeToken) ? args.theme.spaceScale[sizeToken] : undefined;
    if (!Number.isFinite(sizePt) || sizePt <= 0) {
        args.hardErrors.push(`${prefix} icon_invalid`);
    }
    const color = resolveIconColor(args.element.colorSlot, args.theme);
    const colorHex = normalizeColor(`#${color}`, color);
    const svgResult = resolveIconData({ name: args.element.name, color: colorHex });
    if (svgResult.error) {
        args.hardErrors.push(`${prefix} ${svgResult.error}`);
    }
    const svgData = svgResult.data ?? "";
    const sizeIn = ptToIn(sizePt || 0);
    const align = resolveAlign(args.element.align);
    const valign = resolveVerticalAlign(args.element.verticalAlign);
    let x = args.bbox.x;
    let y = args.bbox.y;
    if (align === "center") {
        x = args.bbox.x + (args.bbox.width - sizeIn) / 2;
    }
    else if (align === "right") {
        x = args.bbox.x + args.bbox.width - sizeIn;
    }
    if (valign === "middle") {
        y = args.bbox.y + (args.bbox.height - sizeIn) / 2;
    }
    else if (valign === "bottom") {
        y = args.bbox.y + args.bbox.height - sizeIn;
    }
    const defaults = resolveElementStyleDefaults(args.element, args.theme);
    const boxStyle = defaults.boxStyle
        ? {
            fill: defaults.boxStyle.fill,
            border: defaults.boxStyle.border,
            borderWidth: defaults.boxStyle.borderWidth,
        }
        : undefined;
    return {
        kind: "icon",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        bbox: { x, y, width: sizeIn, height: sizeIn },
        data: svgData,
        boxStyle,
    };
}
export function renderIconElement(slide, shapeType, element) {
    if (element.boxStyle) {
        slide.addShape(shapeType.rect, {
            x: element.bbox.x,
            y: element.bbox.y,
            w: element.bbox.width,
            h: element.bbox.height,
            fill: { color: element.boxStyle.fill },
            line: { color: element.boxStyle.border, width: element.boxStyle.borderWidth },
        });
    }
    slide.addImage({
        data: element.data,
        x: element.bbox.x,
        y: element.bbox.y,
        w: element.bbox.width,
        h: element.bbox.height,
    });
}
//# sourceMappingURL=icon.js.map