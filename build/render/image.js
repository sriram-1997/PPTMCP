import fs from "fs";
import path from "path";
import { normalizeColor } from "./utils/color.js";
import { resolveElementStyleDefaults } from "../theme/styleDefaults.js";
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
function resolveImagePath(src, baseDir) {
    if (path.isAbsolute(src)) {
        return src;
    }
    return path.resolve(baseDir, src);
}
export function prepareImageElement(args) {
    const rawSrc = args.element.src;
    let resolvedPath = rawSrc || "";
    if (!rawSrc || rawSrc.trim().length === 0) {
        args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_not_found`);
    }
    else {
        resolvedPath = resolveImagePath(rawSrc, args.baseDir);
        const ext = path.extname(resolvedPath).toLowerCase();
        if (!SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
            args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_type_not_supported`);
        }
        if (!fs.existsSync(resolvedPath)) {
            args.hardErrors.push(`Slide ${args.slideIndex + 1} element ${args.elementIndex + 1}: image_not_found`);
        }
    }
    const defaults = resolveElementStyleDefaults(args.element, args.theme);
    const boxDefaults = defaults.imageStyle?.box;
    const borderWidthPt = args.element.style?.borderWidthPt ?? boxDefaults?.borderWidth ?? 0;
    const borderColor = normalizeColor(args.element.style?.borderColor, boxDefaults?.border ?? "000000");
    const fillColor = boxDefaults?.fill;
    return {
        kind: "image",
        z: args.z,
        order: args.order,
        id: args.id,
        region: args.element.region,
        variant: args.element.variant,
        bbox: args.bbox,
        src: resolvedPath,
        fit: args.element.fit,
        style: {
            borderColor,
            borderWidthPt,
            fillColor,
        },
    };
}
export function renderImageElement(slide, shapeType, element) {
    if (element.style.fillColor || element.style.borderWidthPt > 0) {
        const shapeOpts = {
            x: element.bbox.x,
            y: element.bbox.y,
            w: element.bbox.width,
            h: element.bbox.height,
        };
        if (element.style.fillColor) {
            shapeOpts.fill = { color: element.style.fillColor };
        }
        else {
            shapeOpts.fill = { type: "none" };
        }
        if (element.style.borderWidthPt > 0) {
            shapeOpts.line = { color: element.style.borderColor, width: element.style.borderWidthPt };
        }
        slide.addShape(shapeType.rect, {
            ...shapeOpts,
        });
    }
    slide.addImage({
        path: element.src,
        x: element.bbox.x,
        y: element.bbox.y,
        w: element.bbox.width,
        h: element.bbox.height,
        sizing: {
            type: element.fit,
            w: element.bbox.width,
            h: element.bbox.height,
        },
    });
}
//# sourceMappingURL=image.js.map